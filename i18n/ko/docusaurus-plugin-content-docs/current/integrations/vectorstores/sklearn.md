---
translated: true
---

# scikit-learn

>[scikit-learn](https://scikit-learn.org/stable/)은 [k nearest neighbors](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.NearestNeighbors.html)와 같은 기계 학습 알고리즘의 오픈 소스 컬렉션입니다. `SKLearnVectorStore`는 이 구현을 래핑하고 JSON, BSON(바이너리 JSON) 또는 Apache Parquet 형식으로 벡터 저장소를 영구화할 수 있는 기능을 추가합니다.

이 노트북은 `SKLearnVectorStore` 벡터 데이터베이스를 사용하는 방법을 보여줍니다.

```python
%pip install --upgrade --quiet  scikit-learn

# # if you plan to use bson serialization, install also:
%pip install --upgrade --quiet  bson

# # if you plan to use parquet serialization, install also:
%pip install --upgrade --quiet  pandas pyarrow
```

OpenAI 임베딩을 사용하려면 OpenAI 키가 필요합니다. https://platform.openai.com/account/api-keys에서 받을 수 있습니다. 다른 임베딩을 사용해도 됩니다.

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass("Enter your OpenAI key:")
```

## 기본 사용법

### 샘플 문서 코퍼스 로드

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
```

### SKLearnVectorStore 생성, 문서 코퍼스 인덱싱 및 샘플 쿼리 실행

```python
import tempfile

persist_path = os.path.join(tempfile.gettempdir(), "union.parquet")

vector_store = SKLearnVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_path=persist_path,  # persist_path and serializer are optional
    serializer="parquet",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 벡터 저장소 저장 및 로드

```python
vector_store.persist()
print("Vector store was persisted to", persist_path)
```

```output
Vector store was persisted to /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
vector_store2 = SKLearnVectorStore(
    embedding=embeddings, persist_path=persist_path, serializer="parquet"
)
print("A new instance of vector store was loaded from", persist_path)
```

```output
A new instance of vector store was loaded from /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
docs = vector_store2.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 정리

```python
os.remove(persist_path)
```
