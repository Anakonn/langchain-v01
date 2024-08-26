---
translated: true
---

# SAP HANA Cloud Vector Engine

>[SAP HANA Cloud Vector Engine](https://www.sap.com/events/teched/news-guide/ai.html#article8) एक वेक्टर स्टोर है जो `SAP HANA Cloud` डेटाबेस में पूरी तरह से एकीकृत है।

## सेटअप करना

HANA डेटाबेस ड्राइवर की स्थापना।

```python
# Pip install necessary package
%pip install --upgrade --quiet  hdbcli
```

`OpenAIEmbeddings` के लिए हम वातावरण से OpenAI API कुंजी का उपयोग करते हैं।

```python
import os
# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
```

एक HANA Cloud इंस्टेंस के लिए डेटाबेस कनेक्शन बनाएं।

```python
from hdbcli import dbapi

# Use connection settings from the environment
connection = dbapi.connect(
    address=os.environ.get("HANA_DB_ADDRESS"),
    port=os.environ.get("HANA_DB_PORT"),
    user=os.environ.get("HANA_DB_USER"),
    password=os.environ.get("HANA_DB_PASSWORD"),
    autocommit=True,
    sslValidateCertificate=False,
)
```

## उदाहरण

"state_of_the_union.txt" नमूना दस्तावेज़ लोड करें और इससे टुकड़े बनाएं।

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hanavector import HanaDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
text_chunks = text_splitter.split_documents(text_documents)
print(f"Number of document chunks: {len(text_chunks)}")

embeddings = OpenAIEmbeddings()
```

HANA डेटाबेस के लिए एक LangChain VectorStore इंटरफ़ेस बनाएं और वेक्टर एम्बेडिंग्स तक पहुंचने के लिए टेबल (संग्रह) निर्दिष्ट करें।

```python
db = HanaDB(
    embedding=embeddings, connection=connection, table_name="STATE_OF_THE_UNION"
)
```

लोड किए गए दस्तावेज़ के टुकड़ों को टेबल में जोड़ें। इस उदाहरण के लिए, हम पिछले रनों से मौजूद किसी भी पिछले सामग्री को टेबल से हटा देते हैं।

```python
# Delete already existing documents from the table
db.delete(filter={})

# add the loaded document chunks
db.add_documents(text_chunks)
```

पिछले चरण में जोड़े गए दस्तावेज़ के टुकड़ों में से दो सबसे अच्छी मैच प्राप्त करने के लिए एक क्वेरी करें।
डिफ़ॉल्ट रूप से "कोसाइन समानता" का उपयोग खोज के लिए किया जाता है।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)

for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

"यूक्लिडियन दूरी" के साथ समान सामग्री पर क्वेरी करें। परिणाम "कोसाइन समानता" के साथ समान होने चाहिए।

```python
from langchain_community.vectorstores.utils import DistanceStrategy

db = HanaDB(
    embedding=embeddings,
    connection=connection,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
    table_name="STATE_OF_THE_UNION",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## अधिकतम सीमांत प्रासंगिकता खोज (MMR)

`अधिकतम सीमांत प्रासंगिकता` क्वेरी के समानता और चयनित दस्तावेजों की विविधता को अनुकूलित करता है। पहले 20 (fetch_k) आइटम डीबी से पुनः प्राप्त किए जाएंगे। MMR एल्गोरिदम सबसे अच्छे 2 (k) मैच ढूंढेगा।

```python
docs = db.max_marginal_relevance_search(query, k=2, fetch_k=20)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## मूलभूत वेक्टरस्टोर ऑपरेशन

```python
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_BASIC"
)

# Delete already existing documents from the table
db.delete(filter={})
```

हम मौजूदा टेबल में सरल पाठ दस्तावेज़ जोड़ सकते हैं।

```python
docs = [Document(page_content="Some text"), Document(page_content="Other docs")]
db.add_documents(docs)
```

मेटाडेटा के साथ दस्तावेज़ जोड़ें।

```python
docs = [
    Document(
        page_content="foo",
        metadata={"start": 100, "end": 150, "doc_name": "foo.txt", "quality": "bad"},
    ),
    Document(
        page_content="bar",
        metadata={"start": 200, "end": 250, "doc_name": "bar.txt", "quality": "good"},
    ),
]
db.add_documents(docs)
```

विशिष्ट मेटाडेटा के साथ दस्तावेज़ क्वेरी करें।

```python
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
# With filtering on "quality"=="bad", only one document should be returned
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

विशिष्ट मेटाडेटा के साथ दस्तावेज़ हटाएं।

```python
db.delete(filter={"quality": "bad"})

# Now the similarity search with the same filter will return no results
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
print(len(docs))
```

## उन्नत फ़िल्टरिंग

मूल मान-आधारित फ़िल्टरिंग क्षमताओं के अलावा, अधिक उन्नत फ़िल्टरिंग का उपयोग किया जा सकता है।
नीचे दी गई तालिका उपलब्ध फ़िल्टर ऑपरेटरों को दर्शाती है।

| ऑपरेटर | अर्थ                 |
|----------|-------------------------|
| `$eq`    | समानता (==)           |
| `$ne`    | असमानता (!=)         |
| `$lt`    | कम से कम (<)           |
| `$lte`   | कम से कम या बराबर (<=) |
| `$gt`    | अधिक से अधिक (>)        |
| `$gte`   | अधिक से अधिक या बराबर (>=) |
| `$in`    | दिए गए मूल्यों के सेट में शामिल (in)    |
| `$nin`   | दिए गए मूल्यों के सेट में शामिल नहीं (not in)  |
| `$between` | दो सीमा मूल्यों के बीच की सीमा |
| `$like`  | SQL में "LIKE" semantics पर आधारित पाठ समानता ("%" वाइल्डकार्ड का उपयोग करके)  |
| `$and`   |逻辑 "और", 2 या अधिक ऑपरेंड का समर्थन |
| `$or`    |逻辑 "या", 2 या अधिक ऑपरेंड का समर्थन |

```python
# Prepare some test documents
docs = [
    Document(
        page_content="First",
        metadata={"name": "adam", "is_active": True, "id": 1, "height": 10.0},
    ),
    Document(
        page_content="Second",
        metadata={"name": "bob", "is_active": False, "id": 2, "height": 5.7},
    ),
    Document(
        page_content="Third",
        metadata={"name": "jane", "is_active": True, "id": 3, "height": 2.4},
    ),
]

db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_ADVANCED_FILTER",
)

# Delete already existing documents from the table
db.delete(filter={})
db.add_documents(docs)


# Helper function for printing filter results
def print_filter_result(result):
    if len(result) == 0:
        print("<empty result>")
    for doc in result:
        print(doc.metadata)
```

`$ne`, `$gt`, `$gte`, `$lt`, `$lte` के साथ फ़िल्टरिंग

```python
advanced_filter = {"id": {"$ne": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$between`, `$in`, `$nin` के साथ फ़िल्टरिंग

```python
advanced_filter = {"id": {"$between": (1, 2)}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$in": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$nin": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$like` के साथ पाठ फ़िल्टरिंग

```python
advanced_filter = {"name": {"$like": "a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$like": "%a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$and`, `$or` के साथ संयुक्त फ़िल्टरिंग

```python
advanced_filter = {"$or": [{"id": 1}, {"name": "bob"}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$and": [{"id": 1}, {"id": 2}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$or": [{"id": 1}, {"id": 2}, {"id": 3}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

## पुनर्प्राप्ति संवर्धित जनरेशन (RAG) के लिए रिट्रीवर के रूप में VectorStore का उपयोग करना

```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

# Access the vector DB with a new table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_RETRIEVAL_CHAIN",
)

