---
translated: true
---

# 캐싱

임베딩은 다시 계산할 필요 없이 저장하거나 임시로 캐시할 수 있습니다.

임베딩을 캐싱하는 방법은 `CacheBackedEmbeddings`를 사용하는 것입니다. 캐시 백 임베더는 임베더를 래핑하여 키-값 저장소에 임베딩을 캐시합니다. 텍스트는 해시되며 해시가 캐시의 키로 사용됩니다.

`CacheBackedEmbeddings`를 초기화하는 주된 방법은 `from_bytes_store`입니다. 다음과 같은 매개변수를 받습니다:

- underlying_embedder: 임베딩에 사용할 임베더.
- document_embedding_cache: 문서 임베딩을 캐싱할 [`ByteStore`](/docs/integrations/stores/)입니다.
- batch_size: (선택 사항, 기본값 `None`) 저장소 업데이트 사이의 문서 임베딩 개수.
- namespace: (선택 사항, 기본값 `""`) 문서 캐시에 사용할 네임스페이스입니다. 이 네임스페이스는 다른 캐시와의 충돌을 방지하는 데 사용됩니다. 예를 들어 사용된 임베딩 모델의 이름으로 설정할 수 있습니다.

**주의사항**:

- 충돌을 방지하기 위해 `namespace` 매개변수를 설정하는 것이 중요합니다.
- 현재 `CacheBackedEmbeddings`는 `embed_query()` `aembed_query()` 메서드로 생성된 임베딩을 캐시하지 않습니다.

```python
from langchain.embeddings import CacheBackedEmbeddings
```

## 벡터 저장소와 함께 사용하기

먼저 로컬 파일 시스템을 사용하여 임베딩을 저장하고 FAISS 벡터 저장소를 사용하여 검색하는 예를 살펴보겠습니다.

```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```

```python
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

임베딩 전에는 캐시가 비어 있습니다:

```python
list(store.yield_keys())
```

```output
[]
```

문서를 로드하고, 청크로 분할하고, 각 청크를 임베딩하고 벡터 저장소에 로드합니다.

```python
raw_documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

벡터 저장소를 생성합니다:

```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```

벡터 저장소를 다시 생성하면 임베딩을 다시 계산할 필요가 없어 훨씬 빠릅니다.

```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```

생성된 임베딩 중 일부입니다:

```python
list(store.yield_keys())[:5]
```

```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```

# `ByteStore` 변경하기

다른 `ByteStore`를 사용하려면 `CacheBackedEmbeddings`를 생성할 때 해당 저장소를 사용하면 됩니다. 아래에서는 비영속적인 `InMemoryByteStore`를 사용하여 동등한 캐시 백 임베딩 객체를 생성합니다:

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
