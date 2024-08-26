---
translated: true
---

# Xata

> [Xata](https://xata.io)は、PostgreSQLをベースにしたサーバーレスのデータプラットフォームです。PythonのSDKを使ってデータベースと対話し、UIでデータを管理することができます。
> Xataにはネイティブのベクトル型があり、任意のテーブルに追加できます。また、類似検索もサポートしています。LangChainは、ベクトルをXataに直接挿入し、与えられたベクトルの最近傍を検索するクエリを実行するため、LangChainのEmbeddingsインテグレーションをすべてXataで使用できます。

このノートブックでは、Xataをベクトルストアとして使用する方法を説明します。

## セットアップ

### ベクトルストアとして使用するデータベースを作成する

[Xata UI](https://app.xata.io)で新しいデータベースを作成します。任意の名前をつけることができますが、ここでは`langchain`を使用します。
テーブルを作成します。こちらも任意の名前をつけられますが、ここでは`vectors`を使用します。UIから以下の列を追加します:

* `content` - "Text"型。`Document.pageContent`の値を格納するために使用します。
* `embedding` - "Vector"型。使用するモデルの次元数に合わせます。ここではOpenAIの1536次元の埋め込みを使用します。
* `source` - "Text"型。このサンプルのメタデータ列として使用します。
* その他、メタデータとして使用したい列。`Document.metadata`オブジェクトから取得されます。例えば、`Document.metadata`に`title`プロパティがある場合、`title`列を作成すると、そこに値が入ります。

まずは依存関係をインストールしましょう:

```python
%pip install --upgrade --quiet  xata langchain-openai tiktoken langchain
```

OpenAIのキーを環境変数に設定します。持っていない場合は、OpenAIのアカウントを作成し、[このページ](https://platform.openai.com/account/api-keys)でキーを作成してください。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

同様に、Xataの環境変数も必要です。[アカウント設定](https://app.xata.io/settings)からAPIキーを作成できます。データベースのURLは、作成したデータベースの[設定]ページで確認できます。データベースのURLは`https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`のような形式になります。

```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Xataベクトルストアを作成する

テストデータセットをインポートしましょう:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Xataのテーブルをバックエンドとするベクトルストアを作成します。

```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

上記のコマンドを実行すると、Xata UIにドキュメントとそのエンベディングが読み込まれているのが確認できます。
既にベクトルコンテンツを含むXataのテーブルを使用する場合は、XataVectorStoreコンストラクタを初期化します:

```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
```

### 類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### スコア付き(ベクトル距離)の類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
