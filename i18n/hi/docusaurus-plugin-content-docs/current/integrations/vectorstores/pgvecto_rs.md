---
translated: true
---

# PGVecto.rs

यह नोटबुक दिखाता है कि कैसे [pgvecto.rs](https://github.com/tensorchord/pgvecto.rs)) पोस्टग्रेस वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग किया जाए।

```python
%pip install "pgvecto_rs[sdk]"
```

```python
from typing import List

from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores.pgvecto_rs import PGVecto_rs
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=3)
```

[आधिकारिक डेमो डॉकर छवि](https://github.com/tensorchord/pgvecto.rs#installation) के साथ डेटाबेस शुरू करें।

```python
! docker run --name pgvecto-rs-demo -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d tensorchord/pgvecto-rs:latest
```

फिर डीबी यूआरएल का निर्माण करें

```python
## PGVecto.rs needs the connection string to the database.
## We will load it from the environment variables.
import os

PORT = os.getenv("DB_PORT", 5432)
HOST = os.getenv("DB_HOST", "localhost")
USER = os.getenv("DB_USER", "postgres")
PASS = os.getenv("DB_PASS", "mysecretpassword")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Run tests with shell:
URL = "postgresql+psycopg://{username}:{password}@{host}:{port}/{db_name}".format(
    port=PORT,
    host=HOST,
    username=USER,
    password=PASS,
    db_name=DB_NAME,
)
```

अंत में, दस्तावेजों से VectorStore बनाएं:

```python
db1 = PGVecto_rs.from_documents(
    documents=docs,
    embedding=embeddings,
    db_url=URL,
    # The table name is f"collection_{collection_name}", so that it should be unique.
    collection_name="state_of_the_union",
)
```

आप बाद में टेबल से कनेक्ट कर सकते हैं:

```python
# Create new empty vectorstore with collection_name.
# Or connect to an existing vectorstore in database if exists.
# Arguments should be the same as when the vectorstore was created.
db1 = PGVecto_rs.from_collection_name(
    embedding=embeddings,
    db_url=URL,
    collection_name="state_of_the_union",
)
```

सुनिश्चित करें कि उपयोगकर्ता को एक टेबल बनाने की अनुमति है।

## स्कोर के साथ समानता खोज

### यूक्लिडियन दूरी (डिफ़ॉल्ट) के साथ समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(query, k=4)
for doc in docs:
    print(doc.page_content)
    print("======================")
```

### फ़िल्टर के साथ समानता खोज

```python
from pgvecto_rs.sdk.filters import meta_contains

query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter=meta_contains({"source": "../../modules/state_of_the_union.txt"})
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```

या:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter={"source": "../../modules/state_of_the_union.txt"}
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```
