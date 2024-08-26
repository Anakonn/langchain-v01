---
translated: true
---

# ハイブリッド検索

LangChainの標準的な検索は、ベクトル類似性によって行われます。しかし、多くのベクトルストア実装 (Astra DB、ElasticSearch、Neo4J、AzureSearch など) では、ベクトル類似性検索とその他の検索手法 (フルテキスト、BM25 など) を組み合わせた、より高度な "ハイブリッド" 検索をサポートしています。

**ステップ 1: 使用しているベクトルストアがハイブリッド検索をサポートしていることを確認する**

現時点では、LangChainでハイブリッド検索を実行する統一的な方法はありません。各ベクトルストアには独自の方法があります。これは通常、`similarity_search` の際に渡されるキーワード引数として公開されています。ドキュメントやソースコードを読んで、使用しているベクトルストアがハイブリッド検索をサポートしているかどうか、そしてどのように使用するかを確認してください。

**ステップ 2: そのパラメータをチェーンの設定可能なフィールドとして追加する**

これにより、チェーンを簡単に呼び出し、実行時に関連するフラグを設定できるようになります。設定に関する詳細は、[このドキュメント](/docs/expression_language/primitives/configure)を参照してください。

**ステップ 3: その設定可能なフィールドを使ってチェーンを呼び出す**

これで、実行時にこのチェーンを設定可能なフィールドとともに呼び出すことができます。

## コード例

Astra DB の Cassandra/CQL インターフェイスを使った具体的な例を見てみましょう。

以下のPythonパッケージをインストールします:

```python
!pip install "cassio>=0.1.7"
```

[接続シークレット](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html)を取得します。

Cassioを初期化します:

```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

標準の[インデックス アナライザー](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html)を使って、Cassandra ベクトルストアを作成します。インデックス アナライザーは、用語照合を有効にするために必要です。

```python
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

標準の類似性検索を行うと、すべてのドキュメントが取得されます:

```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2023, I visited Paris'),
Document(page_content='In 2021, I visited New Orleans')]
```

Astra DB ベクトルストアの `body_search` 引数を使って、用語 `new` でフィルタリングできます。

```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2021, I visited New Orleans')]
```

質問応答のために使用するチェーンを作成します。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
```

これは基本的な質問応答チェーンの設定です。

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

ここでは、リトリーバーを設定可能なフィールドとしてマークしています。すべてのベクトルストア リトリーバーには `search_kwargs` というフィールドがあります。これは単なる辞書で、ベクトルストア固有のフィールドが含まれています。

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

設定可能なリトリーバーを使ってチェーンを作成します。

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

```python
chain.invoke("What city did I visit last?")
```

```output
Paris
```

設定可能なオプションを使ってチェーンを呼び出すことができます。`search_kwargs` は設定可能なフィールドのIDで、値はAstra DBの検索パラメータです。

```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```

```output
New York
```