# Delete already existing entries from the table
db.delete(filter={})

# add the loaded document chunks from the "State Of The Union" file
db.add_documents(text_chunks)

# Create a retriever instance of the vector store
retriever = db.as_retriever()
```

प्रॉम्प्ट परिभाषित करें।

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """
You are an expert in state of the union topics. You are provided multiple context items that are related to the prompt you have to answer.
Use the following pieces of context to answer the question at the end.

\```

{context}

\```

Question: {question}
"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
chain_type_kwargs = {"prompt": PROMPT}
```

ConversationalRetrievalChain बनाएं, जो चैट इतिहास और समान दस्तावेज़ के टुकड़ों को पुनः प्राप्त करने का प्रबंधन करता है।

```python
from langchain.chains import ConversationalRetrievalChain

llm = ChatOpenAI(model="gpt-3.5-turbo")
memory = ConversationBufferMemory(
    memory_key="chat_history", output_key="answer", return_messages=True
)
qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    memory=memory,
    verbose=False,
    combine_docs_chain_kwargs={"prompt": PROMPT},
)
```

पहला प्रश्न पूछें (और देखें कि कितने पाठ के टुकड़ों का उपयोग किया गया है)।

```python
question = "What about Mexico and Guatemala?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])

source_docs = result["source_documents"]
print("================")
print(f"Number of used source document chunks: {len(source_docs)}")
```

