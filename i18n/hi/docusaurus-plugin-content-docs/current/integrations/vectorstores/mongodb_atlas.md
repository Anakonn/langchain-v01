---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/) AWS, Azure, और GCP में उपलब्ध एक पूरी तरह से प्रबंधित क्लाउड डेटाबेस है। अब इसमें आपके MongoDB दस्तावेज़ डेटा पर मूल Vector Search का समर्थन है।

यह नोटबुक दिखाती है कि [MongoDB Atlas Vector Search](https://www.mongodb.com/products/platform/atlas-vector-search) का उपयोग कैसे करें ताकि आप अपने एम्बेडिंग्स को MongoDB दस्तावेजों में स्टोर कर सकें, एक वेक्टर सर्च इंडेक्स बना सकें, और एक अनुमानित निकटतम पड़ोसी एल्गोरिदम (`Hierarchical Navigable Small Worlds`) के साथ KNN सर्च कर सकें। यह [$vectorSearch MQL Stage](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/) का उपयोग करता है।

MongoDB Atlas का उपयोग करने के लिए, आपको पहले एक क्लस्टर तैनात करना होगा। हमारे पास क्लस्टर्स का एक फॉरएवर-फ्री टियर उपलब्ध है। शुरू करने के लिए यहाँ Atlas पर जाएँ: [quick start](https://www.mongodb.com/docs/atlas/getting-started/)।

> नोट:
>
>* अधिक दस्तावेज़ीकरण [LangChain-MongoDB साइट](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/) पर पाया जा सकता है
>* यह सुविधा सामान्य रूप से उपलब्ध है और उत्पादन तैनाती के लिए तैयार है।
>* Langchain संस्करण 0.0.305 ([रिलीज़ नोट्स](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305))) $vectorSearch MQL स्टेज के समर्थन की शुरुआत करता है, जो MongoDB Atlas 6.0.11 और 7.0.2 के साथ उपलब्ध है। पहले के संस्करणों का उपयोग करने वाले उपयोगकर्ताओं को अपने LangChain संस्करण को <=0.0.304 पर पिन करना होगा
>

इस नोटबुक में हम यह प्रदर्शित करेंगे कि MongoDB Atlas, OpenAI और Langchain का उपयोग करके `Retrieval Augmented Generation` (RAG) कैसे करें। हम समानता खोज, पूर्व-फ़िल्टरिंग के साथ समानता खोज, और PDF दस्तावेज़ के ऊपर प्रश्न उत्तर करेंगे [GPT 4 तकनीकी रिपोर्ट](https://arxiv.org/pdf/2303.08774.pdf) जो मार्च 2023 में आई और इसलिए OpenAI के बड़े भाषा मॉडल(LLM) की पैरामेट्रिक मेमोरी का हिस्सा नहीं है, जिसकी नॉलेज कटऑफ सितंबर 2021 थी।

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं इसलिए हमें अपना OpenAI API Key सेटअप करने की आवश्यकता है।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

अब हम MongoDB Atlas क्लस्टर के लिए पर्यावरण चर सेटअप करेंगे

```python
%pip install --upgrade --quiet  langchain pypdf pymongo langchain-openai tiktoken
```

```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

```python
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
```

## वेक्टर सर्च इंडेक्स बनाएं

अब, आइए अपने क्लस्टर पर एक वेक्टर सर्च इंडेक्स बनाएं। अधिक विस्तृत चरण [LangChain के लिए वेक्टर सर्च इंडेक्स बनाएं](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/#create-the-atlas-vector-search-index) अनुभाग में पाए जा सकते हैं। नीचे दिए गए उदाहरण में, `embedding` वह फ़ील्ड का नाम है जिसमें एम्बेडिंग वेक्टर होता है। MongoDB Atlas वेक्टर सर्च इंडेक्स को परिभाषित करने के बारे में अधिक विवरण प्राप्त करने के लिए कृपया [दस्तावेज़ीकरण](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/) देखें।
आप इंडेक्स को `{ATLAS_VECTOR_SEARCH_INDEX_NAME}` नाम दे सकते हैं और इंडेक्स को नेमस्पेस `{DB_NAME}.{COLLECTION_NAME}` पर बना सकते हैं। अंत में, निम्नलिखित परिभाषा को MongoDB Atlas पर JSON संपादक में लिखें:

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

# डेटा डालें

```python
from langchain_community.document_loaders import PyPDFLoader

# Load the PDF
loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
data = loader.load()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.split_documents(data)
```

```python
print(docs[0])
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

```python
# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What were the compute requirements for training GPT 4"
results = vector_search.similarity_search(query)

print(results[0].page_content)
```

# डेटा क्वेरी करना

हम सीधे वेक्टर स्टोर को इंस्टैंटिएट कर सकते हैं और निम्नलिखित के रूप में एक क्वेरी निष्पादित कर सकते हैं:

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_search = MongoDBAtlasVectorSearch.from_connection_string(
    MONGODB_ATLAS_CLUSTER_URI,
    DB_NAME + "." + COLLECTION_NAME,
    OpenAIEmbeddings(disallowed_special=()),
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

## समानता खोज के साथ पूर्व-फ़िल्टरिंग

Atlas Vector Search MQL ऑपरेटर्स का उपयोग करके पूर्व-फ़िल्टरिंग का समर्थन करता है। नीचे वही डेटा लोड किए गए उदाहरण इंडेक्स और क्वेरी का एक उदाहरण है जो "page" फ़ील्ड पर मेटाडेटा फ़िल्टरिंग करने की अनुमति देता है। आप परिभाषित फ़िल्टर के साथ अपने मौजूदा इंडेक्स को अपडेट कर सकते हैं और वेक्टर सर्च के साथ पूर्व-फ़िल्टरिंग कर सकते हैं।

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "page"
    }
  ]
}
```

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)
```

## स्कोर के साथ समानता खोज

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query,
    k=5,
)

# Display results
for result in results:
    print(result)
```

## प्रश्न उत्तर

```python
qa_retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```

GPT-4 को पहले के GPT मॉडलों की तुलना में काफी अधिक कंप्यूट की आवश्यकता होती है। OpenAI के आंतरिक कोडबेस से व्युत्पन्न डेटासेट पर, GPT-4 को न्यूनतम हानि तक पहुंचने के लिए 100p (petaflops) कंप्यूट की आवश्यकता होती है, जबकि छोटे मॉडलों को 1-10n (nanoflops) की आवश्यकता होती है।
