---
translated: true
---

# SAP HANA Cloud Vector Engine

>[SAP HANA Cloud Vector Engine](https://www.sap.com/events/teched/news-guide/ai.html#article8)は、`SAP HANA Cloud`データベースに完全に統合されたベクトルストアです。

## 設定

HANAデータベースドライバーのインストール。

```python
# Pip install necessary package
%pip install --upgrade --quiet  hdbcli
```

`OpenAIEmbeddings`には、環境からのOpenAI APIキーを使用します。

```python
import os
# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
```

HANAクラウドインスタンスへのデータベース接続を作成します。

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

## 例

サンプルドキュメント "state_of_the_union.txt"をロードし、それからチャンクを作成します。

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

HANAデータベースのLangChainベクトルストアインターフェースを作成し、ベクトル埋め込みにアクセスするためのテーブル(コレクション)を指定します。

```python
db = HanaDB(
    embedding=embeddings, connection=connection, table_name="STATE_OF_THE_UNION"
)
```

ロードしたドキュメントチャンクをテーブルに追加します。この例では、前回の実行で存在していた可能性のあるテーブルの内容を削除します。

```python
# Delete already existing documents from the table
db.delete(filter={})

# add the loaded document chunks
db.add_documents(text_chunks)
```

前の手順で追加したドキュメントチャンクから、最も一致するものを2つ取得するクエリを実行します。
デフォルトでは "Cosine Similarity"が使用されます。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)

for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

同じ内容を "Euclidian Distance"で検索します。結果は "Cosine Similarity"と同じはずです。

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

## 最大限の限界関連性検索 (MMR)

`最大限の限界関連性`は、クエリとの類似性と選択されたドキュメントの多様性を最適化します。最初の20(fetch_k)件がデータベースから取得されます。MMRアルゴリズムにより、最適な2(k)件が見つかります。

```python
docs = db.max_marginal_relevance_search(query, k=2, fetch_k=20)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## 基本的なベクトルストア操作

```python
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_BASIC"
)

# Delete already existing documents from the table
db.delete(filter={})
```

既存のテーブルに単純なテキストドキュメントを追加できます。

```python
docs = [Document(page_content="Some text"), Document(page_content="Other docs")]
db.add_documents(docs)
```

メタデータを持つドキュメントを追加します。

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

特定のメタデータを持つドキュメントをクエリします。

```python
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
# With filtering on "quality"=="bad", only one document should be returned
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

特定のメタデータを持つドキュメントを削除します。

```python
db.delete(filter={"quality": "bad"})

# Now the similarity search with the same filter will return no results
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
print(len(docs))
```

## 高度なフィルタリング

基本的な値ベースのフィルタリング機能に加えて、より高度なフィルタリングが可能です。
次の表は、使用可能なフィルタ演算子を示しています。

| 演算子 | 意味                 |
|----------|-------------------------|
| `$eq`    | 等しい (==)           |
| `$ne`    | 等しくない (!=)         |
| `$lt`    | 未満 (<)           |
| `$lte`   | 以下 (<=) |
| `$gt`    | 超過 (>)        |
| `$gte`   | 以上 (>=) |
| `$in`    | 指定された値のセットに含まれる (in)    |
| `$nin`   | 指定された値のセットに含まれない (not in)  |
| `$between` | 2つの境界値の範囲内 |
| `$like`  | SQLの "LIKE"セマンティクスに基づくテキストの等価性 ("%" をワイルドカードとして使用)  |
| `$and`   | 論理 "and"、2つ以上の被演算子をサポート |
| `$or`    | 論理 "or"、2つ以上の被演算子をサポート |

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

`$ne`、`$gt`、`$gte`、`$lt`、`$lte`によるフィルタリング

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

`$between`、`$in`、`$nin`によるフィルタリング

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

`$like`によるテキストフィルタリング

```python
advanced_filter = {"name": {"$like": "a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$like": "%a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

`$and`、`$or`による複合フィルタリング

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

## 検索拡張生成 (RAG) のためのチェーンでのベクトルストアの使用

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

プロンプトを定義します。

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

ConversationalRetrievalChainを作成します。これはチャット履歴と、プロンプトに追加される類似ドキュメントチャンクの検索を処理します。

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

最初の質問をします (使用されたテキストチャンクの数を確認します)。

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

チェーンで使用されたチャンクを詳しく調べます。質問に言及されている "Mexico and Guatemala"に関する情報が最高ランクのチャンクに含まれているかを確認します。

```python
for doc in source_docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

同じ会話チェーンで別の質問をします。前の回答に関連する回答が得られるはずです。

```python
question = "What about other countries?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])
```

## 標準テーブルと "カスタム"ベクトルデータテーブル

デフォルトでは、埋め込みのテーブルは3つの列で作成されます:

- `VEC_TEXT`列 - ドキュメントのテキストを含む
- `VEC_META`列 - ドキュメントのメタデータを含む
- `VEC_VECTOR`列 - ドキュメントテキストの埋め込みベクトルを含む

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

"LANGCHAIN_DEMO_NEW_TABLE"テーブルの列を表示します。

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

挿入されたドキュメントの3つの列の値を表示します。

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

カスタムテーブルには、少なくとも3つの列が必要で、標準テーブルのセマンティクスに一致する必要があります。

- `NCLOB`または`NVARCHAR`型の埋め込みのテキスト/コンテキストの列
- `NCLOB`または`NVARCHAR`型のメタデータの列
- `REAL_VECTOR`型の埋め込みベクトルの列

テーブルには追加の列を含めることができます。新しいドキュメントがテーブルに挿入される場合、これらの追加の列はNULL値を許可する必要があります。

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

別のドキュメントを追加し、カスタムテーブルで類似性検索を実行します。

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
