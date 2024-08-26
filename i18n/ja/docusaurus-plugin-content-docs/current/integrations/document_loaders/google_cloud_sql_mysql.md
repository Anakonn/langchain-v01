---
translated: true
---

# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql) は、高性能でシームレスな統合と印象的なスケーラビリティを提供するフルマネージドのリレーショナルデータベースサービスです。[MySQL](https://cloud.google.com/sql/mysql)、[PostgreSQL](https://cloud.google.com/sql/postgresql)、および [SQL Server](https://cloud.google.com/sql/sqlserver) データベースエンジンを提供します。Cloud SQL の Langchain 統合を活用して、AI を搭載したエクスペリエンスを構築するためにデータベースアプリケーションを拡張します。

このノートブックでは、`MySQLLoader` および `MySQLDocumentSaver` を使用して [Cloud SQL for MySQL](https://cloud.google.com/sql/mysql) で [langchain ドキュメントの保存、読み込み、および削除](/docs/modules/data_connection/document_loaders/) を行う方法について説明します。

パッケージの詳細については [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/) で確認できます。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、次の手順を行う必要があります：

* [Google Cloud プロジェクトを作成](https://developers.google.com/workspace/guides/create-project)
* [Cloud SQL Admin API を有効にする](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Cloud SQL for MySQL インスタンスを作成](https://cloud.google.com/sql/docs/mysql/create-instance)
* [Cloud SQL データベースを作成](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [IAM データベースユーザーをデータベースに追加](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (オプション)

このノートブックの実行環境でデータベースへのアクセスを確認した後、次の値を入力してセルを実行し、サンプルスクリプトを実行する前に実行します。

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

統合は独自の `langchain-google-cloud-sql-mysql` パッケージに含まれているため、それをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-cloud-sql-mysql
```

**Colab のみ**：以下のセルのコメントを解除してカーネルを再起動するか、ボタンを使用してカーネルを再起動します。Vertex AI Workbench を使用している場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud プロジェクトの設定

このノートブック内で Google Cloud リソースを活用できるように、Google Cloud プロジェクトを設定します。

プロジェクト ID がわからない場合は、次の手順を試してください：

* `gcloud config list` を実行します。
* `gcloud projects list` を実行します。
* サポートページを参照してください：[プロジェクト ID の確認](https://support.google.com/googleapi/answer/7014113)。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしている IAM ユーザーとして Google Cloud に認証し、Google Cloud プロジェクトにアクセスします。

- このノートブックを実行するために Colab を使用している場合は、以下のセルを使用して続行します。
- Vertex AI Workbench を使用している場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### MySQLEngine 接続プール

MySQL テーブルからドキュメントを保存または読み込む前に、まず Cloud SQL データベースへの接続プールを構成する必要があります。`MySQLEngine` は、アプリケーションからの成功した接続を可能にし、業界のベストプラクティスに従って Cloud SQL データベースへの接続プールを構成します。

`MySQLEngine.from_instance()` を使用して `MySQLEngine` を作成するには、次の 4 つの項目を提供する必要があります：

1. `project_id` : Cloud SQL インスタンスが存在する Google Cloud プロジェクトのプロジェクト ID。
2. `region` : Cloud SQL インスタンスが存在するリージョン。
3. `instance` : Cloud SQL インスタンスの名前。
4. `database` : Cloud SQL インスタンスで接続するデータベースの名前。

デフォルトでは、データベース認証の方法として [IAM データベース認証](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) が使用されます。このライブラリは、環境から取得された [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) に属する IAM プリンシパルを使用します。

IAM データベース認証の詳細については、次を参照してください：

* [IAM データベース認証のためのインスタンスの構成](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM データベース認証を使用したユーザーの管理](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

オプションで、Cloud SQL データベースにアクセスするためにユーザー名とパスワードを使用する [組み込みデータベース認証](https://cloud.google.com/sql/docs/mysql/built-in-authentication) も使用できます。`MySQLEngine.from_instance()` にオプションの `user` および `password` 引数を提供するだけです：

* `user` : 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password` : 組み込みデータベース認証とログインに使用するデータベースパスワード

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### テーブルの初期化

`MySQLEngine.init_document_table(<table_name>)` を使用してデフォルトスキーマのテーブルを初期化します。テーブルの列：

- page_content (タイプ: text)
- langchain_metadata (タイプ: JSON)

`overwrite_existing=True` フラグは、新しく初期化されたテーブルが同じ名前の既存のテーブルを置き換えることを意味します。

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### ドキュメントの保存

`MySQLDocumentSaver.add_documents(<documents>)` を使用して langchain ドキュメントを保存します。`MySQLDocumentSaver` クラスを初期化するには、次の 2 つの項目を提供する必要があります：

1. `engine` - `MySQLEngine` エンジンのインスタンス。
2. `table_name` - langchain ドキュメントを保存する Cloud SQL データベース内のテーブルの名前。

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mysql import MySQLDocumentSaver

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
saver = MySQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### ドキュメントの読み込み

`MySQLLoader.load()` または `MySQLLoader.lazy_load()` を使用して langchain ドキュメントを読み込みます。`lazy_load` は、反復中にのみデータベースをクエリするジェネレータを返します。`MySQLLoader` クラスを初期化するには、次の項目を提供する必要があります：

1. `engine` - `MySQLEngine` エンジンのインスタンス。
2. `table_name` - langchain ドキュメントを保存する Cloud SQL データベース内のテーブルの名前。

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### クエリによるドキュメントの読み込み

テーブルからドキュメントを読み込む以外に、SQL クエリから生成されたビューからドキュメントを読み込むこともできます。例えば：

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(
    engine=engine,
    query=f"select * from `{TABLE_NAME}` where JSON_EXTRACT(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

SQL クエリから生成されたビューは、デフォルトのテーブルとは異なるスキーマを持つ場合があります。そのような場合、MySQLLoader の動作は、非デフォルトスキーマのテーブルから読み込む場合と同じです。セクション [カスタマイズされたドキュメントページコンテンツとメタデータでドキュメントを読み込む](#Load-documents-with-customized-document-page-content-&-metadata) を参照してください。

### ドキュメントの削除

`MySQLDocumentSaver.delete(<documents>)` を使用して MySQL テーブルから langchain ドキュメントのリストを削除します。

デフォルトスキーマ（page_content, langchain_metadata）を持つテーブルの場合、削除基準は次のとおりです：

リスト内に存在する `document` がある場合、その `document.page_content` が `row[page_content]` と等しく `document.metadata` が `row[langchain_metadata]` と等しい場合、その `row` を削除する必要があります。

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 高度な使用方法

### カスタマイズされたドキュメントページコンテンツとメタデータでドキュメントを読み込む

まず、非デフォルトスキーマの例テーブルを準備し、いくつかの任意のデータでそれを埋めます。

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS `{TABLE_NAME}`"))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            CREATE TABLE IF NOT EXISTS `{TABLE_NAME}`(
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(100) NOT NULL,
                variety VARCHAR(50),
                quantity_in_stock INT NOT NULL,
                price_per_unit DECIMAL(6,2) NOT NULL,
                organic TINYINT(1) NOT NULL
            )
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO `{TABLE_NAME}` (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

この例のテーブルからデフォルトパラメータを使用して langchain ドキュメントを読み込む場合、読み込まれたドキュメントの `page_content` はテーブルの最初の列になり、`metadata` は他のすべての列のキーと値のペアで構成されます。

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

`MySQLLoader` を初期化するときに `content_columns` と `metadata_columns` を設定することで、読み込みたいコンテンツとメタデータを指定できます。

1. `content_columns`: ドキュメントの `page_content` に書き込む列。
2. `metadata_columns`: ドキュメントの `metadata` に書き込む列。

例えばここでは、`content_columns` の列の値がスペースで区切られた文字列として結合され、読み込まれたドキュメントの `page_content` となり、読み込まれたドキュメントの `metadata` には `metadata_columns` に指定された列のキーと値のペアのみが含まれます。

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### カスタマイズされたページコンテンツとメタデータでドキュメントを保存

カスタマイズされたメタデータフィールドを持つテーブルに langchain ドキュメントを保存するために、まず `MySQLEngine.init_document_table()` を使用してそのようなテーブルを作成し、必要な `metadata_columns` のリストを指定する必要があります。この例では、作成されたテーブルの列は次のようになります：

- description (タイプ: text): フルーツの説明を保存する。
- fruit_name (タイプ: text): フルーツの名前を保存する。
- organic (タイプ: tinyint(1)): フルーツがオーガニックかどうかを示す。
- other_metadata (タイプ: JSON): フルーツのその他のメタデータ情報を保存する。

次のパラメータを `MySQLEngine.init_document_table()` に使用してテーブルを作成できます：

1. `table_name`: langchain ドキュメントを保存する Cloud SQL データベース内のテーブルの名前。
2. `metadata_columns`: 必要なメタデータ列のリストを示す `sqlalchemy.Column` のリスト。
3. `content_column`: langchain ドキュメントの `page_content` を保存する列の名前。デフォルト: `page_content`。
4. `metadata_json_column`: langchain ドキュメントの追加 `metadata` を保存する JSON 列の名前。デフォルト: `langchain_metadata`。

```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

`MySQLDocumentSaver.add_documents(<documents>)` を使用してドキュメントを保存します。この例では、

- `document.page_content` は `description` 列に保存されます。
- `document.metadata.fruit_name` は `fruit_name` 列に保存されます。
- `document.metadata.organic` は `organic` 列に保存されます。
- `document.metadata.fruit_id` は JSON 形式で `other_metadata` 列に保存されます。

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MySQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f"select * from `{TABLE_NAME}`;"))
    print(result.keys())
    print(result.fetchall())
```

### カスタマイズされたページコンテンツとメタデータでドキュメントを削除する

カスタマイズされたメタデータ列を持つテーブルからも、`MySQLDocumentSaver.delete(<documents>)`を使用してドキュメントを削除できます。削除基準は以下の通りです：

リストに存在する`document`に対して、以下の条件を満たす`row`が削除されます。

- `document.page_content`が`row[page_content]`と等しい
- `document.metadata`のすべてのメタデータフィールド`k`に対して
    - `document.metadata[k]`が`row[k]`と等しい、または`document.metadata[k]`が`row[langchain_metadata][k]`と等しい
- `row`に存在し、`document.metadata`に存在しない余分なメタデータフィールドがない

```python
loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
