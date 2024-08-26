---
translated: true
---

# वेक्टारा के साथ दस्तावेजों पर चैट करें

# सेटअप

वेक्टारा के साथ LangChain का उपयोग करने के लिए आपको एक वेक्टारा खाता की आवश्यकता होगी। शुरू करने के लिए, निम्नलिखित चरणों का उपयोग करें:
1. यदि आपके पास पहले से कोई खाता नहीं है, तो [साइन अप](https://www.vectara.com/integrations/langchain) करें। एक बार साइन अप करने के बाद, आपके पास एक वेक्टारा ग्राहक आईडी होगी। आप वेक्टारा कंसोल विंडो के शीर्ष-दाईं ओर अपने नाम पर क्लिक करके अपना ग्राहक आईडी ढूंढ सकते हैं।
2. अपने खाते में आप एक या अधिक कॉर्पस बना सकते हैं। प्रत्येक कॉर्पस इनपुट दस्तावेजों से टेक्स्ट डेटा को संग्रहीत करने वाले क्षेत्र का प्रतिनिधित्व करता है। कॉर्पस बनाने के लिए **"Create Corpus"** बटन का उपयोग करें। फिर आप अपने कॉर्पस को एक नाम और विवरण प्रदान करते हैं। वैकल्पिक रूप से, आप फ़िल्टरिंग गुण परिभाषित कर सकते हैं और कुछ उन्नत विकल्प लागू कर सकते हैं। यदि आप अपने बनाए गए कॉर्पस पर क्लिक करते हैं, तो आप इसका नाम और कॉर्पस आईडी शीर्ष पर देख सकते हैं।
3. अगला कदम API कुंजियां बनाना है ताकि कॉर्पस तक पहुंच प्राप्त की जा सके। कॉर्पस दृश्य में **"Authorization"** टैब पर क्लिक करें और फिर **"Create API Key"** बटन पर क्लिक करें। अपनी कुंजी को एक नाम दें और क्या आप केवल क्वेरी या क्वेरी+इंडेक्स चाहते हैं, यह चुनें। "Create" पर क्लिक करें और अब आपके पास एक सक्रिय API कुंजी है। इस कुंजी को गोपनीय रखें।

LangChain के साथ वेक्टारा का उपयोग करने के लिए, आपको इन तीन मूल्यों की आवश्यकता होगी: ग्राहक आईडी, कॉर्पस आईडी और api_key।
आप LangChain को इन मूल्यों को दो तरीकों से प्रदान कर सकते हैं:

1. अपने वातावरण में इन तीन चरों को शामिल करें: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` और `VECTARA_API_KEY`।

> उदाहरण के लिए, आप os.environ और getpass का उपयोग करके इन चरों को सेट कर सकते हैं:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. उन्हें वेक्टारा वेक्टर स्टोर निर्माता में जोड़ें:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
import os

from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Vectara
from langchain_openai import OpenAI
```

दस्तावेज लोड करें। आप इसे किसी भी प्रकार के डेटा के लिए लोडर से बदल सकते हैं।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
```

चूंकि हम वेक्टारा का उपयोग कर रहे हैं, इसलिए दस्तावेजों को टुकड़ों में बांटने की आवश्यकता नहीं है, क्योंकि यह वेक्टारा प्लेटफ़ॉर्म बैकएंड में स्वचालित रूप से किया जाता है। हम केवल `from_document()` का उपयोग करते हैं ताकि फ़ाइल से लोड की गई पाठ को अपलोड किया जा सके और इसे सीधे वेक्टारा में अंतर्भुक्त किया जा सके:

```python
vectara = Vectara.from_documents(documents, embedding=None)
```

अब हम एक मेमोरी ऑब्जेक्ट बना सकते हैं, जो इनपुट/आउटपुट को ट्रैक करने और एक वार्तालाप को बनाए रखने के लिए आवश्यक है।

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

अब हम `ConversationalRetrievalChain` को प्रारंभ करते हैं:

```python
openai_api_key = os.environ["OPENAI_API_KEY"]
llm = OpenAI(openai_api_key=openai_api_key, temperature=0)
retriever = vectara.as_retriever()
d = retriever.invoke("What did the president say about Ketanji Brown Jackson", k=2)
print(d)
```

```output
[Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'}), Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '1083', 'len': '117'}), Document(page_content='All told, we created 369,000 new manufacturing jobs in America just last year. Powered by people I’ve met like JoJo Burgess, from generations of union steelworkers from Pittsburgh, who’s here with us tonight. As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” It’s time. \n\nBut with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills. Inflation is robbing them of the gains they might otherwise feel.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '14257', 'len': '77'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. Cancer is the #2 cause of death in America–second only to heart disease. Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases. More support for patients and families.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36196', 'len': '122'}), Document(page_content='Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68'}), Document(page_content='I understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. That’s why one of the first things I did as President was fight to pass the American Rescue Plan. Because people were hurting. We needed to act, and we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '8042', 'len': '97'}), Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2100', 'len': '42'}), Document(page_content='He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28'}), Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '2053', 'len': '46'}), Document(page_content='A unity agenda for the nation. We can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. We have fought for freedom, expanded liberty, defeated totalitarianism and terror. And built the strongest, freest, and most prosperous nation the world has ever known.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '36968', 'len': '131'})]
```

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, retriever, memory=memory, verbose=False
)
```

और अब हम अपने नए बॉट के साथ एक बहु-दौर वार्तालाप कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

```python
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## चैट इतिहास पास करें

उपरोक्त उदाहरण में, हमने चैट इतिहास को ट्रैक करने के लिए एक मेमोरी ऑब्जेक्ट का उपयोग किया। हम इसे स्पष्ट रूप से भी पास कर सकते हैं। ऐसा करने के लिए, हमें किसी भी मेमोरी ऑब्जेक्ट के बिना एक श्रृंखला प्रारंभ करने की आवश्यकता है।

```python
bot = ConversationalRetrievalChain.from_llm(
    OpenAI(temperature=0), vectara.as_retriever()
)
```

यहां कोई चैट इतिहास न होने पर एक प्रश्न पूछने का एक उदाहरण है।

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```

यहां कुछ चैट इतिहास के साथ एक प्रश्न पूछने का एक उदाहरण है।

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
' Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.'
```

## स्रोत दस्तावेज लौटाएं

आप ConversationalRetrievalChain से स्रोत दस्तावेज भी आसानी से लौटा सकते हैं। यह तब उपयोगी है जब आप जानना चाहते हैं कि कौन से दस्तावेज वापस किए गए थे।

```python
bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), return_source_documents=True
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["source_documents"][0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '29486', 'len': '97'})
```

## `map_reduce` के साथ ConversationalRetrievalChain

LangChain दस्तावेज श्रृंखलाओं को ConversationalRetrievalChain श्रृंखला के साथ जोड़ने के विभिन्न प्रकारों का समर्थन करता है।

```python
from langchain.chains import LLMChain
from langchain.chains.conversational_retrieval.prompts import CONDENSE_QUESTION_PROMPT
from langchain.chains.question_answering import load_qa_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson, who is one of the nation's top legal minds and a former top litigator in private practice."
```

## स्रोतों के साथ प्रश्न उत्तर के साथ ConversationalRetrievalChain

आप इस श्रृंखला का उपयोग स्रोतों के साथ प्रश्न उत्तर श्रृंखला के साथ भी कर सकते हैं।

```python
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
```

```python
question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_with_sources_chain(llm, chain_type="map_reduce")

