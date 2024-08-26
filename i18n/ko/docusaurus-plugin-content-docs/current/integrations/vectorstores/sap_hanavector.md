---
translated: true
---

# SAP HANA Cloud Vector Engine

>[SAP HANA Cloud Vector Engine](https://www.sap.com/events/teched/news-guide/ai.html#article8)은 `SAP HANA Cloud` 데이터베이스에 완전히 통합된 벡터 저장소입니다.

## 설정

HANA 데이터베이스 드라이버 설치.

```python
# Pip install necessary package
%pip install --upgrade --quiet  hdbcli
```

`OpenAIEmbeddings`의 경우 환경에서 OpenAI API 키를 사용합니다.

```python
import os
# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
```

HANA Cloud 인스턴스에 데이터베이스 연결을 생성합니다.

```python
from hdbcli import dbapi

# Use connection settings from the environment
connection = dbapi.connect(
    address=os.environ.get("HANA_DB_ADDRESS"),
    port=os.environ.get("HANA_DB_PORT"),
    user=os.environ.get("HANA_DB_USER"),
    password=os.environ.get("HANA_DB_PASSWORD"),
    autocommit=True,
    sslValidateCertificate=False,
)
```

## 예제

샘플 문서 "state_of_the_union.txt"를 로드하고 청크로 만듭니다.

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hanavector import HanaDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
text_chunks = text_splitter.split_documents(text_documents)
print(f"Number of document chunks: {len(text_chunks)}")

embeddings = OpenAIEmbeddings()
```

HANA 데이터베이스에 대한 LangChain VectorStore 인터페이스를 생성하고 벡터 임베딩에 액세스하기 위한 테이블(컬렉션)을 지정합니다.

```python
db = HanaDB(
    embedding=embeddings, connection=connection, table_name="STATE_OF_THE_UNION"
)
```

이전 단계에서 로드된 문서 청크를 테이블에 추가합니다. 이 예에서는 이전 실행에서 존재할 수 있는 테이블의 이전 내용을 삭제합니다.

```python
# Delete already existing documents from the table
db.delete(filter={})

# add the loaded document chunks
db.add_documents(text_chunks)
```

이전 단계에서 추가된 문서 청크 중에서 가장 잘 일치하는 두 개를 쿼리합니다.
기본적으로 "Cosine Similarity"가 검색에 사용됩니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)

for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

동일한 내용을 "Euclidian Distance"로 쿼리합니다. 결과는 "Cosine Similarity"와 동일해야 합니다.

```python
from langchain_community.vectorstores.utils import DistanceStrategy

db = HanaDB(
    embedding=embeddings,
    connection=connection,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
    table_name="STATE_OF_THE_UNION",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## 최대 한계 관련성 검색(MMR)

`최대 한계 관련성`은 쿼리와의 유사성과 선택된 문서의 다양성을 최적화합니다. 처음 20개(fetch_k) 항목이 DB에서 검색됩니다. MMR 알고리즘은 그 중에서 가장 좋은 2개(k)의 일치 항목을 찾습니다.

```python
docs = db.max_marginal_relevance_search(query, k=2, fetch_k=20)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## 기본 벡터 저장소 작업

```python
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_BASIC"
)

# Delete already existing documents from the table
db.delete(filter={})
```

기존 테이블에 간단한 텍스트 문서를 추가할 수 있습니다.

```python
docs = [Document(page_content="Some text"), Document(page_content="Other docs")]
db.add_documents(docs)
```

메타데이터가 있는 문서를 추가합니다.

```python
docs = [
    Document(
        page_content="foo",
        metadata={"start": 100, "end": 150, "doc_name": "foo.txt", "quality": "bad"},
    ),
    Document(
        page_content="bar",
        metadata={"start": 200, "end": 250, "doc_name": "bar.txt", "quality": "good"},
    ),
]
db.add_documents(docs)
```

특정 메타데이터가 있는 문서를 쿼리합니다.

```python
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
# With filtering on "quality"=="bad", only one document should be returned
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

특정 메타데이터가 있는 문서를 삭제합니다.

```python
db.delete(filter={"quality": "bad"})

# Now the similarity search with the same filter will return no results
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
print(len(docs))
```

## 고급 필터링

기본적인 값 기반 필터링 기능 외에도 더 고급 필터링을 사용할 수 있습니다.
아래 표에는 사용 가능한 필터 연산자가 나와 있습니다.

| 연산자 | 의미                 |
|----------|-------------------------|
| `$eq`    | 동등 (==)           |
| `$ne`    | 부등 (!=)         |
| `$lt`    | 미만 (<)           |
| `$lte`   | 이하 (<=) |
| `$gt`    | 초과 (>)        |
| `$gte`   | 이상 (>=) |
| `$in`    | 주어진 값 집합에 포함  (in)    |
| `$nin`   | 주어진 값 집합에 포함되지 않음  (not in)  |
| `$between` | 두 경계 값 사이 |
| `$like`  | SQL의 "LIKE" 의미에 따른 텍스트 동등성 ("%"를 와일드카드로 사용)  |
| `$and`   | 논리 "and", 2개 이상의 피연산자 지원 |
| `$or`    | 논리 "or", 2개 이상의 피연산자 지원 |

```python
# Prepare some test documents
docs = [
    Document(
        page_content="First",
        metadata={"name": "adam", "is_active": True, "id": 1, "height": 10.0},
    ),
    Document(
        page_content="Second",
        metadata={"name": "bob", "is_active": False, "id": 2, "height": 5.7},
    ),
    Document(
        page_content="Third",
        metadata={"name": "jane", "is_active": True, "id": 3, "height": 2.4},
    ),
]

db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_ADVANCED_FILTER",
)

# Delete already existing documents from the table
db.delete(filter={})
db.add_documents(docs)


# Helper function for printing filter results
def print_filter_result(result):
    if len(result) == 0:
        print("<empty result>")
    for doc in result:
        print(doc.metadata)
```

`$ne`, `$gt`, `$gte`, `$lt`, `$lte`를 사용한 필터링

```python
advanced_filter = {"id": {"$ne": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$between`, `$in`, `$nin`을 사용한 필터링

```python
advanced_filter = {"id": {"$between": (1, 2)}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$in": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$nin": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$like`를 사용한 텍스트 필터링

```python
advanced_filter = {"name": {"$like": "a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$like": "%a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$and`, `$or`을 사용한 결합 필터링

```python
advanced_filter = {"$or": [{"id": 1}, {"name": "bob"}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$and": [{"id": 1}, {"id": 2}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$or": [{"id": 1}, {"id": 2}, {"id": 3}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

## 검색 보강 생성(RAG)을 위한 체인의 리트리버로 VectorStore 사용

```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

# Access the vector DB with a new table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_RETRIEVAL_CHAIN",
)

