---
translated: true
---

# Google Cloud SQLのPostgreSQL

> [Cloud SQLのPostgreSQL](https://cloud.google.com/sql/docs/postgres)は、Google Cloud PlatformでPostgreSQLリレーショナルデータベースのセットアップ、メンテナンス、管理、管理を支援する完全管理型のデータベースサービスです。Cloud SQLのPostgreSQLのLangchainインテグレーションを活用して、AIパワードの体験を構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`Cloud SQLのPostgreSQL`を使ってDocumentsを`PostgresLoader`クラスでロードする方法を説明します。

パッケージの詳細は[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQLAdmin APIの有効化](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Cloud SQLのPostgreSQLインスタンスの作成](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [Cloud SQLのPostgreSQLデータベースの作成](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [データベースにユーザーを追加](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 ライブラリのインストール

`langchain_google_cloud_sql_pg`インテグレーションライブラリをインストールします。

```python
%pip install --upgrade --quiet  langchain_google_cloud_sql_pg
```

**Colab限定:** 次のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

* Colabでこのノートブックを実行する場合は、以下のセルを使ってください。
* Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順をご確認ください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるよう、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する
* `gcloud projects list`を実行する
* [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)のサポートページを参照する

```python
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## 基本的な使い方

### Cloud SQLデータベースの値を設定する

[Cloud SQLインスタンスページ](https://console.cloud.google.com/sql/instances)からデータベースの変数を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Cloud SQLエンジン

PostgreSQLをドキュメントローダーとして確立するための要件の1つは、`PostgresEngine`オブジェクトです。`PostgresEngine`は、業界のベストプラクティスに従って、アプリケーションから正常な接続を可能にするCloud SQLのPostgreSQLデータベースへの接続プールを構成します。

`PostgresEngine.from_instance()`を使って`PostgresEngine`を作成するには、以下の4つの情報を提供する必要があります:

1. `project_id`: Cloud SQLインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID
1. `region`: Cloud SQLインスタンスが存在するリージョン
1. `instance`: Cloud SQLインスタンスの名前
1. `database`: Cloud SQLインスタンス上の接続するデータベースの名前

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/sql/docs/postgres/iam-authentication)がデータベース認証の方法として使用されます。このライブラリは、環境から取得した[Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/sql/docs/postgres/users)を使うこともできます。その場合は、`PostgresEngine.from_instance()`に`user`と`password`の引数を提供してください:

* `user`: 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password`: 組み込みデータベース認証とログインに使用するデータベースパスワード

**注意**: このチュートリアルでは非同期インターフェイスを示しています。すべての非同期メソッドには対応する同期メソッドがあります。

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
)
```

### PostgresLoaderの作成

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgreSQL object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)
```

### デフォルトのテーブルからドキュメントをロードする

ローダーは、最初の列をpage_contentとし、その他の列をメタデータとして使用してテーブルからドキュメントのリストを返します。デフォルトのテーブルでは、最初の列がpage_content、2番目の列がメタデータ(JSON)になります。各行がドキュメントになります。ドキュメントにIDを持たせたい場合は、IDを追加する必要があることに注意してください。

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgresLoader object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)

docs = await loader.aload()
print(docs)
```

### カスタムテーブル/メタデータまたはカスタムページコンテンツ列からドキュメントをロードする

```python
loader = await PostgresLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### ページコンテンツ形式の設定

ローダーは、ページコンテンツが指定の文字列形式(テキスト(スペース区切りの連結)、JSON、YAML、CSV等)で表現されたドキュメントのリストを返します。JSONとYAMLの形式にはヘッダーが含まれますが、テキストとCSVにはヘッダーは含まれません。

```python
loader = await PostgresLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
