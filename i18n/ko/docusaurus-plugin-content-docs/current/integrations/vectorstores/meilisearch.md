---
translated: true
---

# Meilisearch

> [Meilisearch](https://meilisearch.com)는 오픈 소스, 번개처럼 빠르고 초점이 맞춰진 검색 엔진입니다. 개발자들이 빠른 검색 경험을 만들 수 있도록 훌륭한 기본값을 제공합니다.
>
> [Meilisearch를 자체 호스팅](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation)하거나 [Meilisearch Cloud](https://www.meilisearch.com/pricing)에서 실행할 수 있습니다.

Meilisearch v1.3은 벡터 검색을 지원합니다. 이 페이지에서는 Meilisearch를 벡터 저장소로 통합하고 벡터 검색을 수행하는 방법을 안내합니다.

## 설정

### Meilisearch 인스턴스 실행하기

벡터 저장소로 사용할 Meilisearch 인스턴스가 실행 중이어야 합니다. [로컬에서 Meilisearch를 실행](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation)하거나 [Meilisearch Cloud](https://cloud.meilisearch.com/) 계정을 만들 수 있습니다.

Meilisearch v1.3부터 벡터 저장소는 실험적인 기능입니다. Meilisearch 인스턴스를 실행한 후 **벡터 저장소를 활성화**해야 합니다. 자체 호스팅 Meilisearch의 경우 [실험적 기능 활성화](https://www.meilisearch.com/docs/learn/experimental/overview) 문서를 참조하세요. **Meilisearch Cloud**에서는 프로젝트 _설정_ 페이지에서 _벡터 저장소_를 활성화하세요.

이제 벡터 저장소가 활성화된 실행 중인 Meilisearch 인스턴스가 있습니다. 🎉

### 자격 증명

Meilisearch SDK를 사용하려면 호스트(인스턴스의 URL) 및 API 키가 필요합니다.

**호스트**

- **로컬**에서는 기본 호스트가 `localhost:7700`입니다.
- **Meilisearch Cloud**에서는 프로젝트 _설정_ 페이지에서 호스트를 찾을 수 있습니다.

**API 키**

Meilisearch 인스턴스에는 기본적으로 세 개의 API 키가 제공됩니다:
- `MASTER KEY` - Meilisearch 인스턴스를 생성할 때만 사용해야 합니다.
- `ADMIN KEY` - 데이터베이스와 설정을 업데이트할 때만 서버 측에서 사용해야 합니다.
- `SEARCH KEY` - 프런트엔드 애플리케이션에서 안전하게 공유할 수 있는 키입니다.

필요에 따라 [추가 API 키](https://www.meilisearch.com/docs/learn/security/master_api_keys)를 만들 수 있습니다.

### 종속성 설치

이 가이드에서는 [Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)를 사용합니다. 다음을 실행하여 설치할 수 있습니다:

```python
%pip install --upgrade --quiet  meilisearch
```

자세한 내용은 [Meilisearch Python SDK 문서](https://meilisearch.github.io/meilisearch-python/)를 참조하세요.

## 예제

Meilisearch 벡터 저장소를 초기화하는 방법에는 여러 가지가 있습니다: Meilisearch 클라이언트를 제공하거나 필요에 따라 _URL_ 및 _API 키_를 제공할 수 있습니다. 다음 예제에서는 자격 증명을 환경 변수에서 로드합니다.

`os` 및 `getpass`를 사용하여 Notebook 환경에서 환경 변수를 사용할 수 있습니다. 다음 모든 예제에서 이 기술을 사용할 수 있습니다.

```python
import getpass
import os

os.environ["MEILI_HTTP_ADDR"] = getpass.getpass("Meilisearch HTTP address and port:")
os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키가 필요합니다.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### 텍스트 및 임베딩 추가하기

이 예제에서는 Meilisearch 벡터 저장소를 초기화하지 않고도 텍스트를 Meilisearch 벡터 데이터베이스에 추가합니다.

```python
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

내부적으로 Meilisearch는 텍스트를 여러 벡터로 변환합니다. 이는 다음 예제와 동일한 결과를 가져옵니다.

### 문서 및 임베딩 추가하기

이 예제에서는 Langchain TextSplitter를 사용하여 텍스트를 여러 문서로 분할합니다. 그런 다음 이 문서와 해당 임베딩을 저장합니다.

```python
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## Meilisearch Vectorstore 생성하여 문서 추가하기

이 접근 방식에서는 벡터 저장소 객체를 생성하고 문서를 추가합니다.

```python
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## 점수와 함께 유사도 검색

이 특정 메서드를 사용하면 문서와 쿼리 간의 거리 점수를 반환할 수 있습니다. `embedder_name`은 의미 검색에 사용되어야 하는 임베더의 이름이며, 기본값은 "default"입니다.

```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## 벡터로 유사도 검색

`embedder_name`은 의미 검색에 사용되어야 하는 임베더의 이름이며, 기본값은 "default"입니다.

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## 추가 리소스

문서
- [Meilisearch](https://www.meilisearch.com/docs/)
- [Meilisearch Python SDK](https://python-sdk.meilisearch.com)

오픈 소스 리포지토리
- [Meilisearch 리포지토리](https://github.com/meilisearch/meilisearch)
- [Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)
