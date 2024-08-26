---
translated: true
---

# Azure AI 검색

[Azure AI 검색](https://learn.microsoft.com/azure/search/search-what-is-azure-search)(이전에는 `Azure Cognitive Search`로 알려짐)은 Microsoft 클라우드 검색 서비스로, 개발자들에게 벡터, 키워드, 하이브리드 쿼리에 대한 대규모 정보 검색을 위한 인프라, API, 도구를 제공합니다.

`AzureAISearchRetriever`는 구조화되지 않은 쿼리에서 문서를 반환하는 통합 모듈입니다. BaseRetriever 클래스를 기반으로 하며, Azure AI 검색의 2023-11-01 안정 REST API 버전을 대상으로 하므로 벡터 인덱싱과 쿼리를 지원합니다.

이 모듈을 사용하려면 다음이 필요합니다:

+ Azure AI 검색 서비스. Azure 평가판에 가입하면 무료로 생성할 수 있습니다. 무료 서비스는 할당량이 낮지만 이 노트북의 코드를 실행하는 데 충분합니다.

+ 벡터 필드가 있는 기존 인덱스. 이를 생성하는 방법에는 여러 가지가 있으며, [벡터 저장소 모듈](../vectorstores/azuresearch.md)을 사용하는 것도 그 중 하나입니다. 또는 [Azure AI 검색 REST API](https://learn.microsoft.com/azure/search/search-get-started-vector)를 사용해 보세요.

+ API 키. API 키는 검색 서비스를 생성할 때 생성됩니다. 인덱스만 쿼리하는 경우 쿼리 API 키를 사용할 수 있고, 그렇지 않은 경우 관리자 API 키를 사용해야 합니다. [API 키 찾기](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys)에서 자세한 내용을 확인하세요.

`AzureAISearchRetriever`는 곧 사용 중단될 `AzureCognitiveSearchRetriever`를 대체합니다. 최신 안정 버전의 검색 API를 기반으로 하는 새로운 버전으로 전환하는 것이 좋습니다.

## 패키지 설치

azure-documents-search 패키지 11.4 이상을 사용하세요.

```python
%pip install --upgrade --quiet langchain
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## 필수 라이브러리 가져오기

```python
import os

from langchain_community.retrievers import (
    AzureAISearchRetriever,
)
```

## 검색 설정 구성

검색 서비스 이름, 인덱스 이름, API 키를 환경 변수로 설정하세요(또는 `AzureAISearchRetriever`에 인수로 전달할 수 있습니다). 검색 인덱스는 검색 가능한 콘텐츠를 제공합니다.

```python
os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

## 리트리버 생성

`AzureAISearchRetriever`의 경우 `index_name`, `content_key`, `top_k`(검색 결과 수)를 제공하세요. `top_k`를 0(기본값)으로 설정하면 모든 결과가 반환됩니다.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

이제 이를 사용하여 Azure AI 검색에서 문서를 검색할 수 있습니다.
이것이 문서를 검색하는 메서드입니다. 쿼리와 관련된 모든 문서를 반환합니다.

```python
retriever.invoke("here is my unstructured query string")
```

## 예시

이 섹션에서는 기본 제공 샘플 데이터를 사용하여 리트리버를 사용하는 방법을 보여줍니다. 이미 검색 서비스에 벡터 인덱스가 있는 경우 이 단계를 건너뛸 수 있습니다.

먼저 엔드포인트와 키를 제공하세요. 이 단계에서 벡터 인덱스를 생성하므로 텍스트 임베딩 모델을 지정하여 텍스트의 벡터 표현을 얻습니다. 이 예에서는 Azure OpenAI의 text-embedding-ada-002 배포를 가정합니다. 이 단계에서 인덱스를 생성하므로 검색 서비스의 관리자 API 키를 사용해야 합니다.

```python
import os

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import TokenTextSplitter
from langchain.vectorstores import AzureSearch
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

Azure OpenAI의 임베딩 모델을 사용하여 문서를 임베딩으로 변환하고 Azure AI 검색 벡터 저장소에 저장합니다. 인덱스 이름을 `langchain-vector-demo`로 설정합니다. 이렇게 하면 해당 인덱스 이름과 연결된 새 벡터 저장소가 생성됩니다.

```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

다음으로 새로 생성된 벡터 저장소에 데이터를 로드합니다. 이 예에서는 `state_of_the_union.txt` 파일을 로드합니다. 텍스트를 400 토큰 청크로 분할하되 겹치지 않게 합니다. 마지막으로 문서를 벡터 저장소에 임베딩으로 추가합니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

그런 다음 리트리버를 생성합니다. 이전 단계의 `langchain-vector-demo` 인덱스 이름이 현재 `index_name` 변수에 있습니다. 벡터 저장소 생성을 건너뛴 경우 매개변수에 인덱스 이름을 제공하세요. 이 쿼리에서는 최상위 결과가 반환됩니다.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

이제 업로드한 문서에서 쿼리와 관련된 데이터를 검색할 수 있습니다.

```python
retriever.invoke("does the president have a plan for covid-19?")
```
