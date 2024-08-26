---
translated: true
---

# 타이어

>[타이어](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair)는 `Alibaba Cloud`에서 개발한 클라우드 네이티브 인메모리 데이터베이스 서비스입니다.
오픈소스 `Redis`와 완전히 호환되면서도 실시간 온라인 시나리오를 지원하는 풍부한 데이터 모델과 엔터프라이즈급 기능을 제공합니다. `타이어`는 또한 새로운 비휘발성 메모리(NVM) 스토리지 매체를 기반으로 하는 지속 메모리 최적화 인스턴스를 도입했습니다.

이 노트북은 `타이어` 벡터 데이터베이스와 관련된 기능 사용 방법을 보여줍니다.

실행하려면 `타이어` 인스턴스가 실행 중이어야 합니다.

```python
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Tair
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=128)
```

`TAIR_URL` 환경 변수를 사용하거나 키워드 인수 `tair_url`을 사용하여 타이어에 연결합니다.

그런 다음 문서와 임베딩을 타이어에 저장합니다.

```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

유사한 문서를 검색합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

타이어 하이브리드 검색 인덱스 빌드

```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

타이어 하이브리드 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```
