---
translated: true
---

# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb)は、高パフォーマンス、シームレスな統合、そして印象的なスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。AlloyDBは100%PostgreSQLと互換性があります。AlloyDBのLangchainインテグレーションを活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`AlloyDB for PostgreSQL`を使用して`AlloyDBLoader`クラスでドキュメントをロードする方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [AlloyDBクラスターとインスタンスの作成](https://cloud.google.com/alloydb/docs/cluster-create)
 * [AlloyDBデータベースの作成](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [データベースにユーザーを追加](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 ライブラリのインストール

`langchain-google-alloydb-pg`インテグレーションライブラリをインストールします。

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg
```

**Colab only:** 次のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

* Colabでこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順をご確認ください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

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

## 基本的な使用方法

### AlloyDBデータベース変数の設定

[AlloyDBインスタンスページ](https://console.cloud.google.com/alloydb/clusters)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### AlloyDBEngineコネクションプール

AlloyDBをベクトルストアとして確立するための要件の1つは、`AlloyDBEngine`オブジェクトです。`AlloyDBEngine`は、業界のベストプラクティスに従って、アプリケーションから正常な接続を可能にするためのAlloyDBデータベースへの接続プールを構成します。

`AlloyDBEngine.from_instance()`を使って`AlloyDBEngine`を作成するには、5つのものを提供する必要があります:

1. `project_id`: AlloyDBインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region`: AlloyDBインスタンスが存在するリージョン。
1. `cluster`: AlloyDBクラスターの名前。
1. `instance`: AlloyDBインスタンスの名前。
1. `database`: AlloyDBインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/alloydb/docs/connect-iam)がデータベース認証の方法として使用されます。このライブラリは、環境から取得した[アプリケーションデフォルトの資格情報(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/alloydb/docs/database-users/about)を使うこともできます。`AlloyDBEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user`: 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password`: 組み込みデータベース認証とログインに使用するデータベースパスワード

**注意**: このチュートリアルでは非同期インターフェイスを示しています。すべての非同期メソッドには対応する同期メソッドがあります。

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### AlloyDBLoaderの作成

```python
from langchain_google_alloydb_pg import AlloyDBLoader

# Creating a basic AlloyDBLoader object
loader = await AlloyDBLoader.create(engine, table_name=TABLE_NAME)
```

### デフォルトのテーブルからドキュメントをロード

ローダーは、最初の列をpage_contentとし、その他の列をメタデータとして使用してテーブルからドキュメントのリストを返します。デフォルトのテーブルには、最初の列がpage_content、2番目の列がメタデータ(JSON)になります。各行がドキュメントになります。

```python
docs = await loader.aload()
print(docs)
```

### カスタムテーブル/メタデータまたはカスタムページコンテンツ列からドキュメントをロード

```python
loader = await AlloyDBLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### ページコンテンツ形式の設定

ローダーは、ページコンテンツが指定の文字列形式(つまりテキスト(スペース区切りの連結)、JSON、YAML、CSV等)で記述された1つのドキュメントごとの行のリストを返します。JSONとYAMLの形式にはヘッダーが含まれますが、テキストとCSVにはフィールドヘッダーは含まれません。

```python
loader = AlloyDBLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
