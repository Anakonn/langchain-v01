---
translated: true
---

# Timescale Vector (Postgres)

>[Timescale Vector](https://www.timescale.com/ai)는 AI 애플리케이션을 위한 `PostgreSQL++`입니다. 이를 통해 수십억 개의 벡터 임베딩을 `PostgreSQL`에 효율적으로 저장하고 쿼리할 수 있습니다.
>
>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), 또한 `Postgres`로 알려져 있습니다.
> 이는 확장성과 `SQL` 준수에 중점을 둔 무료 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS)입니다.

이 노트북은 Postgres 벡터 데이터베이스(`TimescaleVector`)를 사용하여 자체 쿼리를 수행하는 방법을 보여줍니다. 이 노트북에서는 TimescaleVector 벡터 스토어를 래핑한 `SelfQueryRetriever`를 데모할 것입니다.

## Timescale Vector란 무엇인가요?

**[Timescale Vector](https://www.timescale.com/ai)는 AI 애플리케이션을 위한 PostgreSQL++입니다.**

Timescale Vector를 통해 `PostgreSQL`에 수백만 개의 벡터 임베딩을 효율적으로 저장하고 쿼리할 수 있습니다.
- `pgvector`를 향상시켜 DiskANN 영감의 인덱싱 알고리즘을 통해 10억 개 이상의 벡터에서 더 빠르고 정확한 유사성 검색을 가능하게 합니다.
- 자동 시간 기반 파티셔닝 및 인덱싱을 통해 빠른 시간 기반 벡터 검색을 가능하게 합니다.
- 벡터 임베딩과 관계형 데이터를 쿼리하기 위한 익숙한 SQL 인터페이스를 제공합니다.

Timescale Vector는 POC에서 프로덕션까지 확장되는 클라우드 PostgreSQL for AI입니다:
- 관계형 메타데이터, 벡터 임베딩 및 시계열 데이터를 단일 데이터베이스에 저장할 수 있게 하여 운영을 단순화합니다.
- 엔터프라이즈급 기능인 스트리밍 백업 및 복제, 고가용성 및 행 수준 보안이 있는 견고한 PostgreSQL 기반의 이점을 누릴 수 있습니다.
- 엔터프라이즈급 보안 및 규정 준수로 걱정 없는 경험을 제공합니다.

## Timescale Vector 액세스 방법

Timescale Vector는 [Timescale](https://www.timescale.com/ai), 클라우드 PostgreSQL 플랫폼에서 사용할 수 있습니다. (현재 자체 호스팅 버전은 없습니다.)

LangChain 사용자는 Timescale Vector에 대한 90일 무료 평가판을 받을 수 있습니다.
- 시작하려면 [가입](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)하여 새 데이터베이스를 만들고 이 노트북을 따르세요!
- [Timescale Vector 설명 블로그](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)에서 자세한 내용과 성능 벤치마크를 확인하세요.
- [설치 지침](https://github.com/timescale/python-vector)에서 Python에서 Timescale Vector 사용에 대한 자세한 내용을 확인하세요.

## TimescaleVector 벡터 스토어 만들기

먼저 Timescale Vector 벡터 스토어를 만들고 일부 데이터로 채워 보겠습니다. 영화 요약이 포함된 작은 데모 세트를 만들었습니다.

참고: 자체 쿼리 리트리버를 사용하려면 `lark`를 설치해야 합니다(`pip install lark`). `timescale-vector` 패키지도 필요합니다.

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  timescale-vector
```

이 예에서는 `OpenAIEmbeddings`를 사용할 것이므로 OpenAI API 키를 로드해 보겠습니다.

```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

PostgreSQL 데이터베이스에 연결하려면 서비스 URI가 필요합니다. 이는 새 데이터베이스를 만든 후 받은 치트시트 또는 `.env` 파일에서 찾을 수 있습니다.

아직 하지 않았다면 [Timescale에 가입](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)하고 새 데이터베이스를 만드세요.

URI는 다음과 같은 형식일 것입니다: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`

```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```

```python
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

여기에 이 데모에 사용할 샘플 문서가 있습니다. 이 데이터는 영화에 관한 것이며 콘텐츠와 메타데이터 필드에 특정 영화에 대한 정보가 포함되어 있습니다.

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
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
```

마지막으로 Timescale Vector 벡터 스토어를 만들겠습니다. 컬렉션 이름은 문서가 저장되는 PostgreSQL 테이블의 이름이 됩니다.

```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## 자체 쿼리 리트리버 만들기

이제 리트리버를 인스턴스화할 수 있습니다. 이를 위해 문서에서 지원하는 메타데이터 필드에 대한 정보와 문서 내용에 대한 간단한 설명을 제공해야 합니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
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

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Timescale Vector(Postgres)를 사용한 자체 쿼리 검색

이제 실제로 리트리버를 사용해 보겠습니다!

아래 쿼리를 실행해 보세요. 쿼리, 필터, 복합 필터(AND, OR가 포함된 필터)를 자연어로 지정할 수 있으며, 자체 쿼리 리트리버가 이를 SQL로 변환하고 Timescale Vector(Postgres) 벡터 스토어에서 검색을 수행합니다.

이는 자체 쿼리 리트리버의 강력함을 보여줍니다. 사용자가 직접 SQL을 작성할 필요 없이 복잡한 검색을 수행할 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

### k 필터링

자체 쿼리 리트리버를 사용하여 `k`: 가져올 문서 수를 지정할 수도 있습니다.

이를 위해 생성자에 `enable_limit=True`를 전달하면 됩니다.

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
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```
