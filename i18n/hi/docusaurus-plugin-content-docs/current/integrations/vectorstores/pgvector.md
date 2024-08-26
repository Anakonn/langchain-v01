---
translated: true
---

यह कोड एक `postgres` बैकएंड का उपयोग करते हुए `pgvector` एक्सटेंशन का उपयोग करके `langchain` वेक्टर स्टोर एब्स्ट्रैक्शन का एक कार्यान्वयन है।

कोड एक एकीकरण पैकेज में मौजूद है: [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/)।

आप एक `pgvector` एक्सटेंशन के साथ एक postgres कंटेनर शुरू करने के लिए निम्नलिखित कमांड चला सकते हैं:

```shell
docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

## स्थिति

यह कोड `langchain_community` से `langchain-postgres` नामक एक समर्पित पैकेज में पोर्ट किया गया है। निम्नलिखित परिवर्तन किए गए हैं:

* langchain_postgres केवल psycopg3 के साथ काम करता है। कृपया अपने कनेक्शन स्ट्रिंग को `postgresql+psycopg2://...` से `postgresql+psycopg://langchain:langchain@...` में अपडेट करें (हाँ, ड्राइवर का नाम `psycopg` है, न कि `psycopg3`, लेकिन यह `psycopg3` का उपयोग करेगा)।
* एम्बेडिंग स्टोर और संग्रह के स्कीमा को उपयोगकर्ता द्वारा निर्दिष्ट आईडी के साथ add_documents काम करने के लिए सही तरीके से बदल दिया गया है।
* अब एक स्पष्ट कनेक्शन ऑब्जेक्ट पास करना होगा।

वर्तमान में, स्कीमा परिवर्तनों पर आसान डेटा माइग्रेशन का कोई तंत्र **नहीं** है। इसलिए वेक्टर स्टोर में किसी भी स्कीमा परिवर्तन के लिए उपयोगकर्ता को तालिकाओं को फिर से बनाना और दस्तावेज़ों को फिर से जोड़ना होगा।
यदि यह चिंता है, तो कृपया किसी अन्य वेक्टर स्टोर का उपयोग करें। अन्यथा, यह कार्यान्वयन आपके उपयोग मामले के लिए ठीक होना चाहिए।

## निर्भरताएं स्थापित करें

यहाँ, हम एम्बेडिंग के लिए `langchain_cohere` का उपयोग कर रहे हैं, लेकिन आप अन्य एम्बेडिंग प्रदाताओं का भी उपयोग कर सकते हैं।

```python
!pip install --quiet -U langchain_cohere
!pip install --quiet -U langchain_postgres
```

## वेक्टर स्टोर को इनिशियलाइज़ करें

```python
from langchain_cohere import CohereEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"
embeddings = CohereEmbeddings()

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## टेबल ड्रॉप करें

यदि आपको टेबल ड्रॉप करने की आवश्यकता है (उदाहरण के लिए, एम्बेडिंग को अलग आयाम में अपडेट करना या केवल एम्बेडिंग प्रदाता को अपडेट करना):

```python
vectorstore.drop_tables()
```

## दस्तावेज़ जोड़ें

वेक्टर स्टोर में दस्तावेज़ जोड़ें

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

```python
vectorstore.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```python
vectorstore.similarity_search("kitty", k=10)
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'})]
```

आईडी के अनुसार दस्तावेज़ जोड़ने से मौजूदा दस्तावेज़ों को ओवरराइट कर दिया जाएगा जो उस आईडी से मेल खाते हैं।

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

## फ़िल्टरिंग समर्थन

वेक्टर स्टोर दस्तावेज़ों के मेटाडेटा फ़ील्ड्स के खिलाफ लागू किए जा सकने वाले एक सेट फ़िल्टर का समर्थन करता है।

| ऑपरेटर | अर्थ/श्रेणी        |
|----------|-------------------------|
| \$eq      | समानता (==)           |
| \$ne      | असमानता (!=)         |
| \$lt      | कम से कम (<)           |
| \$lte     | कम से कम या बराबर (<=) |
| \$gt      | अधिक से अधिक (>)        |
| \$gte     | अधिक से अधिक या बराबर (>=) |
| \$in      | विशेष मामला (in)      |
| \$nin     | विशेष मामला (not in)  |
| \$between | विशेष मामला (between) |
| \$like    | पाठ (like)             |
| \$ilike   | पाठ (case-insensitive like) |
| \$and     | तार्किक (and)           |
| \$or      | तार्किक (or)            |

```python
vectorstore.similarity_search("kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}})
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'})]
```

यदि आप एक फ़ील्ड के साथ एक डिक्शनरी प्रदान करते हैं, लेकिन कोई ऑपरेटर नहीं, तो शीर्ष स्तर को एक तार्किक **AND** फ़िल्टर के रूप में व्याख्या किया जाएगा।

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search("bird", k=10, filter={"location": {"$ne": "pond"}})
```

```output
[Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'})]
```
