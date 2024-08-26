---
translated: true
---

# 소나무 하이브리드 검색

>[Pinecone](https://docs.pinecone.io/docs/overview)은 광범위한 기능을 가진 벡터 데이터베이스입니다.

이 노트북은 내부적으로 Pinecone과 하이브리드 검색을 사용하는 리트리버를 사용하는 방법을 설명합니다.

이 리트리버의 논리는 [이 문서](https://docs.pinecone.io/docs/hybrid-search)에서 가져왔습니다.

Pinecone을 사용하려면 API 키와 환경이 필요합니다.
[설치 지침](https://docs.pinecone.io/docs/quickstart)은 여기에 있습니다.

```python
%pip install --upgrade --quiet  pinecone-client pinecone-text
```

```python
import getpass
import os

os.environ["PINECONE_API_KEY"] = getpass.getpass("Pinecone API Key:")
```

```python
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

```python
os.environ["PINECONE_ENVIRONMENT"] = getpass.getpass("Pinecone Environment:")
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키가 필요합니다.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Pinecone 설정

이 부분은 한 번만 수행하면 됩니다.

참고: 문서 텍스트를 포함하는 "context" 필드가 인덱싱되지 않도록 하는 것이 중요합니다. 현재는 명시적으로 인덱싱하려는 필드를 지정해야 합니다. 자세한 내용은 Pinecone의 [문서](https://docs.pinecone.io/docs/manage-indexes#selective-metadata-indexing)를 참조하세요.

```python
import os

import pinecone

api_key = os.getenv("PINECONE_API_KEY") or "PINECONE_API_KEY"

index_name = "langchain-pinecone-hybrid-search"
```

```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```

```python
# create the index
pinecone.create_index(
    name=index_name,
    dimension=1536,  # dimensionality of dense model
    metric="dotproduct",  # sparse values supported only for dotproduct
    pod_type="s1",
    metadata_config={"indexed": []},  # see explanation above
)
```

이제 생성되었으므로 사용할 수 있습니다.

```python
index = pinecone.Index(index_name)
```

## 임베딩 및 희소 인코더 가져오기

임베딩은 밀집 벡터에 사용되고, 토크나이저는 희소 벡터에 사용됩니다.

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

텍스트를 희소 값으로 인코딩하려면 SPLADE 또는 BM25를 선택할 수 있습니다. 도메인 외 작업의 경우 BM25 사용을 권장합니다.

희소 인코더에 대한 자세한 내용은 pinecone-text 라이브러리 [문서](https://pinecone-io.github.io/pinecone-text/pinecone_text.html)를 참조하세요.

```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

위의 코드는 기본 tf-idf 값을 사용합니다. 자신의 코퍼스에 맞게 tf-idf 값을 맞추는 것이 강력히 권장됩니다. 다음과 같이 할 수 있습니다:

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## 리트리버 로드

이제 리트리버를 구성할 수 있습니다!

```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## 텍스트 추가(필요한 경우)

필요한 경우 리트리버에 텍스트를 추가할 수 있습니다.

```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```

```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```

## 리트리버 사용

이제 리트리버를 사용할 수 있습니다!

```python
result = retriever.invoke("foo")
```

```python
result[0]
```

```output
Document(page_content='foo', metadata={})
```
