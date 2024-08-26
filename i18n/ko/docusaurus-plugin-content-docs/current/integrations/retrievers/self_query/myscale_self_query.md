---
translated: true
---

# 마이스케일

>[마이스케일](https://docs.myscale.com/en/)은 통합 벡터 데이터베이스입니다. SQL로 데이터베이스에 액세스할 수 있으며 여기, LangChain에서도 액세스할 수 있습니다.
>`마이스케일`은 [다양한 데이터 유형과 필터 기능](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints)을 활용할 수 있습니다. 데이터를 확장하거나 시스템을 더 광범위한 애플리케이션으로 확장하는지 여부에 관계없이 LLM 앱을 강화할 것입니다.

이 노트북에서는 LangChain에 추가한 몇 가지 추가 기능이 포함된 `MyScale` 벡터 스토어를 사용하는 `SelfQueryRetriever`를 시연할 것입니다.

요약하면 4가지 포인트로 압축할 수 있습니다:
1. 하나 이상의 요소가 일치하는 경우 목록의 일치 여부를 확인하는 `contain` 비교 연산자 추가
2. 날짜/시간 일치를 위한 `timestamp` 데이터 유형 추가(ISO 형식 또는 YYYY-MM-DD)
3. 문자열 패턴 검색을 위한 `like` 비교 연산자 추가
4. 임의 함수 기능 추가

## MyScale 벡터 스토어 만들기

MyScale은 이미 LangChain에 통합되어 있습니다. 따라서 [이 노트북](/docs/integrations/vectorstores/myscale)을 따라 자체 쿼리 리트리버를 위한 벡터 스토어를 만들 수 있습니다.

**참고:** 모든 자체 쿼리 리트리버에는 `lark`가 설치되어 있어야 합니다(`pip install lark`). 우리는 문법 정의를 위해 `lark`를 사용합니다. 다음 단계로 진행하기 전에 `clickhouse-connect`도 필요하다는 것을 상기시켜 드립니다.

```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

이 자습서에서는 다른 예제의 설정을 따르고 `OpenAIEmbeddings`를 사용합니다. LLM에 대한 유효한 액세스를 위해 OpenAI API 키를 받아야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

```python
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## 샘플 데이터 생성

다른 자체 쿼리 리트리버와 비교하여 생성한 데이터에는 일부 차이점이 있습니다. `year` 키워드를 `date`로 바꿨는데, 이를 통해 타임스탬프에 대한 더 세밀한 제어가 가능합니다. `gerne` 키워드의 유형을 문자열 목록으로 변경했는데, LLM에서 새로운 `contain` 비교 연산자를 사용하여 필터를 구성할 수 있습니다. 또한 다음 몇 개의 셀에서 소개할 `like` 비교 연산자와 임의 함수 지원을 제공합니다.

이제 데이터를 살펴보겠습니다.

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## 자체 쿼리 리트리버 만들기

다른 리트리버와 마찬가지로... 간단하고 좋습니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
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
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 기존 기능을 사용하여 자체 쿼리 리트리버 테스트하기

이제 실제로 리트리버를 사용해 볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

# 잠깐만... 더 있어?

MyScale을 사용하는 자체 쿼리 리트리버는 더 많은 기능을 할 수 있습니다! 알아보겠습니다.

```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```

```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```

```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```

```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
```

## k 필터링

자체 쿼리 리트리버를 사용하여 `k`(가져올 문서 수)를 지정할 수도 있습니다.

생성자에 `enable_limit=True`를 전달하여 이 기능을 활성화할 수 있습니다.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
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