# Delete already existing entries from the table
db.delete(filter={})

# add the loaded document chunks from the "State Of The Union" file
db.add_documents(text_chunks)

# Create a retriever instance of the vector store
retriever = db.as_retriever()
```

프롬프트 정의.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """
You are an expert in state of the union topics. You are provided multiple context items that are related to the prompt you have to answer.
Use the following pieces of context to answer the question at the end.

\```

{context}

\```

Question: {question}
"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
chain_type_kwargs = {"prompt": PROMPT}
```

채팅 기록과 유사한 문서 청크 검색을 처리하는 ConversationalRetrievalChain 생성.

```python
from langchain.chains import ConversationalRetrievalChain

llm = ChatOpenAI(model="gpt-3.5-turbo")
memory = ConversationBufferMemory(
    memory_key="chat_history", output_key="answer", return_messages=True
)
qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    memory=memory,
    verbose=False,
    combine_docs_chain_kwargs={"prompt": PROMPT},
)
```

첫 번째 질문 묻기(그리고 사용된 텍스트 청크 수 확인).

```python
question = "What about Mexico and Guatemala?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])

source_docs = result["source_documents"]
print("================")
print(f"Number of used source document chunks: {len(source_docs)}")
```

체인에서 사용된 청크를 자세히 살펴봅니다. 질문에 언급된 "멕시코와 과테말라"에 대한 정보가 최상위 순위 청크에 포함되어 있는지 확인합니다.

