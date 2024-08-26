---
translated: true
---

यह पृष्ठ [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) का उपयोग करने के लिए एक त्वरित शुरुआत प्रदान करता है।

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) एक सर्वरलेस वेक्टर-सक्षम डेटाबेस है जो Apache Cassandra® पर निर्मित है और सुविधाजनक JSON API के माध्यम से उपलब्ध कराया गया है।

_नोट: डेटाबेस तक पहुंच के अलावा, पूर्ण उदाहरण चलाने के लिए एक OpenAI API कुंजी की आवश्यकता है।_

## सेटअप और सामान्य निर्भरताएं

एकीकरण का उपयोग करने के लिए संबंधित Python पैकेज की आवश्यकता होती है:

```python
pip install --upgrade langchain-astradb
```

_**नोट।** निम्नलिखित सभी पैकेज इस पृष्ठ पर पूर्ण डेमो चलाने के लिए आवश्यक हैं। आपके LangChain सेटअप पर निर्भर करते हुए, उनमें से कुछ को स्थापित करना आवश्यक हो सकता है:_

```python
pip install langchain langchain-openai datasets pypdf
```

### निर्भरताओं को आयात करें

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## वेक्टर स्टोर को आयात करें

```python
from langchain_astradb import AstraDBVectorStore
```

## कनेक्शन पैरामीटर

ये आपके Astra DB डैशबोर्ड पर पाए जाते हैं:

- API Endpoint इस तरह दिखता है `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
- टोकन इस तरह दिखता है `AstraCS:6gBhNmsk135....`
- आप वैकल्पिक रूप से एक _Namespace_ जैसे `my_namespace` प्रदान कर सकते हैं

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = input("(optional) Namespace = ")
if desired_namespace:
    ASTRA_DB_KEYSPACE = desired_namespace
else:
    ASTRA_DB_KEYSPACE = None
```

अब आप वेक्टर स्टोर बना सकते हैं:

```python
vstore = AstraDBVectorStore(
    embedding=embe,
    collection_name="astra_vector_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_KEYSPACE,
)
```

## एक डेटासेट लोड करें

स्रोत डेटासेट में प्रत्येक प्रविष्टि को `Document` में रूपांतरित करें, फिर उन्हें वेक्टर स्टोर में लिखें:

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

उपरोक्त में, `metadata` डिक्शनरी स्रोत डेटा से बनाए जाते हैं और `Document` का हिस्सा हैं।

_नोट: [Astra DB API Docs](https://docs.datastax.com/en/astra-serverless/docs/develop/dev-with-json.html#_json_api_limits) में मान्य metadata फ़ील्ड नामों की जांच करें: कुछ वर्ण आरक्षित हैं और उनका उपयोग नहीं किया जा सकता।_

और प्रविष्टियां जोड़ें, इस बार `add_texts` का उपयोग करके:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_नोट: आप `add_texts` और `add_documents` के निष्पादन को तेज करने के लिए इन बल्क ऑपरेशनों के लिए कंकरेंसी स्तर को बढ़ा सकते हैं - क्लास निर्माता में `*_concurrency` पैरामीटर और `add_texts` दस्तावेज़ीकरण में अधिक विवरण देखें। नेटवर्क और क्लाइंट मशीन विनिर्देशों पर निर्भर करते हुए, आपका सर्वश्रेष्ठ प्रदर्शन करने वाला पैरामीटर चयन भिन्न हो सकता है।_

## खोज चलाएं

यह खंड मेटाडेटा फ़िल्टरिंग और समानता स्कोर प्राप्त करने का प्रदर्शन करता है:

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### MMR (अधिकतम-सीमांत-प्रासंगिकता) खोज

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

### असिंक्रोनस

ध्यान दें कि Astra DB वेक्टर स्टोर सभी पूर्ण असिंक्रोनस विधियों (`asimilarity_search`, `afrom_texts`, `adelete` आदि) का समर्थन करता है, यानी बिना किसी थ्रेड रैपिंग के शामिल।

## संग्रहित दस्तावेज़ों को हटाना

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## एक न्यूनतम RAG श्रृंखला

अगले कोशिकाएं एक सरल RAG पाइपलाइन को कार्यान्वित करेंगी:
- एक नमूना PDF फ़ाइल डाउनलोड करें और उसे स्टोर पर लोड करें;
- LCEL (LangChain Expression Language) के साथ एक RAG श्रृंखला बनाएं, जिसमें वेक्टर स्टोर केंद्र में हो;
- प्रश्न-उत्तर श्रृंखला चलाएं।

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

अधिक जानकारी के लिए, Astra DB का उपयोग करते हुए एक पूर्ण RAG टेम्प्लेट यहां देखें [यहां](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb)।

## सफाई

यदि आप अपने Astra DB इंस्टेंस से संग्रह को पूरी तरह से हटाना चाहते हैं, तो यह चलाएं।

_(आप इसमें संग्रहित डेटा को खो देंगे।)_

```python
vstore.delete_collection()
```