चेन के उपयोग किए गए टुकड़ों का विस्तार से परीक्षण करें। जांच करें कि क्या सर्वश्रेष्ठ रैंक किया गया टुकड़ा "मेक्सिको और ग्वाटेमाला" के बारे में जानकारी रखता है जैसा कि प्रश्न में उल्लेख किया गया है।

```python
for doc in source_docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

इसी वार्तालाप श्रृंखला पर एक और प्रश्न पूछें। उत्तर पिछले उत्तर से संबंधित होना चाहिए।

```python
question = "What about other countries?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])
```

## मानक तालिकाएं बनाम "कस्टम" तालिकाएं वेक्टर डेटा के साथ

डिफ़ॉल्ट व्यवहार के रूप में, एम्बेडिंग्स के लिए तालिका 3 कॉलम के साथ बनाई जाती है:

- एक कॉलम `VEC_TEXT`, जो दस्तावेज़ का पाठ रखता है
- एक कॉलम `VEC_META`, जो दस्तावेज़ का मेटाडेटा रखता है
- एक कॉलम `VEC_VECTOR`, जो दस्तावेज़ के पाठ का एम्बेडिंग्स-वेक्टर रखता है

```python
# Access the vector DB with a new table
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_NEW_TABLE"
)

# Delete already existing entries from the table
db.delete(filter={})

# Add a simple document with some metadata
docs = [
    Document(
        page_content="A simple document",
        metadata={"start": 100, "end": 150, "doc_name": "simple.txt"},
    )
]
db.add_documents(docs)
```

"LANGCHAIN_DEMO_NEW_TABLE" तालिका में कॉलम दिखाएं

```python
cur = connection.cursor()
cur.execute(
    "SELECT COLUMN_NAME, DATA_TYPE_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = 'LANGCHAIN_DEMO_NEW_TABLE'"
)
rows = cur.fetchall()
for row in rows:
    print(row)
cur.close()
```

तीन कॉलमों में डाले गए दस्तावेज़ के मूल्य दिखाएं

```python
cur = connection.cursor()
cur.execute(
    "SELECT VEC_TEXT, VEC_META, TO_NVARCHAR(VEC_VECTOR) FROM LANGCHAIN_DEMO_NEW_TABLE LIMIT 1"
)
rows = cur.fetchall()
print(rows[0][0])  # The text
print(rows[0][1])  # The metadata
print(rows[0][2])  # The vector
cur.close()
```

कस्टम तालिकाओं में कम से कम तीन कॉलम होने चाहिए जो एक मानक तालिका की语义से मेल खाते हों

- एक कॉलम `NCLOB` या `NVARCHAR` प्रकार का एम्बेडिंग्स के पाठ/संदर्भ के लिए
- एक कॉलम `NCLOB` या `NVARCHAR` प्रकार का मेटाडेटा के लिए
- एक कॉलम `REAL_VECTOR` प्रकार का एम्बेडिंग वेक्टर के लिए

तालिका में अतिरिक्त कॉलम हो सकते हैं। जब नए दस्तावेज़ तालिका में डाले जाते हैं, तो इन अतिरिक्त कॉलमों में NULL मान होने की अनुमति होनी चाहिए।

```python
# Create a new table "MY_OWN_TABLE" with three "standard" columns and one additional column
my_own_table_name = "MY_OWN_TABLE"
cur = connection.cursor()
cur.execute(
    (
        f"CREATE TABLE {my_own_table_name} ("
        "SOME_OTHER_COLUMN NVARCHAR(42), "
        "MY_TEXT NVARCHAR(2048), "
        "MY_METADATA NVARCHAR(1024), "
        "MY_VECTOR REAL_VECTOR )"
    )
)

# Create a HanaDB instance with the own table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name=my_own_table_name,
    content_column="MY_TEXT",
    metadata_column="MY_METADATA",
    vector_column="MY_VECTOR",
)

# Add a simple document with some metadata
docs = [
    Document(
        page_content="Some other text",
        metadata={"start": 400, "end": 450, "doc_name": "other.txt"},
    )
]
db.add_documents(docs)

# Check if data has been inserted into our own table
cur.execute(f"SELECT * FROM {my_own_table_name} LIMIT 1")
rows = cur.fetchall()
print(rows[0][0])  # Value of column "SOME_OTHER_DATA". Should be NULL/None
print(rows[0][1])  # The text
print(rows[0][2])  # The metadata
print(rows[0][3])  # The vector

cur.close()
```

एक और दस्तावेज़ जोड़ें और कस्टम तालिका पर समानता खोज करें।

```python
docs = [
    Document(
        page_content="Some more text",
        metadata={"start": 800, "end": 950, "doc_name": "more.txt"},
    )
]
db.add_documents(docs)

query = "What's up?"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```
