---
translated: true
---

# Tencent Cloud VectorDB

>[Tencent Cloud VectorDB](https://cloud.tencent.com/document/product/1709)는 다차원 벡터 데이터를 저장, 검색 및 분석하기 위해 설계된 완전 관리형, 자체 개발, 엔터프라이즈 수준의 분산 데이터베이스 서비스입니다. 이 데이터베이스는 다양한 인덱스 유형과 유사성 계산 방법을 지원합니다. 단일 인덱스는 최대 10억 개의 벡터를 지원하고 수백만 QPS와 밀리초 수준의 쿼리 지연 시간을 지원할 수 있습니다. Tencent Cloud Vector Database는 대형 모델의 정확도를 높이기 위한 외부 지식 베이스를 제공할 뿐만 아니라 추천 시스템, NLP 서비스, 컴퓨터 비전, 지능형 고객 서비스 등 AI 분야에서 널리 사용될 수 있습니다.

이 노트북은 Tencent 벡터 데이터베이스와 관련된 기능 사용 방법을 보여줍니다.

실행하려면 [데이터베이스 인스턴스](https://cloud.tencent.com/document/product/1709/95101)가 있어야 합니다.

## 기본 사용법

```python
!pip3 install tcvectordb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import TencentVectorDB
from langchain_community.vectorstores.tencentvectordb import ConnectionParams
from langchain_text_splitters import CharacterTextSplitter
```

문서를 로드하고 청크로 분할합니다.

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

문서를 임베딩하는 두 가지 방법을 지원합니다:
- Langchain Embeddings와 호환되는 임베딩 모델 사용.
- Tencent VectorStore DB의 임베딩 모델 이름 지정, 선택 가능한 모델:
    - `bge-base-zh`, 차원: 768
    - `m3e-base`, 차원: 768
    - `text2vec-large-chinese`, 차원: 1024
    - `e5-large-v2`, 차원: 1024
    - `multilingual-e5-base`, 차원: 768

다음 코드는 두 가지 방법으로 문서를 임베딩하는 것을 보여줍니다. 원하는 방법을 선택하여 주석 처리하세요:

```python
##  you can use a Langchain Embeddings model, like OpenAIEmbeddings:

# from langchain_community.embeddings.openai import OpenAIEmbeddings
#
# embeddings = OpenAIEmbeddings()
# t_vdb_embedding = None

## Or you can use a Tencent Embedding model, like `bge-base-zh`:

t_vdb_embedding = "bge-base-zh"  # bge-base-zh is the default model
embeddings = None
```

이제 TencentVectorDB 인스턴스를 만들 수 있습니다. `embeddings` 또는 `t_vdb_embedding` 매개변수 중 하나 이상을 제공해야 합니다. 두 개가 모두 제공되면 `embeddings` 매개변수가 사용됩니다:

```python
conn_params = ConnectionParams(
    url="http://10.0.X.X",
    key="eC4bLRy2va******************************",
    username="root",
    timeout=20,
)

vector_db = TencentVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, t_vdb_embedding=t_vdb_embedding
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

```python
vector_db = TencentVectorDB(embeddings, conn_params)

vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```

```output
'Ankush went to Princeton'
```

## 메타데이터 및 필터링

Tencent VectorDB는 [메타데이터와 필터링](https://cloud.tencent.com/document/product/1709/95099#c6f6d3a3-02c5-4891-b0a1-30fe4daf18d8)을 지원합니다. 문서에 메타데이터를 추가하고 메타데이터를 기반으로 검색 결과를 필터링할 수 있습니다.

이제 메타데이터가 포함된 새 TencentVectorDB 컬렉션을 만들고 메타데이터를 기반으로 검색 결과를 필터링하는 방법을 보여드리겠습니다:

```python
from langchain_community.vectorstores.tencentvectordb import (
    META_FIELD_TYPE_STRING,
    META_FIELD_TYPE_UINT64,
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document

meta_fields = [
    MetaField(name="year", data_type=META_FIELD_TYPE_UINT64, index=True),
    MetaField(name="rating", data_type=META_FIELD_TYPE_STRING, index=False),
    MetaField(name="genre", data_type=META_FIELD_TYPE_STRING, index=True),
    MetaField(name="director", data_type=META_FIELD_TYPE_STRING, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "superhero",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="movies",
    meta_fields=meta_fields,
)

query = "film about dream by Christopher Nolan"

# you can use the tencentvectordb filtering syntax with the `expr` parameter:
result = vector_db.similarity_search(query, expr='director="Christopher Nolan"')

# you can either use the langchain filtering syntax with the `filter` parameter:
# result = vector_db.similarity_search(query, filter='eq("director", "Christopher Nolan")')

result
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='Inception is a 2010 science fiction action film written and directed by Christopher Nolan.', metadata={'year': 2010, 'rating': '8.8', 'genre': 'science fiction', 'director': 'Christopher Nolan'})]
```
