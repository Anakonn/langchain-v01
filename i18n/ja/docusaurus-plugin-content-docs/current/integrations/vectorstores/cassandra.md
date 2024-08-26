---
translated: true
---

# Apache Cassandra

このページでは、[Apache Cassandra®](https://cassandra.apache.org/) をベクトルストアとして使用するためのクイックスタートを提供します。

> [Cassandra](https://cassandra.apache.org/) は、NoSQL、行指向、高いスケーラビリティと高可用性を備えたデータベースです。バージョン5.0以降、このデータベースには[ベクトル検索機能](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html)が搭載されています。

_注: データベースへのアクセスに加えて、完全な例を実行するには OpenAI API キーが必要です。_

### セットアップと一般的な依存関係

このインテグレーションを使用するには、以下のPythonパッケージが必要です。

```python
%pip install --upgrade --quiet "cassio>=0.1.4"
```

_注: LangChainのセットアップに応じて、このデモに必要な他の依存関係をインストール/アップグレードする必要があるかもしれません_
_（特に、最近のバージョンの `datasets`、`openai`、`pypdf`、`tiktoken` が必要で、`langchain-community` も含まれます）。_

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## ベクトルストアのインポート

```python
from langchain_community.vectorstores import Cassandra
```

## 接続パラメーター

このページで示されているベクトルストアのインテグレーションは、CassandraおよびCQL（Cassandra Query Language）プロトコルを使用する他の派生データベース（例えばAstra DB）で使用できます。

> DataStax [Astra DB](https://docs.datastax.com/en/astra-serverless/docs/vector-search/quickstart.html) は、Cassandra上に構築されたマネージドサーバーレスデータベースで、同じインターフェースと強みを提供します。

CQLを介してCassandraクラスタまたはAstra DBに接続するかどうかに応じて、ベクトルストアオブジェクトを作成する際に異なるパラメーターを提供します。

### Cassandraクラスタへの接続

まず、`cassandra.cluster.Session`オブジェクトを作成する必要があります。詳細は[Cassandraドライバのドキュメント](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster)に記載されています。詳細は異なります（例：ネットワーク設定と認証）が、以下のようになります：

```python
from cassandra.cluster import Cluster

cluster = Cluster(["127.0.0.1"])
session = cluster.connect()
```

次に、セッションと希望するキースペース名をグローバルなCassIOパラメーターとして設定します：

```python
import cassio

CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")

cassio.init(session=session, keyspace=CASSANDRA_KEYSPACE)
```

これでベクトルストアを作成できます：

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

_注: ベクトルストアを作成するときにセッションとキースペースを直接パラメーターとして渡すこともできます。ただし、アプリケーションが複数の方法でCassandraを使用する場合（例：ベクトルストア、チャットメモリ、LLMレスポンスキャッシング）、グローバルな `cassio.init` 設定を使用すると、資格情報とDB接続管理を一元化するのに便利です。_

### CQLを介してAstra DBに接続

この場合、以下の接続パラメーターでCassIOを初期化します：

- データベースID、例：`01234567-89ab-cdef-0123-456789abcdef`
- トークン、例：`AstraCS:6gBhNmsk135....`（これは「データベース管理者」トークンである必要があります）
- 任意でキースペース名（省略した場合、データベースのデフォルトが使用されます）

```python
ASTRA_DB_ID = input("ASTRA_DB_ID = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_keyspace = input("ASTRA_DB_KEYSPACE (optional, can be left empty) = ")
if desired_keyspace:
    ASTRA_DB_KEYSPACE = desired_keyspace
else:
    ASTRA_DB_KEYSPACE = None
```

```python
import cassio

cassio.init(
    database_id=ASTRA_DB_ID,
    token=ASTRA_DB_APPLICATION_TOKEN,
    keyspace=ASTRA_DB_KEYSPACE,
)
```

これでベクトルストアを作成できます：

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

## データセットの読み込み

ソースデータセットの各エントリを `Document` に変換し、それをベクトルストアに書き込みます：

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

上記では、`metadata` 辞書はソースデータから作成され、`Document` の一部です。

今度は `add_texts` を使用していくつかのエントリを追加します：

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_注: これらのバルク操作の並行レベルを増やすことで、`add_texts` と `add_documents` の実行速度を上げることができます。_
_詳細については、メソッドの `batch_size` パラメーターを確認してください。ネットワークやクライアントマシンの仕様によって、最適なパラメーターの選択は異なる場合があります。_

## 検索の実行

このセクションでは、メタデータフィルタリングと類似度スコアの取得を示します：

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### MMR（最大限のマージナルリレバンス）検索

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

## 保存されたドキュメントの削除

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## 最小限のRAGチェーン

次のセルでは、簡単なRAGパイプラインを実装します：
- サンプルPDFファイルをダウンロードしてストアにロードします；
- LCEL（LangChain Expression Language）を使用してRAGチェーンを作成し、その中心にベクトルストアを配置します；
- 質問応答チェーンを実行します。

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

詳しくは、CQLを介してAstra DBを使用した完全なRAGテンプレートを[こちら](https://github.com/langchain-ai/langchain/tree/master/templates/cassandra-entomology-rag)で確認してください。

## クリーンアップ

次の手順では、CassIOから `Session` オブジェクトを取得し、それを使用してCQL `DROP TABLE` ステートメントを実行します：

_（保存したデータは失われます。）_

```python
cassio.config.resolve_session().execute(
    f"DROP TABLE {cassio.config.resolve_keyspace()}.cassandra_vector_demo;"
)
```

### 詳細情報

詳細情報、拡張クイックスタート、および追加の使用例については、LangChain `Cassandra` ベクトルストアの使用に関する [CassIOドキュメント](https://cassio.org/frameworks/langchain/about/) をご覧ください。

#### 帰属表示

> Apache Cassandra、Cassandra、およびApacheは、米国および/または他の国における[Apache Software Foundation](http://www.apache.org/) の登録商標または商標です。
