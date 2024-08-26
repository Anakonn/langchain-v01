---
translated: true
---

# Chroma

>[Chroma](https://docs.trychroma.com/getting-started)는 개발자 생산성과 행복에 초점을 맞춘 AI 네이티브 오픈 소스 벡터 데이터베이스입니다. Chroma는 Apache 2.0 라이선스 하에 있습니다.

Chroma를 다음과 같이 설치할 수 있습니다:

```sh
pip install langchain-chroma
```

Chroma는 다양한 모드로 실행됩니다. LangChain과 통합된 각 모드의 예는 다음과 같습니다.
- `in-memory` - Python 스크립트 또는 Jupyter Notebook에서
- `in-memory with persistance` - 스크립트 또는 노트북에서 디스크에 저장/로드
- `in a docker container` - 로컬 머신 또는 클라우드에서 실행되는 서버로

다른 데이터베이스와 마찬가지로 다음과 같은 작업을 수행할 수 있습니다:
- `.add`
- `.get`
- `.update`
- `.upsert`
- `.delete`
- `.peek`
- 그리고 `.query`는 유사성 검색을 실행합니다.

전체 문서는 [docs](https://docs.trychroma.com/reference/Collection)에서 확인할 수 있습니다. 이러한 메서드에 직접 액세스하려면 `._collection.method()`를 사용할 수 있습니다.

## 기본 예제

이 기본 예제에서는 가장 최근의 국정연설을 가져와 청크로 나누고, 오픈 소스 임베딩 모델을 사용하여 임베딩한 다음, Chroma에 로드하고 쿼리합니다.

```python
# import
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# load it into Chroma
db = Chroma.from_documents(docs, embedding_function)

# query it
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# print results
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 기본 예제(디스크에 저장 포함)

이전 예제를 확장하여 디스크에 저장하려면 Chroma 클라이언트를 초기화하고 데이터를 저장할 디렉토리를 전달하면 됩니다.

`주의`: Chroma는 데이터를 자동으로 디스크에 저장하려고 노력하지만, 여러 in-memory 클라이언트가 서로의 작업을 중단시킬 수 있습니다. 모범 사례로, 주어진 시간에 하나의 클라이언트만 실행되도록 하는 것이 좋습니다.

```python
# save to disk
db2 = Chroma.from_documents(docs, embedding_function, persist_directory="./chroma_db")
docs = db2.similarity_search(query)

# load from disk
db3 = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)
docs = db3.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## LangChain에 Chroma 클라이언트 전달하기

Chroma 클라이언트를 만들어 LangChain에 전달할 수도 있습니다. 이는 기본 데이터베이스에 더 쉽게 액세스하려는 경우에 특히 유용합니다.

LangChain이 사용할 컬렉션 이름을 지정할 수도 있습니다.

```python
import chromadb

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection("collection_name")
collection.add(ids=["1", "2", "3"], documents=["a", "b", "c"])

langchain_chroma = Chroma(
    client=persistent_client,
    collection_name="collection_name",
    embedding_function=embedding_function,
)

print("There are", langchain_chroma._collection.count(), "in the collection")
```

```output
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Insert of existing embedding ID: 1
Add of existing embedding ID: 2
Insert of existing embedding ID: 2
Add of existing embedding ID: 3
Insert of existing embedding ID: 3

There are 3 in the collection
```

## 기본 예제(Docker 컨테이너 사용)

Chroma 서버를 별도의 Docker 컨테이너에서 실행하고, 해당 클라이언트를 만들어 LangChain에 전달할 수도 있습니다.

Chroma는 여러 문서 `컬렉션`을 처리할 수 있지만, LangChain 인터페이스에서는 하나만 예상하므로 컬렉션 이름을 지정해야 합니다. LangChain에서 사용하는 기본 컬렉션 이름은 "langchain"입니다.

Docker 이미지를 클론, 빌드 및 실행하는 방법은 다음과 같습니다:

```sh
git clone git@github.com:chroma-core/chroma.git
```

`docker-compose.yml` 파일을 편집하고 `environment` 아래에 `ALLOW_RESET=TRUE`를 추가합니다.

```yaml
    ...
    command: uvicorn chromadb.app:app --reload --workers 1 --host 0.0.0.0 --port 8000 --log-config log_config.yml
    environment:
      - IS_PERSISTENT=TRUE
      - ALLOW_RESET=TRUE
    ports:
      - 8000:8000
    ...
```

그런 다음 `docker-compose up -d --build`를 실행합니다.

```python
# create the chroma client
import uuid

import chromadb
from chromadb.config import Settings

client = chromadb.HttpClient(settings=Settings(allow_reset=True))
client.reset()  # resets the database
collection = client.create_collection("my_collection")
for doc in docs:
    collection.add(
        ids=[str(uuid.uuid1())], metadatas=doc.metadata, documents=doc.page_content
    )

# tell LangChain to use our client and collection name
db4 = Chroma(
    client=client,
    collection_name="my_collection",
    embedding_function=embedding_function,
)
query = "What did the president say about Ketanji Brown Jackson"
docs = db4.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 업데이트 및 삭제

실제 애플리케이션을 구축하는 과정에서 데이터를 추가하는 것 외에도 업데이트 및 삭제를 수행하고 싶을 것입니다.

Chroma에서는 `ids`를 제공하여 이 작업을 간소화합니다. `ids`는 파일 이름 또는 `filename_paragraphNumber`와 같은 결합된 해시가 될 수 있습니다.

Chroma는 이러한 모든 작업을 지원하지만, 일부는 LangChain 인터페이스에 완전히 통합되지 않았습니다. 추가적인 워크플로 개선이 곧 추가될 예정입니다.

다양한 작업을 수행하는 기본 예제는 다음과 같습니다:

```python
# create simple ids
ids = [str(i) for i in range(1, len(docs) + 1)]

# add data
example_db = Chroma.from_documents(docs, embedding_function, ids=ids)
docs = example_db.similarity_search(query)
print(docs[0].metadata)

# update the metadata for a document
docs[0].metadata = {
    "source": "../../modules/state_of_the_union.txt",
    "new_value": "hello world",
}
example_db.update_document(ids[0], docs[0])
print(example_db._collection.get(ids=[ids[0]]))

# delete the last document
print("count before", example_db._collection.count())
example_db._collection.delete(ids=[ids[-1]])
print("count after", example_db._collection.count())
```

```output
{'source': '../../../state_of_the_union.txt'}
{'ids': ['1'], 'embeddings': None, 'metadatas': [{'new_value': 'hello world', 'source': '../../../state_of_the_union.txt'}], 'documents': ['Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.']}
count before 46
count after 45
```

## OpenAI 임베딩 사용

많은 사람들이 OpenAIEmbeddings를 사용하고 싶어 합니다. 다음은 그 설정 방법입니다.

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

from langchain_openai import OpenAIEmbeddings

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
embeddings = OpenAIEmbeddings()
new_client = chromadb.EphemeralClient()
openai_lc_client = Chroma.from_documents(
    docs, embeddings, client=new_client, collection_name="openai_collection"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = openai_lc_client.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

***

## 기타 정보

### 유사성 검색 및 점수

반환된 거리 점수는 코사인 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 1.1972057819366455)
```

### 리트리버 옵션

이 섹션에서는 리트리버 객체에서 Chroma를 사용하는 다양한 옵션을 살펴봅니다.

#### MMR

유사성 검색 외에도 `mmr`을 사용할 수 있습니다.

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

### 메타데이터 기반 필터링

작업하기 전에 컬렉션을 좁히는 것이 도움이 될 수 있습니다.

예를 들어, get 메서드를 사용하여 메타데이터를 기반으로 컬렉션을 필터링할 수 있습니다.

```python
# filter collection for updated source
example_db.get(where={"source": "some_other_source"})
```

```output
{'ids': [], 'embeddings': None, 'metadatas': [], 'documents': []}
```
