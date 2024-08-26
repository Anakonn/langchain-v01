---
translated: true
---

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# Maritalk

## परिचय

MariTalk एक ब्राजीलियाई कंपनी [Maritaca AI](https://www.maritaca.ai) द्वारा विकसित एक सहायक है।
MariTalk भाषा मॉडलों पर आधारित है जिन्हें पुर्तगाली को अच्छी तरह से समझने के लिए विशेष रूप से प्रशिक्षित किया गया है।

यह नोटबुक LangChain के माध्यम से MariTalk का उपयोग करने के दो उदाहरण दिखाता है:

1. MariTalk का उपयोग करके एक कार्य को करने का एक सरल उदाहरण।
2. LLM + RAG: दूसरा उदाहरण दिखाता है कि जब उत्तर एक लंबे दस्तावेज में पाया जाता है जो MariTalk के टोकन सीमा के भीतर नहीं फिट होता है, तो कैसे प्रश्न का उत्तर दिया जा सकता है। इसके लिए, हम पहले प्रासंगिक खंडों को खोजने के लिए एक सरल खोजकर्ता (BM25) का उपयोग करेंगे और फिर उन्हें उत्तर देने के लिए MariTalk को फीड करेंगे।

## स्थापना

पहले, निम्नलिखित कमांड का उपयोग करके LangChain लाइब्रेरी (और उसकी सभी निर्भरताएं) स्थापित करें:

```python
!pip install langchain langchain-core langchain-community httpx
```

## API कुंजी

आपको एक API कुंजी की आवश्यकता होगी जिसे chat.maritaca.ai से प्राप्त किया जा सकता है ("Chaves da API" अनुभाग)।

### उदाहरण 1 - पालतू जानवर के नाम के सुझाव

चलो अपने भाषा मॉडल, ChatMaritalk, को परिभाषित करें और अपनी API कुंजी के साथ कॉन्फ़िगर करें।

```python
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # Available models: sabia-2-small and sabia-2-medium
    api_key="",  # Insert your API key here
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an assistant specialized in suggesting pet names. Given the animal, you must suggest 4 names.",
        ),
        ("human", "I have a {animal}"),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # should answer something like "1. Max\n2. Bella\n3. Charlie\n4. Rocky"
```

### स्ट्रीम जनरेशन

लंबे पाठ के उत्पादन वाले कार्यों के लिए, जैसे कि एक व्यापक लेख बनाना या एक बड़े दस्तावेज का अनुवाद करना, पूर्ण पाठ का इंतजार करने के बजाय पाठ के हिस्सों को प्राप्त करना लाभदायक हो सकता है क्योंकि यह उत्पन्न किया जा रहा है। यह अनुप्रयोग को अधिक प्रतिक्रियाशील और कुशल बनाता है, खासकर जब उत्पन्न पाठ व्यापक होता है। हम इस आवश्यकता को पूरा करने के लिए दो दृष्टिकोण प्रदान करते हैं: एक समकालिक और दूसरा असमकालिक।

#### समकालिक:

```python
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="Suggest 3 names for my dog")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### असमकालिक:

```python
from langchain_core.messages import HumanMessage


async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"Suggest 3 names for my {animal}")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)


await async_invoke_chain("dog")
```

### उदाहरण 2 - RAG + LLM: UNICAMP 2024 प्रवेश परीक्षा प्रश्न उत्तर प्रणाली

इस उदाहरण के लिए, हमें कुछ अतिरिक्त लाइब्रेरियों की स्थापना करने की आवश्यकता है:

```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### डेटाबेस लोड करना

पहला कदम नोटिस से जानकारी के साथ एक डेटाबेस बनाना है। इसके लिए, हम COMVEST वेबसाइट से नोटिस डाउनलोड करेंगे और निकाले गए पाठ को 500 वर्णों के विंडो में विभाजित करेंगे।

```python
from langchain.document_loaders import OnlinePDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Loading the COMVEST 2024 notice
loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### एक खोजकर्ता बनाना

अब जब हमारे पास हमारा डेटाबेस है, तो हमें एक खोजकर्ता की आवश्यकता है। इस उदाहरण के लिए, हम एक सरल BM25 का उपयोग करेंगे, लेकिन इसे किसी अन्य खोजकर्ता (जैसे एम्बेडिंग के माध्यम से खोज) से प्रतिस्थापित किया जा सकता है।

```python
from langchain.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### खोज प्रणाली + LLM का संयोजन

अब जब हमारे पास हमारा खोजकर्ता है, तो हमें केवल कार्य निर्दिष्ट करने वाले प्रॉम्प्ट को लागू करना और श्रृंखला को आमंत्रित करना है।

```python
from langchain.chains.question_answering import load_qa_chain

prompt = """Baseado nos seguintes documentos, responda a pergunta abaixo.

{context}

Pergunta: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "Qual o tempo máximo para realização da prova?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # Should output something like: "O tempo máximo para realização da prova é de 5 horas."
```