```python
for doc in source_docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

동일한 대화 체인에서 다른 질문 묻기. 이전 답변과 관련된 답변이 나와야 합니다.

```python
question = "What about other countries?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])
```

## 표준 테이블 vs. 벡터 데이터가 있는 "사용자 정의" 테이블

기본적으로 임베딩을 위한 테이블은 3개의 열로 생성됩니다:

- `VEC_TEXT` 열에는 문서의 텍스트가 포함됩니다.
- `VEC_META` 열에는 문서의 메타데이터가 포함됩니다.
- `VEC_VECTOR` 열에는 문서 텍스트의 임베딩 벡터가 포함됩니다.

```python
# Access the vector DB with a new table
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_NEW_TABLE"
)

# Delete already existing entries from the table
db.delete(filter={})

# Add a simple document with some metadata
docs = [
    Document(
        page_content="A simple document",
        metadata={"start": 100, "end": 150, "doc_name": "simple.txt"},
    )
]
db.add_documents(docs)
```

"LANGCHAIN_DEMO_NEW_TABLE" 테이블의 열을 표시합니다.

```python
cur = connection.cursor()
cur.execute(
    "SELECT COLUMN_NAME, DATA_TYPE_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = 'LANGCHAIN_DEMO_NEW_TABLE'"
)
rows = cur.fetchall()
for row in rows:
    print(row)
cur.close()
```

삽입된 문서의 세 열 값을 표시합니다.

```python
cur = connection.cursor()
cur.execute(
    "SELECT VEC_TEXT, VEC_META, TO_NVARCHAR(VEC_VECTOR) FROM LANGCHAIN_DEMO_NEW_TABLE LIMIT 1"
)
rows = cur.fetchall()
print(rows[0][0])  # The text
print(rows[0][1])  # The metadata
print(rows[0][2])  # The vector
cur.close()
```

사용자 정의 테이블에는 최소 3개의 열이 있어야 하며, 표준 테이블의 의미와 일치해야 합니다.

- 임베딩의 텍스트/컨텍스트를 위한 `NCLOB` 또는 `NVARCHAR` 유형의 열
- 메타데이터를 위한 `NCLOB` 또는 `NVARCHAR` 유형의 열
- 임베딩 벡터를 위한 `REAL_VECTOR` 유형의 열

테이블에 추가 열을 포함할 수 있습니다. 새 문서가 테이블에 삽입될 때 이러한 추가 열은 NULL 값을 허용해야 합니다.

```python
# Create a new table "MY_OWN_TABLE" with three "standard" columns and one additional column
my_own_table_name = "MY_OWN_TABLE"
cur = connection.cursor()
cur.execute(
    (
        f"CREATE TABLE {my_own_table_name} ("
        "SOME_OTHER_COLUMN NVARCHAR(42), "
        "MY_TEXT NVARCHAR(2048), "
        "MY_METADATA NVARCHAR(1024), "
        "MY_VECTOR REAL_VECTOR )"
    )
)

# Create a HanaDB instance with the own table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name=my_own_table_name,
    content_column="MY_TEXT",
    metadata_column="MY_METADATA",
    vector_column="MY_VECTOR",
)

# Add a simple document with some metadata
docs = [
    Document(
        page_content="Some other text",
        metadata={"start": 400, "end": 450, "doc_name": "other.txt"},
    )
]
db.add_documents(docs)

# Check if data has been inserted into our own table
cur.execute(f"SELECT * FROM {my_own_table_name} LIMIT 1")
rows = cur.fetchall()
print(rows[0][0])  # Value of column "SOME_OTHER_DATA". Should be NULL/None
print(rows[0][1])  # The text
print(rows[0][2])  # The metadata
print(rows[0][3])  # The vector

cur.close()
```

다른 문서를 추가하고 사용자 정의 테이블에서 유사성 검색을 수행합니다.

```python
docs = [
    Document(
        page_content="Some more text",
        metadata={"start": 800, "end": 950, "doc_name": "more.txt"},
    )
]
db.add_documents(docs)

query = "What's up?"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```
