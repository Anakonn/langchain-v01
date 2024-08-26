---
translated: true
---

# PGVector (Postgres)

>[PGVector](https://github.com/pgvector/pgvector) एक `Postgres` डेटाबेस के लिए वेक्टर समानता खोज पैकेज है।

नोटबुक में, हम `PGVector` वेक्टर स्टोर के चारों ओर `SelfQueryRetriever` का प्रदर्शन करेंगे।

## PGVector वेक्टर स्टोर बनाना

पहले हम एक PGVector वेक्टर स्टोर बनाना चाहेंगे और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले छोटे डेमो सेट बनाया है।

**नोट:** सेल्फ-क्वेरी रिट्रीवर के लिए आपके पास `lark` इंस्टॉल होना चाहिए (`pip install lark`)। हमें `` पैकेज भी चाहिए।

```python
%pip install --upgrade --quiet  lark pgvector psycopg2-binary
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import PGVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

collection = "Name of your collection"
embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
vectorstore = PGVector.from_documents(
    docs,
    embeddings,
    collection_name=collection,
)
```

## हमारा सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपने रिट्रीवर को इंस्टैंशिएट कर सकते हैं। ऐसा करने के लिए, हमें अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स के बारे में कुछ जानकारी और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
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
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग `k` को निर्दिष्ट करने के लिए भी कर सकते हैं: लाने वाले दस्तावेजों की संख्या।

हम इसे कंस्ट्रक्टर में `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