chain = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    question_generator=question_generator,
    combine_docs_chain=doc_chain,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = chain({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice.\nSOURCES: langchain"
```

## `stdout` पर स्ट्रीमिंग के साथ ConversationalRetrievalChain

इस उदाहरण में, श्रृंखला से आउटपुट को टोकन-दर-टोकन `stdout` पर स्ट्रीम किया जाएगा।

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain

# Construct a ConversationalRetrievalChain with a streaming llm for combine docs
# and a separate, non-streaming llm for question generation
llm = OpenAI(temperature=0, openai_api_key=openai_api_key)
streaming_llm = OpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
    temperature=0,
    openai_api_key=openai_api_key,
)

question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
doc_chain = load_qa_chain(streaming_llm, chain_type="stuff", prompt=QA_PROMPT)

bot = ConversationalRetrievalChain(
    retriever=vectara.as_retriever(),
    combine_docs_chain=doc_chain,
    question_generator=question_generator,
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence.
```

```python
chat_history = [(query, result["answer"])]
query = "Did he mention who she suceeded"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```output
 Ketanji Brown Jackson succeeded Justice Breyer on the United States Supreme Court.
```

## get_chat_history फ़ंक्शन

आप एक `get_chat_history` फ़ंक्शन भी निर्दिष्ट कर सकते हैं, जिसका उपयोग चैट_इतिहास स्ट्रिंग को प्रारूपित करने के लिए किया जा सकता है।

```python
def get_chat_history(inputs) -> str:
    res = []
    for human, ai in inputs:
        res.append(f"Human:{human}\nAI:{ai}")
    return "\n".join(res)


bot = ConversationalRetrievalChain.from_llm(
    llm, vectara.as_retriever(), get_chat_history=get_chat_history
)
```

```python
chat_history = []
query = "What did the president say about Ketanji Brown Jackson"
result = bot.invoke({"question": query, "chat_history": chat_history})
```

```python
result["answer"]
```

```output
" The president said that Ketanji Brown Jackson is one of the nation's top legal minds and a former top litigator in private practice, and that she will continue Justice Breyer's legacy of excellence."
```
