---
translated: true
---

# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb)는 [SemaFind](https://www.semafind.com)에서 제공하는 AI 애플리케이션 구축을 위한 간단한 벡터 유사성 데이터베이스입니다. `SemaDB Cloud`는 개발을 시작하는 데 편리한 개발자 경험을 제공합니다.

API 전체 문서와 예제, 대화형 플레이그라운드는 [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb)에서 확인할 수 있습니다.

이 노트북은 `SemaDB Cloud` 벡터 저장소 사용법을 보여줍니다.

## 문서 임베딩 로드하기

로컬에서 실행하기 위해 일반적으로 문장 임베딩에 사용되는 [Sentence Transformers](https://www.sbert.net/)를 사용합니다. LangChain에서 제공하는 임베딩 모델을 사용할 수 있습니다.

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```

```output
114
```

## SemaDB에 연결하기

SemaDB Cloud는 [RapidAPI 키](https://rapidapi.com/semafind-semadb/api/semadb)를 사용하여 인증합니다. 무료 RapidAPI 계정을 만들면 키를 얻을 수 있습니다.

```python
import getpass
import os

os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```

```output
SemaDB API Key: ········
```

```python
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

SemaDB 벡터 저장소의 매개변수는 API와 직접 연결됩니다:

- "mycollection": 이 벡터를 저장할 컬렉션 이름입니다.
- 768: 벡터의 차원입니다. 이 경우 문장 변환기 임베딩은 768차원 벡터를 생성합니다.
- API_KEY: RapidAPI 키입니다.
- embeddings: 문서, 텍스트, 쿼리의 임베딩 생성 방법을 나타냅니다.
- DistanceStrategy: 사용할 거리 메트릭입니다. 래퍼는 COSINE을 사용할 경우 자동으로 벡터를 정규화합니다.

```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```

```output
True
```

SemaDB 벡터 저장소 래퍼는 문서 텍스트를 포인트 메타데이터로 추가하여 나중에 수집할 수 있습니다. 큰 텍스트 조각을 저장하는 것은 *권장되지 않습니다*. 대신 대규모 컬렉션을 인덱싱할 때는 외부 ID와 같은 문서 참조를 저장하는 것이 좋습니다.

```python
db.add_documents(docs)[:2]
```

```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```

## 유사성 검색

기본 LangChain 유사성 검색 인터페이스를 사용하여 가장 유사한 문장을 검색합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```

## 정리하기

컬렉션을 삭제하여 모든 데이터를 제거할 수 있습니다.

```python
db.delete_collection()
```

```output
True
```
