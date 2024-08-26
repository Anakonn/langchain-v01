---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs)는 오픈 소스 `Firebase` 대안입니다.
>`Supabase`는 강력한 `SQL` 쿼리 기능을 제공하고 이미 존재하는 도구와 프레임워크와의 간단한 인터페이스를 가능하게 하는 `PostgreSQL` 위에 구축되었습니다.

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)은 `Postgres`라고도 알려진 무료 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS)으로, 확장성과 `SQL` 준수에 중점을 두고 있습니다.
>
>[Supabase](https://supabase.com/docs/guides/ai)는 Postgres와 pgvector를 사용하여 AI 애플리케이션을 개발하기 위한 오픈 소스 도구 키트를 제공합니다. Supabase 클라이언트 라이브러리를 사용하여 벡터 임베딩을 대규모로 저장, 인덱싱 및 쿼리할 수 있습니다.

이 노트북에서는 `Supabase` 벡터 스토어를 사용하는 `SelfQueryRetriever`를 데모할 것입니다.

구체적으로 다음을 수행할 것입니다:
1. Supabase 데이터베이스 생성
2. `pgvector` 확장 활성화
3. `documents` 테이블과 `SupabaseVectorStore`에서 사용되는 `match_documents` 함수 생성
4. 벡터 스토어(데이터베이스 테이블)에 샘플 문서 로드
5. 자체 쿼리 리트리버 구축 및 테스트

## Supabase 데이터베이스 설정

1. https://database.new로 이동하여 Supabase 데이터베이스를 프로비저닝하세요.
2. 스튜디오에서 [SQL 편집기](https://supabase.com/dashboard/project/_/sql/new)로 이동하고 다음 스크립트를 실행하여 `pgvector`를 활성화하고 데이터베이스를 벡터 스토어로 설정하세요:

```sql
-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table
    documents (
    id uuid primary key,
    content text, -- corresponds to Document.pageContent
    metadata jsonb, -- corresponds to Document.metadata
    embedding vector (1536) -- 1536 works for OpenAI embeddings, change if needed
    );

-- Create a function to search for documents
create function match_documents (
    query_embedding vector (1536),
    filter jsonb default '{}'
) returns table (
    id uuid,
    content text,
    metadata jsonb,
    similarity float
) language plpgsql as $$
#variable_conflict use_column
begin
    return query
    select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where metadata @> filter
    order by documents.embedding <=> query_embedding;
end;
$$;
```

## Supabase 벡터 스토어 생성

다음으로 Supabase 벡터 스토어를 만들고 일부 데이터로 채워 보겠습니다. 영화 요약이 포함된 작은 데모 문서 세트를 만들었습니다.

`openai` 지원이 포함된 최신 버전의 `langchain`을 설치해야 합니다:

```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

자체 쿼리 리트리버에는 `lark`가 설치되어 있어야 합니다:

```python
%pip install --upgrade --quiet  lark
```

`supabase` 패키지도 필요합니다:

```python
%pip install --upgrade --quiet  supabase
```

`SupabaseVectorStore`와 `OpenAIEmbeddings`를 사용하므로 API 키를 로드해야 합니다.

- `SUPABASE_URL`과 `SUPABASE_SERVICE_KEY`를 찾으려면 Supabase 프로젝트의 [API 설정](https://supabase.com/dashboard/project/_/settings/api)으로 이동하세요.
  - `SUPABASE_URL`은 프로젝트 URL에 해당합니다.
  - `SUPABASE_SERVICE_KEY`는 `service_role` API 키에 해당합니다.

- `OPENAI_API_KEY`를 얻으려면 OpenAI 계정의 [API 키](https://platform.openai.com/account/api-keys) 페이지로 이동하여 새 비밀 키를 만드세요.

```python
import getpass
import os

os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_선택 사항:_ Supabase와 OpenAI API 키를 `.env` 파일에 저장하는 경우 [`dotenv`](https://github.com/theskumar/python-dotenv)로 로드할 수 있습니다.

```python
%pip install --upgrade --quiet  python-dotenv
```

```python
from dotenv import load_dotenv

load_dotenv()
```

먼저 Supabase 클라이언트와 OpenAI 임베딩 클래스를 인스턴스화하겠습니다.

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

다음으로 문서를 만들어 보겠습니다.

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

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## 자체 쿼리 리트리버 생성

이제 리트리버를 인스턴스화할 수 있습니다. 이를 위해서는 문서의 메타데이터 필드와 문서 내용에 대한 간단한 설명을 미리 제공해야 합니다.

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
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 테스트해 보기

이제 실제로 리트리버를 사용해 볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
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
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## k 필터링

자체 쿼리 리트리버를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

이를 위해 생성자에 `enable_limit=True`를 전달할 수 있습니다.

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

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
