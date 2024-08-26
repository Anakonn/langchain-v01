---
translated: true
---

# Qdrant

>[Qdrant](https://qdrant.tech/documentation/) (read: quadrant)은 벡터 유사성 검색 엔진입니다. 편리한 API를 제공하여 벡터와 추가 페이로드를 저장, 검색 및 관리할 수 있는 프로덕션 준비 서비스를 제공합니다. `Qdrant`는 확장된 필터링 지원에 맞춰져 있습니다. 이는 신경망 또는 의미 기반 매칭, 패싯 검색 및 기타 응용 프로그램에 유용합니다.

이 노트북은 `Qdrant` 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

`Qdrant`를 실행하는 다양한 모드가 있으며, 선택한 모드에 따라 약간의 차이가 있습니다. 옵션에는 다음이 포함됩니다:
- 로컬 모드, 서버 불필요
- 온-프레미스 서버 배포
- Qdrant Cloud

[설치 지침](https://qdrant.tech/documentation/install/)을 참조하세요.

```python
%pip install --upgrade --quiet  qdrant-client
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## LangChain에서 Qdrant에 연결하기

### 로컬 모드

Python 클라이언트를 사용하면 Qdrant 서버를 실행하지 않고도 동일한 코드를 로컬 모드로 실행할 수 있습니다. 이는 테스트 및 디버깅을 위해 좋으며, 소량의 벡터만 저장할 계획인 경우에도 유용합니다. 임베딩은 메모리에 완전히 보관되거나 디스크에 영구 저장될 수 있습니다.

#### 메모리 내

일부 테스트 시나리오와 빠른 실험의 경우 모든 데이터를 메모리에만 보관하는 것이 좋습니다. 이 경우 클라이언트가 파괴될 때(일반적으로 스크립트/노트북 끝에서) 데이터가 손실됩니다.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",  # Local mode with in-memory storage only
    collection_name="my_documents",
)
```

#### 디스크 저장

Qdrant 서버를 사용하지 않는 로컬 모드에서도 벡터를 디스크에 저장하여 실행 간에 영구 저장할 수 있습니다.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    path="/tmp/local_qdrant",
    collection_name="my_documents",
)
```

### 온-프레미스 서버 배포

[Docker 컨테이너](https://qdrant.tech/documentation/install/)로 로컬에서 Qdrant를 시작하든, [공식 Helm 차트](https://github.com/qdrant/qdrant-helm)를 사용하여 Kubernetes 배포를 선택하든, 해당 인스턴스에 연결하는 방법은 동일합니다. 서비스를 가리키는 URL을 제공해야 합니다.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### Qdrant Cloud

인프라 관리에 신경 쓰고 싶지 않다면 [Qdrant Cloud](https://cloud.qdrant.io/)에서 완전 관리형 Qdrant 클러스터를 설정할 수 있습니다. 체험용으로 1GB 무료 클러스터가 제공됩니다. Qdrant의 관리형 버전을 사용하는 주된 차이점은 공개적으로 액세스되지 않도록 API 키를 제공해야 한다는 것입니다.

```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## 컬렉션 다시 만들기

`Qdrant.from_texts` 및 `Qdrant.from_documents` 메서드는 Langchain에서 Qdrant 사용을 시작하는 데 좋습니다. 이전 버전에서는 이러한 메서드를 호출할 때마다 컬렉션이 다시 생성되었습니다. 이 동작이 변경되었습니다. 현재 컬렉션이 이미 존재하는 경우 재사용됩니다. `force_recreate`를 `True`로 설정하면 이전 컬렉션을 제거하고 처음부터 다시 시작할 수 있습니다.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
    force_recreate=True,
)
```

## 유사성 검색

Qdrant 벡터 저장소를 사용하는 가장 간단한 시나리오는 유사성 검색을 수행하는 것입니다. 내부적으로 쿼리가 `embedding_function`으로 인코딩되어 Qdrant 컬렉션에서 유사한 문서를 찾는 데 사용됩니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 점수를 포함한 유사성 검색

때로는 검색을 수행하고 관련성 점수를 얻어 특정 결과가 얼마나 좋은지 알고 싶을 수 있습니다.
반환된 거리 점수는 코사인 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Score: 0.8153784913324512
```

### 메타데이터 필터링

Qdrant에는 [풍부한 유형 지원](https://qdrant.tech/documentation/concepts/filtering/)을 갖춘 광범위한 필터링 시스템이 있습니다. Langchain에서도 필터를 사용할 수 있으며, `similarity_search_with_score` 및 `similarity_search` 메서드에 추가 매개변수를 전달하면 됩니다.

```python
from qdrant_client.http import models as rest

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query, filter=rest.Filter(...))
```

## 최대 한계 관련성 검색(MMR)

유사한 문서를 찾고 싶지만 다양한 결과를 받고 싶다면 MMR 방법을 고려해 보세요. 최대 한계 관련성은 쿼리에 대한 유사성과 선택된 문서 간의 다양성을 최적화합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

```python
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## Retriever로서의 Qdrant

Qdrant는 다른 모든 벡터 저장소와 마찬가지로 코사인 유사성을 사용하는 LangChain Retriever입니다.

```python
retriever = qdrant.as_retriever()
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='similarity', search_kwargs={})
```

검색 전략으로 유사성 대신 MMR을 지정할 수도 있습니다.

```python
retriever = qdrant.as_retriever(search_type="mmr")
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='mmr', search_kwargs={})
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

## Qdrant 사용자 정의

Langchain 애플리케이션에서 기존 Qdrant 컬렉션을 사용하려면 몇 가지 옵션이 있습니다. 이러한 경우 Qdrant 포인트를 Langchain `Document`에 매핑하는 방법을 정의해야 할 수 있습니다.

### 이름 지정된 벡터

[다중 벡터 per 포인트](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors)를 지원하는 Qdrant는 이름 지정 벡터를 사용합니다. Langchain은 문서당 단일 임베딩만 필요로 하며, 기본적으로 단일 벡터를 사용합니다. 그러나 외부에서 생성된 컬렉션을 사용하거나 이름 지정 벡터를 사용하려는 경우, 해당 이름을 제공하여 구성할 수 있습니다.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    vector_name="custom_vector",
)
```

Langchain 사용자로서 이름 지정 벡터를 사용하든 사용하지 않든 차이가 없습니다. Qdrant 통합이 내부에서 변환을 처리합니다.

### 메타데이터

Qdrant는 선택적 JSON 형식의 페이로드와 함께 벡터 임베딩을 저장합니다. 페이로드는 선택 사항이지만, Langchain은 임베딩이 문서에서 생성된 것으로 가정하므로 컨텍스트 데이터를 유지하여 원본 텍스트를 추출할 수 있습니다.

기본적으로 문서는 다음과 같은 페이로드 구조로 저장됩니다:

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

그러나 페이지 콘텐츠와 메타데이터에 대해 다른 키를 사용하도록 결정할 수 있습니다. 이는 이미 사용하고 있는 컬렉션을 재사용하려는 경우에 유용합니다.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

```output
<langchain_community.vectorstores.qdrant.Qdrant at 0x7fc4e2baa230>
```
