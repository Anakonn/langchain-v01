---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs)는 오픈 소스 Firebase 대안입니다. `Supabase`는 강력한 SQL 쿼리 기능을 제공하고 이미 존재하는 도구와 프레임워크와의 간단한 인터페이스를 가능하게 하는 `PostgreSQL` 위에 구축되었습니다.

>`PostgreSQL`(또한 `Postgres`로 알려짐)은 확장성과 SQL 준수성을 강조하는 무료 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS)입니다.

이 노트북은 `Supabase`와 `pgvector`를 VectorStore로 사용하는 방법을 보여줍니다.

이 노트북을 실행하려면 다음을 확인하세요:
- `pgvector` 확장이 활성화되어 있습니다
- `supabase-py` 패키지를 설치했습니다
- 데이터베이스에 `match_documents` 함수를 생성했습니다
- `public` 스키마에 아래와 유사한 `documents` 테이블이 있습니다

다음 함수는 코사인 유사성을 결정하지만, 필요에 따라 조정할 수 있습니다.

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

```python
# with pip
%pip install --upgrade --quiet  supabase

# with conda
# !conda install -c conda-forge supabase
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
```

```python
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
```

```python
# If you're storing your Supabase and OpenAI API keys in a .env file, you can load them with dotenv
from dotenv import load_dotenv

load_dotenv()
```

먼저 Supabase 클라이언트를 생성하고 OpenAI 임베딩 클래스를 인스턴스화합니다.

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

다음으로 벡터 저장소에 사용할 데이터를 로드하고 구문 분석합니다(이미 데이터베이스에 임베딩이 저장된 문서가 있는 경우 건너뛸 수 있습니다).

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

위의 문서를 데이터베이스에 삽입합니다. 각 문서에 대한 임베딩이 자동으로 생성됩니다. 문서 수에 따라 chunk_size를 조정할 수 있습니다. 기본값은 500이지만 더 낮출 필요가 있을 수 있습니다.

```python
vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
    chunk_size=500,
)
```

또는 이미 데이터베이스에 임베딩이 있는 문서가 있는 경우 새 `SupabaseVectorStore`를 직접 인스턴스화할 수 있습니다:

```python
vector_store = SupabaseVectorStore(
    embedding=embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

마지막으로 유사성 검색을 수행하여 테스트해 보겠습니다:

```python
query = "What did the president say about Ketanji Brown Jackson"
matched_docs = vector_store.similarity_search(query)
```

```python
print(matched_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 점수를 포함한 유사성 검색

반환된 거리 점수는 코사인 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
matched_docs = vector_store.similarity_search_with_relevance_scores(query)
```

```python
matched_docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 0.802509746274066)
```

## Retriever 옵션

이 섹션에서는 SupabaseVectorStore를 retriever로 사용하는 다양한 옵션을 살펴봅니다.

### 최대 한계 관련성 검색

retriever 객체에서 유사성 검색을 사용하는 것 외에도 `mmr`을 사용할 수 있습니다.

```python
retriever = vector_store.as_retriever(search_type="mmr")
```

```python
matched_docs = retriever.invoke(query)
```

```python
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq.

Stationed near Baghdad, just yards from burn pits the size of football fields.

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.

## Document 2

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.

But I want you to know that we are going to be okay.

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 3

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```
