---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/)는 문서 색인 및 쿼리를 위한 사용하기 쉬운 API를 제공하는 신뢰할 수 있는 GenAI 플랫폼입니다.
>
>`Vectara`는 다음을 포함하는 `Retrieval Augmented Generation` 또는 [RAG](https://vectara.com/grounded-generation/)를 위한 엔드 투 엔드 관리 서비스를 제공합니다:
>1. 문서 파일에서 `텍스트를 추출`하고 문장으로 `chunk`하는 방법.
>2. 최신 [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 임베딩 모델. 각 텍스트 청크는 `Boomerang`을 사용하여 벡터 임베딩으로 인코딩되고 Vectara 내부 지식(벡터+텍스트) 저장소에 저장됩니다.
>3. 쿼리를 자동으로 임베딩하고 가장 관련성 있는 텍스트 세그먼트를 검색하는 쿼리 서비스([Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) 및 [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/) 지원 포함)
>4. 검색된 문서를 기반으로 [생성 요약](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)을 만들 수 있는 옵션(인용 포함).

Vectara API 문서에서 API 사용에 대한 자세한 정보를 확인하세요.

이 노트북은 LangChain에서 `SelfQueryRetriever`를 사용하는 방법을 보여줍니다.

# 설정

`Vectara`를 `LangChain`과 함께 사용하려면 `Vectara` 계정이 필요합니다. 시작하려면 다음 단계를 따르세요(빠른 시작 가이드 참조):
1. `Vectara` 계정이 없는 경우 [가입](https://console.vectara.com/signup)하세요. 가입을 완료하면 Vectara 고객 ID를 얻을 수 있습니다. Vectara 콘솔 창 오른쪽 상단의 이름을 클릭하면 고객 ID를 찾을 수 있습니다.
2. 계정에서 하나 이상의 코퍼스를 만들 수 있습니다. 각 코퍼스는 입력 문서에서 텍스트 데이터를 수집하는 영역을 나타냅니다. 코퍼스를 만들려면 **"Create Corpus"** 버튼을 사용하세요. 그런 다음 코퍼스에 이름과 설명을 제공합니다. 필터링 속성을 정의하고 고급 옵션을 적용할 수도 있습니다. 생성된 코퍼스를 클릭하면 이름과 코퍼스 ID를 확인할 수 있습니다.
3. 다음으로 코퍼스에 액세스하기 위한 API 키를 만들어야 합니다. 코퍼스 보기에서 **"Authorization"** 탭을 클릭한 다음 **"Create API Key"** 버튼을 클릭하세요. API 키에 이름을 지정하고 쿼리 전용 또는 쿼리+색인 권한을 선택하세요. "Create"를 클릭하면 활성 API 키가 생성됩니다. 이 키를 기밀로 유지하세요.

LangChain에서 Vectara를 사용하려면 고객 ID, 코퍼스 ID 및 api_key의 세 가지 값이 필요합니다.
LangChain에 이 값들을 두 가지 방법으로 제공할 수 있습니다:

1. 환경에 `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` 및 `VECTARA_API_KEY`라는 세 개의 변수를 포함합니다.

> 예를 들어 `os.environ` 및 `getpass`를 사용하여 이러한 변수를 다음과 같이 설정할 수 있습니다:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

1. Vectara 벡터 저장소 객체를 생성할 때 인수로 제공합니다:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

**참고:** self-query retriever를 사용하려면 `lark`를 설치해야 합니다(`pip install lark`).

## LangChain에서 Vectara에 연결하기

이 예에서는 계정을 만들고 코퍼스를 생성했으며 환경 변수로 `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` 및 `VECTARA_API_KEY`(색인 및 쿼리 권한으로 생성)를 추가했다고 가정합니다.

코퍼스에는 필터링을 위해 정의된 4개의 메타데이터 필드(year, director, rating, genre)가 있습니다.

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_text_splitters import CharacterTextSplitter
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts(
        [doc.page_content],
        embedding=FakeEmbeddings(size=768),
        doc_metadata=doc.metadata,
    )
```

## 자체 쿼리 검색기 만들기

이제 검색기를 인스턴스화할 수 있습니다. 이를 위해서는 문서에서 지원하는 메타데이터 필드에 대한 정보와 문서 내용에 대한 간단한 설명을 제공해야 합니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## 테스트해보기

이제 실제로 검색기를 사용해볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```

## 필터 k

self-query retriever를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

이를 위해 생성자에 `enable_limit=True`를 전달할 수 있습니다.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```
