---
translated: true
---

# PGVecto.rs

이 노트북은 Postgres 벡터 데이터베이스([pgvecto.rs](https://github.com/tensorchord/pgvecto.rs))와 관련된 기능을 사용하는 방법을 보여줍니다.

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

[공식 데모 도커 이미지](https://github.com/tensorchord/pgvecto.rs#installation)를 사용하여 데이터베이스를 시작합니다.

```python
! docker run --name pgvecto-rs-demo -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d tensorchord/pgvecto-rs:latest
```

그런 다음 db URL을 구성합니다.

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

마지막으로 문서에서 VectorStore를 생성합니다:

```python
db1 = PGVecto_rs.from_documents(
    documents=docs,
    embedding=embeddings,
    db_url=URL,
    # The table name is f"collection_{collection_name}", so that it should be unique.
    collection_name="state_of_the_union",
)
```

나중에 다음과 같이 테이블에 연결할 수 있습니다:

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

사용자가 테이블을 생성할 수 있도록 허용되었는지 확인하세요.

## 유사도 검색 및 점수

### 유클리드 거리(기본값)를 사용한 유사도 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(query, k=4)
for doc in docs:
    print(doc.page_content)
    print("======================")
```

### 필터를 사용한 유사도 검색

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

또는:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter={"source": "../../modules/state_of_the_union.txt"}
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```
