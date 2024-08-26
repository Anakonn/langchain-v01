---
translated: true
---

# Astra DB

このページでは、[Astra DB](https://docs.datastax.com/en/astra/home/astra.html) をベクトルストアとして使用するためのクイックスタートを提供します。

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) は、Apache Cassandra® に基づいて構築されたサーバーレスのベクトル対応データベースであり、使いやすい JSON API を通じて便利に利用できます。

_注: データベースへのアクセスに加えて、完全な例を実行するには OpenAI API キーが必要です。_

## セットアップと一般的な依存関係

統合を使用するには、対応する Python パッケージが必要です:

```python
pip install --upgrade langchain-astradb
```

_**注.** このページの完全なデモを実行するために必要なすべてのパッケージは以下の通りです。LangChain のセットアップによっては、一部をインストールする必要があるかもしれません:_

```python
pip install langchain langchain-openai datasets pypdf
```

### 依存関係のインポート

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
from langchain_astradb import AstraDBVectorStore
```

## 接続パラメータ

これらは Astra DB ダッシュボードで見つかります:

- API エンドポイントは `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` のようになります
- トークンは `AstraCS:6gBhNmsk135....` のようになります
- オプションで _Namespace_ を `my_namespace` のように指定することができます

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = input("(optional) Namespace = ")
if desired_namespace:
    ASTRA_DB_KEYSPACE = desired_namespace
else:
    ASTRA_DB_KEYSPACE = None
```

これでベクトルストアを作成できます:

```python
vstore = AstraDBVectorStore(
    embedding=embe,
    collection_name="astra_vector_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_KEYSPACE,
)
```

## データセットのロード

ソースデータセットの各エントリを `Document` に変換し、それをベクトルストアに書き込みます:

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

上記では、`metadata` 辞書がソースデータから作成され、`Document` の一部となります。

_注: 有効なメタデータフィールド名については [Astra DB API Docs](https://docs.datastax.com/en/astra-serverless/docs/develop/dev-with-json.html#_json_api_limits) を確認してください。いくつかの文字は予約されており、使用できません。_

今回は `add_texts` を使用して、いくつかのエントリを追加します:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_注: これらのバルク操作の実行速度を上げるために、_ 
_`add_texts` と `add_documents` の同時実行レベルを増やすことを検討してください。クラスコンストラクタの `*_concurrency` パラメータと `add_texts` のドックストリングを確認して_
_詳細を確認してください。ネットワークおよびクライアントマシンの仕様に応じて、最適なパラメータの選択が異なる場合があります。_

## 検索の実行

このセクションでは、メタデータフィルタリングと類似度スコアの取得を示します:

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

### MMR（最大限のマージナルリリバンス）検索

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

### 非同期

Astra DB ベクトルストアは、完全な非同期メソッド（`asimilarity_search`、`afrom_texts`、`adelete` など）をネイティブにサポートしており、スレッドラッピングは不要です。

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

次のセルでは、シンプルなRAGパイプラインを実装します:
- サンプルPDFファイルをダウンロードし、ストアにロードします;
- LCEL（LangChain Expression Language）を使用して、ベクトルストアを中心にしたRAGチェーンを作成します;
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

詳細については、Astra DB を使用した完全なRAGテンプレートを[こちら](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb)で確認してください。

## クリーンアップ

Astra DB インスタンスからコレクションを完全に削除したい場合は、これを実行します。

_(保存したデータは失われます。)_

```python
vstore.delete_collection()
```
