---
translated: true
---

# Xata

> [Xata](https://xata.io)는 PostgreSQL을 기반으로 하는 서버리스 데이터 플랫폼입니다. Python SDK를 제공하여 데이터베이스와 상호 작용할 수 있으며, 데이터 관리를 위한 UI를 제공합니다.
> Xata는 모든 테이블에 추가할 수 있는 네이티브 벡터 타입을 제공하며, 유사성 검색을 지원합니다. LangChain은 벡터를 직접 Xata에 삽입하고 주어진 벡터의 최근접 이웃을 쿼리하여 LangChain Embeddings 통합을 Xata와 함께 사용할 수 있습니다.

이 노트북은 Xata를 VectorStore로 사용하는 방법을 안내합니다.

## 설정

### 벡터 스토어로 사용할 데이터베이스 생성

[Xata UI](https://app.xata.io)에서 새 데이터베이스를 생성하세요. 원하는 이름으로 지정할 수 있으며, 이 노트패드에서는 `langchain`을 사용합니다.
테이블을 생성하고 이름을 지정하세요. 이 예에서는 `vectors`를 사용합니다. UI를 통해 다음과 같은 열을 추가하세요:

* `content` 유형 "Text". `Document.pageContent` 값을 저장하는 데 사용됩니다.
* `embedding` 유형 "Vector". 사용할 모델의 차원을 사용하세요. 이 노트북에서는 OpenAI 임베딩을 사용하며, 1536 차원입니다.
* `source` 유형 "Text". 이 예제에서 메타데이터 열로 사용됩니다.
* `Document.metadata` 객체에서 사용할 다른 메타데이터 열. 예를 들어 `Document.metadata` 객체에 `title` 속성이 있는 경우 `title` 열을 만들어 해당 값이 채워집니다.

먼저 종속성을 설치해 보겠습니다:

```python
%pip install --upgrade --quiet  xata langchain-openai tiktoken langchain
```

OpenAI 키를 환경에 로드합니다. 아직 없다면 OpenAI 계정을 만들고 이 [페이지](https://platform.openai.com/account/api-keys)에서 키를 생성할 수 있습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

마찬가지로 Xata에 대한 환경 변수도 필요합니다. [계정 설정](https://app.xata.io/settings)에서 새 API 키를 만들 수 있습니다. 데이터베이스 URL은 생성한 데이터베이스의 설정 페이지에서 찾을 수 있습니다. 데이터베이스 URL은 다음과 같은 형식입니다: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Xata 벡터 스토어 생성

테스트 데이터셋을 가져오겠습니다:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

이제 Xata 테이블을 기반으로 실제 벡터 스토어를 생성합니다.

```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

위의 명령을 실행하면 Xata UI에서 문서와 해당 임베딩이 로드된 것을 확인할 수 있습니다.
이미 벡터 콘텐츠가 포함된 기존 Xata 테이블을 사용하려면 XataVectorStore 생성자를 초기화하세요:

```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
```

### 유사성 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### 점수(벡터 거리)를 포함한 유사성 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
