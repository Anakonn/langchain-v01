---
translated: true
---

# ClickHouse

> [ClickHouse](https://clickhouse.com/)는 실시간 애플리케이션 및 분석을 위한 가장 빠르고 리소스 효율적인 오픈 소스 데이터베이스로, 완전한 SQL 지원과 분석 쿼리 작성을 돕는 다양한 기능을 제공합니다. 최근 추가된 데이터 구조와 거리 검색 기능(예: `L2Distance`) 및 [근사 최근접 이웃 검색 인덱스](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes)를 통해 ClickHouse는 벡터를 저장하고 SQL로 검색할 수 있는 고성능 및 확장 가능한 벡터 데이터베이스로 사용될 수 있습니다.

이 노트북은 `ClickHouse` 벡터 검색 기능 사용 방법을 보여줍니다.

## 환경 설정

Docker를 사용하여 로컬 clickhouse 서버 설정(선택 사항)

```python
! docker run -d -p 8123:8123 -p9000:9000 --name langchain-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server:23.4.2.11
```

ClickHouse 클라이언트 드라이버 설정

```python
%pip install --upgrade --quiet  clickhouse-connect
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

if not os.environ["OPENAI_API_KEY"]:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
for d in docs:
    d.metadata = {"some": "metadata"}
settings = ClickhouseSettings(table="clickhouse_vector_search_example")
docsearch = Clickhouse.from_documents(docs, embeddings, config=settings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 2801.49it/s]
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 연결 정보 및 데이터 스키마 가져오기

```python
print(str(docsearch))
```

```output
[92m[1mdefault.clickhouse_vector_search_example @ localhost:8123[0m

[1musername: None[0m

Table Schema:
---------------------------------------------------
|[94mid                      [0m|[96mNullable(String)        [0m|
|[94mdocument                [0m|[96mNullable(String)        [0m|
|[94membedding               [0m|[96mArray(Float32)          [0m|
|[94mmetadata                [0m|[96mObject('json')          [0m|
|[94muuid                    [0m|[96mUUID                    [0m|
---------------------------------------------------
```

### ClickHouse 테이블 스키마

> ClickHouse 테이블은 기본적으로 존재하지 않는 경우 자동으로 생성됩니다. 고급 사용자는 최적화된 설정으로 미리 테이블을 생성할 수 있습니다. 분산 ClickHouse 클러스터의 경우 테이블 엔진을 `Distributed`로 구성해야 합니다.

```python
print(f"Clickhouse Table DDL:\n\n{docsearch.schema}")
```

```output
Clickhouse Table DDL:

CREATE TABLE IF NOT EXISTS default.clickhouse_vector_search_example(
    id Nullable(String),
    document Nullable(String),
    embedding Array(Float32),
    metadata JSON,
    uuid UUID DEFAULT generateUUIDv4(),
    CONSTRAINT cons_vec_len CHECK length(embedding) = 1536,
    INDEX vec_idx embedding TYPE annoy(100,'L2Distance') GRANULARITY 1000
) ENGINE = MergeTree ORDER BY uuid SETTINGS index_granularity = 8192
```

## 필터링

ClickHouse SQL의 `WHERE` 절에 직접 액세스할 수 있습니다. 표준 SQL을 따르는 `WHERE` 절을 작성할 수 있습니다.

**주의**: SQL 주입에 주의해야 합니다. 이 인터페이스는 최종 사용자가 직접 호출해서는 안 됩니다.

`column_map`을 사용자 지정한 경우 다음과 같이 필터링할 수 있습니다:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = Clickhouse.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 6939.56it/s]
```

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.6779101415357189 {'doc_id': 0} Madam Speaker, Madam...
0.6997970363474885 {'doc_id': 8} And so many families...
0.7044504914336727 {'doc_id': 1} Groups of citizens b...
0.7053558702165094 {'doc_id': 6} And I’m taking robus...
```

## 데이터 삭제

```python
docsearch.drop()
```
