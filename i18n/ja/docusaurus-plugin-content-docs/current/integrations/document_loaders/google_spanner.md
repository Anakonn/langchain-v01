---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner)は、無制限のスケーラビリティと、セカンダリインデックス、強い一貫性、スキーマ、SQLなどのリレーショナルセマンティクスを組み合わせた、99.999%の可用性を提供する、簡単に使えるデータベースソリューションです。

このノートブックでは、`SpannerLoader`と`SpannerDocumentSaver`を使って、[Spanner](https://cloud.google.com/spanner)でLangChainドキュメントを[保存、読み込み、削除する](/docs/modules/data_connection/document_loaders/)方法を説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-spanner-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloudプロジェクトを作成する](https://developers.google.com/workspace/guides/create-project)
* [Cloud Spanner APIを有効化する](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
* [Spannerインスタンスを作成する](https://cloud.google.com/spanner/docs/create-manage-instances)
* [Spannerデータベースを作成する](https://cloud.google.com/spanner/docs/create-manage-databases)
* [Spannerテーブルを作成する](https://cloud.google.com/spanner/docs/create-query-database-console#create-schema)

このノートブックの実行環境でデータベースへのアクセスを確認した後、以下の値を入力して、サンプルスクリプトを実行する前にセルを実行してください。

```python
# @markdown Please specify an instance id, a database, and a table for demo purpose.
INSTANCE_ID = "test_instance"  # @param {type:"string"}
DATABASE_ID = "test_database"  # @param {type:"string"}
TABLE_NAME = "test_table"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

統合は独自の`langchain-google-spanner`パッケージにあるため、それをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-spanner langchain
```

**Colab限定**: 以下のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるよう、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ[プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

- Colabでこのノートブックを実行する場合は、以下のセルを使ってください。
- Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使い方

### ドキュメントの保存

`SpannerDocumentSaver.add_documents(<documents>)`を使ってLangChainドキュメントを保存します。`SpannerDocumentSaver`クラスを初期化するには、以下の3つを指定する必要があります:

1. `instance_id` - データを読み込むSpannerのインスタンス。
1. `database_id` - データを読み込むSpannerデータベースのインスタンス。
1. `table_name` - LangChainドキュメントを保存するSpannerデータベース内のテーブル名。

```python
from langchain_core.documents import Document
from langchain_google_spanner import SpannerDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]

saver = SpannerDocumentSaver(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    table_name=TABLE_NAME,
)
saver.add_documents(test_docs)
```

### Spannerからドキュメントを照会する

Spannerテーブルに接続する詳細については、[Python SDKのドキュメント](https://cloud.google.com/python/docs/reference/spanner/latest)をご確認ください。

#### テーブルからドキュメントを読み込む

`SpannerLoader.load()`または`SpannerLoader.lazy_load()`を使ってLangChainドキュメントを読み込みます。`lazy_load`は、反復中にのみデータベースを照会するジェネレーターを返します。`SpannerLoader`クラスを初期化するには、以下の3つを指定する必要があります:

1. `instance_id` - データを読み込むSpannerのインスタンス。
1. `database_id` - データを読み込むSpannerデータベースのインスタンス。
1. `query` - データベース方言のクエリ。

```python
from langchain_google_spanner import SpannerLoader

query = f"SELECT * from {TABLE_NAME}"
loader = SpannerLoader(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    query=query,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### ドキュメントの削除

`SpannerDocumentSaver.delete(<documents>)`を使って、テーブルからLangChainドキュメントのリストを削除します。

```python
docs = loader.load()
print("Documents before delete:", docs)

doc = test_docs[0]
saver.delete([doc])
print("Documents after delete:", loader.load())
```

## 高度な使い方

### カスタムクライアント

デフォルトで作成されるクライアントはデフォルトのクライアントです。`credentials`と`project`を明示的に渡すには、コンストラクターにカスタムクライアントを渡すことができます。

```python
from google.cloud import spanner
from google.oauth2 import service_account

creds = service_account.Credentials.from_service_account_file("/path/to/key.json")
custom_client = spanner.Client(project="my-project", credentials=creds)
loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    client=custom_client,
)
```

### ページコンテンツとメタデータのカスタマイズ

ローダーは、特定のデータ列からページコンテンツを持つドキュメントのリストを返します。その他のデータ列はすべてメタデータに追加されます。各行がドキュメントになります。

#### ページコンテンツ形式のカスタマイズ

SpannerLoaderは、`page_content`という列があることを前提としています。これらのデフォルトは以下のように変更できます:

```python
custom_content_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, content_columns=["custom_content"]
)
```

複数の列が指定されている場合、ページコンテンツの文字列形式はデフォルトで`text`(スペース区切りの文字列連結)になります。ユーザーは`text`、`JSON`、`YAML`、`CSV`などの他の形式を指定できます。

#### メタデータ形式のカスタマイズ

SpannerLoaderは、JSONデータを格納する`langchain_metadata`というメタデータ列があることを前提としています。メタデータ列は基本辞書として使用されます。デフォルトでは、その他のすべての列データが追加され、元の値を上書きする可能性があります。これらのデフォルトは以下のように変更できます:

```python
custom_metadata_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_columns=["column1", "column2"]
)
```

#### JSONメタデータ列名のカスタマイズ

デフォルトでは、ローダーは`langchain_metadata`を基本辞書として使用します。これをカスタマイズして、ドキュメントのメタデータの基本辞書として使用するJSONカラムを選択できます。

```python
custom_metadata_json_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_json_column="another-json-column"
)
```

### カスタムの新鮮さ

デフォルトの[新鮮さ](https://cloud.google.com/python/docs/reference/spanner/latest/snapshot-usage#beginning-a-snapshot)は15秒です。これは、より弱い境界(特定のタイムスタンプ時点のすべての読み取りを実行するか、過去一定期間の時点のデータを取得するように指定)を指定することで、カスタマイズできます。

```python
import datetime

timestamp = datetime.datetime.utcnow()
custom_timestamp_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=timestamp,
)
```

```python
duration = 20.0
custom_duration_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=duration,
)
```

### データブーストをオンにする

デフォルトでは、ローダーは追加のコストと IAM 権限が必要なため、[データブースト](https://cloud.google.com/spanner/docs/databoost/databoost-overview)を使用しません。ただし、ユーザーはこれをオンにすることができます。

```python
custom_databoost_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    databoost=True,
)
```

### カスタムクライアント

デフォルトで作成されるクライアントはデフォルトのクライアントです。`credentials`と`project`を明示的に渡すには、コンストラクタにカスタムクライアントを渡すことができます。

```python
from google.cloud import spanner

custom_client = spanner.Client(project="my-project", credentials=creds)
saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    client=custom_client,
)
```

### SpannerDocumentSaverのカスタム初期化

SpannerDocumentSaverではカスタム初期化が可能です。これにより、ユーザーはドキュメントをテーブルに保存する方法を指定できます。

content_column: ドキュメントのページコンテンツの列名として使用されます。デフォルトは `page_content` です。

metadata_columns: ドキュメントのメタデータに存在するキーは、特定の列に保存されます。

metadata_json_column: 特殊な JSON 列の列名です。デフォルトは `langchain_metadata` です。

```python
custom_saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    content_column="my-content",
    metadata_columns=["foo"],
    metadata_json_column="my-special-json-column",
)
```

### Spannerのカスタムスキーマの初期化

SpannerDocumentSaverには、ドキュメントを保存する新しいテーブルを作成するための `init_document_table` メソッドがあります。

```python
from langchain_google_spanner import Column

new_table_name = "my_new_table"

SpannerDocumentSaver.init_document_table(
    INSTANCE_ID,
    DATABASE_ID,
    new_table_name,
    content_column="my-page-content",
    metadata_columns=[
        Column("category", "STRING(36)", True),
        Column("price", "FLOAT64", False),
    ],
)
```
