---
translated: true
---

# Milvus

>[Milvus](https://milvus.io/docs/overview.md)는 딥 신경망 및 기타 기계 학습(ML) 모델에 의해 생성된 대량의 임베딩 벡터를 저장, 인덱싱 및 관리하는 데이터베이스입니다.

이 노트북은 Milvus 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

실행하려면 [Milvus 인스턴스를 실행 중](https://milvus.io/docs/install_standalone-docker.md)이어야 합니다.

```python
%pip install --upgrade --quiet  pymilvus
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

### Milvus 컬렉션으로 데이터 구분하기

동일한 Milvus 인스턴스 내에서 다른 관련 없는 문서를 다른 컬렉션에 저장하여 컨텍스트를 유지할 수 있습니다.

새 컬렉션을 만드는 방법은 다음과 같습니다.

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    collection_name="collection_1",
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

그리고 여기에서는 저장된 컬렉션을 검색하는 방법입니다.

```python
vector_db = Milvus(
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    collection_name="collection_1",
)
```

검색 후에는 일반적인 방식으로 쿼리할 수 있습니다.

### 사용자별 검색

검색 앱을 구축할 때는 여러 사용자를 염두에 두어야 합니다. 즉, 한 사용자의 데이터뿐만 아니라 여러 다른 사용자의 데이터도 저장해야 하며, 사용자들이 서로의 데이터를 볼 수 없어야 합니다.

Milvus는 [partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy)를 사용하여 멀티 테넌시를 구현하는 것을 권장합니다. 다음은 예시입니다.

```python
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

파티션 키를 사용하여 검색하려면 검색 요청의 부울 표현식에 다음 중 하나를 포함해야 합니다:

`search_kwargs={"expr": '<partition_key> == "xxxx"'}`

`search_kwargs={"expr": '<partition_key> == in ["xxx", "xxx"]'}`

`<partition_key>`를 파티션 키로 지정된 필드 이름으로 바꾸십시오.

Milvus는 지정된 파티션 키에 따라 파티션을 변경하고, 파티션 키에 따라 엔티티를 필터링하며, 필터링된 엔티티 중에서 검색합니다.

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "ankush"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```

**하나 이상의 엔티티를 삭제하거나 업서트(업데이트/삽입)하려면:**

```python
from langchain_community.docstore.document import Document

# Insert data sample
docs = [
    Document(page_content="foo", metadata={"id": 1}),
    Document(page_content="bar", metadata={"id": 2}),
    Document(page_content="baz", metadata={"id": 3}),
]
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)

# Search pks (primary keys) using expression
expr = "id in [1,2]"
pks = vector_db.get_pks(expr)

# Delete entities by pks
result = vector_db.delete(pks)

# Upsert (Update/Insert)
new_docs = [
    Document(page_content="new_foo", metadata={"id": 1}),
    Document(page_content="new_bar", metadata={"id": 2}),
    Document(page_content="upserted_bak", metadata={"id": 3}),
]
upserted_pks = vector_db.upsert(pks, new_docs)
```
