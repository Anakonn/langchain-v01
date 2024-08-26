---
translated: true
---

# 티그리스

> [티그리스](https://tigrisdata.com)는 고성능 벡터 검색 애플리케이션 구축을 단순화하도록 설계된 오픈 소스 Serverless NoSQL 데이터베이스 및 검색 플랫폼입니다.
> `Tigris`는 여러 도구를 관리, 운영 및 동기화하는 인프라 복잡성을 제거하여 훌륭한 애플리케이션 구축에 집중할 수 있게 해줍니다.

이 노트북은 Tigris를 VectorStore로 사용하는 방법을 안내합니다.

**사전 요구 사항**
1. OpenAI 계정. [여기](https://platform.openai.com/)에서 계정을 등록할 수 있습니다.
2. [Tigris 무료 계정 등록](https://console.preview.tigrisdata.cloud). Tigris 계정에 등록한 후 `vectordemo`라는 새 프로젝트를 만드세요. 그런 다음 프로젝트를 생성한 지역의 *Uri*, **clientId** 및 **clientSecret**을 메모해 두세요. 이 정보는 프로젝트의 **Application Keys** 섹션에서 확인할 수 있습니다.

먼저 종속성을 설치해 보겠습니다:

```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai tiktoken
```

OpenAI API 키와 Tigris 자격 증명을 환경에 로드하겠습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Tigris 벡터 스토어 초기화

테스트 데이터셋을 로드해 보겠습니다:

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### 유사도 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### 점수(벡터 거리)를 포함한 유사도 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
