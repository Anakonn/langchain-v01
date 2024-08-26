---
translated: true
---

# Azure Cosmos DB

यह नोटबुक आपको दस्तावेजों को संग्रहों में संग्रहीत करने, सूचकांक बनाने और COS (कोसाइन दूरी), L2 (यूक्लिडियन दूरी) और IP (आंतरिक उत्पाद) जैसे लगभग निकटतम पड़ोसी एल्गोरिदम का उपयोग करके वेक्टर खोज क्वेरी करने के लिए इस एकीकृत [वेक्टर डेटाबेस](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database) का उपयोग करने में मदद करता है।

Azure Cosmos DB वह डेटाबेस है जो OpenAI के ChatGPT सेवा को संचालित करता है। यह एकल अंकों में मिलीसेकंड प्रतिक्रिया समय, स्वचालित और तत्काल स्केलेबिलिटी, और किसी भी स्केल पर गारंटीशुदा गति के साथ प्रदान करता है।

Azure Cosmos DB for MongoDB vCore(https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/) डेवलपर्स को एक पूरी तरह से प्रबंधित MongoDB-संगत डेटाबेस सेवा प्रदान करता है जिसका उपयोग आधुनिक एप्लिकेशन बनाने के लिए किया जा सकता है। आप अपने MongoDB अनुभव को लागू कर सकते हैं और MongoDB ड्राइवर्स, SDK और उपकरणों का उपयोग करना जारी रख सकते हैं क्योंकि आप अपने एप्लिकेशन को MongoDB vCore खाते के कनेक्शन स्ट्रिंग के लिए API पर इंगित करते हैं।

आज शुरू करने के लिए [साइन अप](https://azure.microsoft.com/en-us/free/) करें और आजीवन मुफ्त एक्सेस पाएं।

```python
%pip install --upgrade --quiet  pymongo
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

```python
import os

CONNECTION_STRING = "YOUR_CONNECTION_STRING"
INDEX_NAME = "izzy-test-index"
NAMESPACE = "izzy_test_db.izzy_test_collection"
DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें अन्य पर्यावरण चर के साथ-साथ अपने Azure OpenAI API कुंजी को सेट करना होगा।

```python
# Set up the OpenAI Environment Variables
os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["OPENAI_API_BASE"] = (
    "YOUR_OPEN_AI_ENDPOINT"  # https://example.openai.azure.com/
)
os.environ["OPENAI_API_KEY"] = "YOUR_OPENAI_API_KEY"
os.environ["OPENAI_EMBEDDINGS_DEPLOYMENT"] = (
    "smart-agent-embedding-ada"  # the deployment name for the embedding model
)
os.environ["OPENAI_EMBEDDINGS_MODEL_NAME"] = "text-embedding-ada-002"  # the model name
```

अब, हमें संग्रह में दस्तावेजों को लोड करना, सूचकांक बनाना और फिर सूचकांक के खिलाफ क्वेरी चलाना होगा।

कृपया [प्रलेखन](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search) देखें यदि आपके पास कुछ मापदंडों के बारे में प्रश्न हैं।

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.azure_cosmos_db import (
    AzureCosmosDBVectorSearch,
    CosmosDBSimilarityType,
    CosmosDBVectorSearchType,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

SOURCE_FILE_NAME = "../../modules/state_of_the_union.txt"

loader = TextLoader(SOURCE_FILE_NAME)
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# OpenAI Settings
model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")


openai_embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    deployment=model_deployment, model=model_name, chunk_size=1
)
```

```python
from pymongo import MongoClient

# INDEX_NAME = "izzy-test-index-2"
# NAMESPACE = "izzy_test_db.izzy_test_collection"
# DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")

client: MongoClient = MongoClient(CONNECTION_STRING)
collection = client[DB_NAME][COLLECTION_NAME]

model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")

vectorstore = AzureCosmosDBVectorSearch.from_documents(
    docs,
    openai_embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)

# Read more about these variables in detail here. https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search
num_lists = 100
dimensions = 1536
similarity_algorithm = CosmosDBSimilarityType.COS
kind = CosmosDBVectorSearchType.VECTOR_IVF
m = 16
ef_construction = 64
ef_search = 40
score_threshold = 0.1

vectorstore.create_index(
    num_lists, dimensions, similarity_algorithm, kind, m, ef_construction
)
```

```output
{'raw': {'defaultShard': {'numIndexesBefore': 1,
   'numIndexesAfter': 2,
   'createdCollectionAutomatically': False,
   'ok': 1}},
 'ok': 1}
```

```python
# perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

एक बार जब दस्तावेज लोड हो जाते हैं और सूचकांक बन जाता है, तो आप अब सीधे वेक्टर स्टोर को इंस्टैंशिएट कर सकते हैं और सूचकांक के खिलाफ क्वेरी चला सकते हैं।

```python
vectorstore = AzureCosmosDBVectorSearch.from_connection_string(
    CONNECTION_STRING, NAMESPACE, openai_embeddings, index_name=INDEX_NAME
)

# perform a similarity search between a query and the ingested documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)

print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
vectorstore = AzureCosmosDBVectorSearch(
    collection, openai_embeddings, index_name=INDEX_NAME
)

# perform a similarity search between a query and the ingested documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)

print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
