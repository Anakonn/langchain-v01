---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/) एक दस्तावेज़ डेटाबेस है जिसका उपयोग वेक्टर डेटाबेस के रूप में किया जा सकता है।

वॉकथ्रू में, हम `MongoDB Atlas` वेक्टर स्टोर के साथ `SelfQueryRetriever` का प्रदर्शन करेंगे।

## MongoDB Atlas वेक्टरस्टोर बनाना

पहले हम एक MongoDB Atlas VectorStore बनाएंगे और इसे कुछ डेटा से भरेंगे। हमने फिल्मों के सारांश वाले कुछ छोटे डेमो सेट बनाए हैं।

नोट: सेल्फ-क्वेरी रिट्रीवर के लिए आपको `lark` इंस्टॉल करना होगा (`pip install lark`)। हमें `pymongo` पैकेज भी चाहिए।

```python
%pip install --upgrade --quiet  lark pymongo
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import os

OPENAI_API_KEY = "Use your OpenAI key"

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from pymongo import MongoClient

CONNECTION_STRING = "Use your MongoDB Atlas connection string"
DB_NAME = "Name of your MongoDB Atlas database"
COLLECTION_NAME = "Name of your collection in the database"
INDEX_NAME = "Name of a search index defined on the collection"

MongoClient = MongoClient(CONNECTION_STRING)
collection = MongoClient[DB_NAME][COLLECTION_NAME]

embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated", "rating": 9.3},
    ),
]

vectorstore = MongoDBAtlasVectorSearch.from_documents(
    docs,
    embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)
```

अब, अपने क्लस्टर पर एक वेक्टर सर्च इंडेक्स बनाएं। नीचे दिए गए उदाहरण में, `embedding` वह फ़ील्ड का नाम है जो एम्बेडिंग वेक्टर को संग्रहीत करता है। अधिक जानकारी के लिए कृपया [documentation](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector) देखें।
आप इंडेक्स का नाम `{COLLECTION_NAME}` रख सकते हैं और `{DB_NAME}.{COLLECTION_NAME}` नेमस्पेस पर इंडेक्स बना सकते हैं। अंत में, MongoDB Atlas पर JSON एडिटर में निम्नलिखित परिभाषा लिखें:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "genre": {
        "type": "token"
      },
      "ratings": {
        "type": "number"
      },
      "year": {
        "type": "number"
      }
    }
  }
}
```

## हमारा सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपना रिट्रीवर इंस्टैंशिएट कर सकते हैं। इसके लिए हमें अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स और दस्तावेज़ की सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
```

```python
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## इसका परीक्षण करना

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```

```python
# This example only specifies a query and a filter
retriever.invoke("I want to watch a movie about toys rated higher than 9")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above or equal 9) thriller film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग `k` को निर्दिष्ट करने के लिए भी कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे कंस्ट्रक्टर में `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```
