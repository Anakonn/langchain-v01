---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner)は、2次インデックス、強力な一貫性、スキーマ、SQLなどの関係セマンティクスを備えた無制限のスケーラビリティを組み合わせた、99.999%の可用性を提供する高度にスケーラブルなデータベースです。

このノートブックでは、`SpannerVectorStore`クラスを使用して`Spanner`でベクトル検索を行う方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-spanner-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/vector_store.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud Spanner APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Spannerインスタンスの作成](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Spannerデータベースの作成](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 ライブラリのインストール

統合は独自の`langchain-google-spanner`パッケージにあるため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-spanner
```

```output
Note: you may need to restart the kernel to use updated packages.
```

**Colab限定:** 次のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

* Colabでこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順をご確認ください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)のサポートページを参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API の有効化

`langchain-google-spanner`パッケージでは、Google Cloudプロジェクトで[Spanner APIを有効化](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)する必要があります。

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## 基本的な使用方法

### Spannerデータベースの値を設定する

[Spanner Instancesページ](https://console.cloud.google.com/spanner?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vectors_search_data"  # @param {type: "string"}
```

### テーブルの初期化

`SpannerVectorStore`クラスのインスタンスには、id、content、embeddingsの列を持つデータベーステーブルが必要です。

`init_vector_store_table()`ヘルパーメソッドを使用して、適切なスキーマを持つテーブルを作成できます。

```python
from langchain_google_spanner import SecondaryIndex, SpannerVectorStore, TableColumn

SpannerVectorStore.init_vector_store_table(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    id_column="row_id",
    metadata_columns=[
        TableColumn(name="metadata", type="JSON", is_null=True),
        TableColumn(name="title", type="STRING(MAX)", is_null=False),
    ],
    secondary_indexes=[
        SecondaryIndex(index_name="row_id_and_title", columns=["row_id", "title"])
    ],
)
```

### 埋め込みクラスのインスタンスを作成する

[LangChain埋め込みモデル](/docs/integrations/text_embedding/)を使用できます。
`VertexAIEmbeddings`を使用するには、Vertex AI APIを有効にする必要があります。本番環境では、埋め込みモデルのバージョンを設定することをお勧めします。[テキスト埋め込みモデル](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings)の詳細をご覧ください。

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embeddings = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### SpannerVectorStore

`SpannerVectorStore`クラスを初期化するには、4つの必須引数と、デフォルト値と異なる場合にのみ渡す必要のある他の引数が必要です。

1. `instance_id` - Spannerインスタンスの名前
1. `database_id` - Spannerデータベースの名前
1. `table_name` - データベース内のテーブルの名前。
1. `embedding_service` - 埋め込みを生成するために使用される埋め込み実装。

```python
db = SpannerVectorStore(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    ignore_metadata_columns=[],
    embedding_service=embeddings,
    metadata_json_column="metadata",
)
```

#### 🔐 ドキュメントの追加

ベクトルストアにドキュメントを追加するには、以下のようにします。

```python
import uuid

from langchain_community.document_loaders import HNLoader

loader = HNLoader("https://news.ycombinator.com/item?id=34817881")

documents = loader.load()
ids = [str(uuid.uuid4()) for _ in range(len(documents))]
```

#### 🔐 ドキュメントの検索

ベクトルストアでの類似性検索によるドキュメントの検索。

```python
db.similarity_search(query="Explain me vector store?", k=3)
```

#### 🔐 ドキュメントの検索

ベクトルストアでの最大限の関連性検索によるドキュメントの検索。

```python
db.max_marginal_relevance_search("Testing the langchain integration with spanner", k=3)
```

#### 🔐 ドキュメントの削除

ベクトルストアからドキュメントを削除するには、`row_id`列の値に対応するIDを使用します。

```python
db.delete(ids=["id1", "id2"])
```

#### 🔐 ドキュメントの削除

ベクトルストアからドキュメントを削除するには、ドキュメント自体を利用できます。VectorStore初期化時に提供されたcontent列とメタデータ列を使用して、対応する行を特定し、削除します。

```python
db.delete(documents=[documents[0], documents[1]])
```
