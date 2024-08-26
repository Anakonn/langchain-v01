---
translated: true
---

# SQL Serverの Google Cloud SQL

> [Cloud SQL](https://cloud.google.com/sql)は、高パフォーマンス、シームレスな統合、および優れたスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。 [MySQL](https://cloud.google.com/sql/mysql)、[PostgreSQL](https://cloud.google.com/sql/postgres)、[SQL Server](https://cloud.google.com/sql/sqlserver)データベースエンジンを提供しています。 Cloud SQLのLangchainインテグレーションを活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、[SQL Serverの Cloud SQL](https://cloud.google.com/sql/sqlserver)を使用して、`MSSQLLoader`と`MSSQLDocumentSaver`を使用して[Langchainドキュメントを保存、ロード、削除する](/docs/modules/data_connection/document_loaders/)方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mssql-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mssql-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下を行う必要があります:

* [Google Cloudプロジェクトを作成する](https://developers.google.com/workspace/guides/create-project)
* [Cloud SQL Admin APIを有効にする。](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [SQL Serverの Cloud SQLインスタンスを作成する](https://cloud.google.com/sql/docs/sqlserver/create-instance)
* [Cloud SQLデータベースを作成する](https://cloud.google.com/sql/docs/sqlserver/create-manage-databases)
* [データベースにIAMデータベースユーザーを追加する](https://cloud.google.com/sql/docs/sqlserver/create-manage-users) (オプション)

このノートブックのランタイム環境でデータベースへのアクセスを確認した後、以下の値を入力し、サンプルスクリプトを実行する前にセルを実行してください。

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please fill in user name and password of your Cloud SQL instance.
DB_USER = "sqlserver"  # @param {type:"string"}
DB_PASS = "password"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

このインテグレーションは独自の`langchain-google-cloud-sql-mssql`パッケージにあるため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mssql
```

**Colab only**: 次のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。 Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

- Colabを使ってこのノートブックを実行する場合は、以下のセルを使用し、続行してください。
- Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ: [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API の有効化

`langchain-google-cloud-sql-mssql`パッケージを使用するには、Google Cloudプロジェクトで[Cloud SQL Admin APIを有効にする](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)必要があります。

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## 基本的な使用方法

### MSSQLEngineコネクションプール

MSSQLテーブルからドキュメントを保存またはロードする前に、Cloud SQLデータベースへの接続プールを最初に設定する必要があります。 `MSSQLEngine`は、[SQLAlchemyコネクションプール](https://docs.sqlalchemy.org/en/20/core/pooling.html#module-sqlalchemy.pool)を使用してCloud SQLデータベースに接続し、アプリケーションからの成功した接続と業界のベストプラクティスを可能にします。

`MSSQLEngine.from_instance()`を使って`MSSQLEngine`を作成するには、4つのものを提供する必要があります:

1. `project_id`: Cloud SQLインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region`: Cloud SQLインスタンスが存在するリージョン。
1. `instance`: Cloud SQLインスタンスの名前。
1. `database`: Cloud SQLインスタンス上の接続するデータベースの名前。
1. `user`: データベース認証とログインに使用するデータベースユーザー。
1. `password`: データベース認証とログインに使用するデータベースパスワード。

```python
from langchain_google_cloud_sql_mssql import MSSQLEngine

engine = MSSQLEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
    user=DB_USER,
    password=DB_PASS,
)
```

### テーブルの初期化

`MSSQLEngine.init_document_table(<table_name>)`を使って、デフォルトのスキーマを持つテーブルを初期化します。テーブルの列:

- page_content (type: text)
- langchain_metadata (type: JSON)

`overwrite_existing=True`フラグは、同じ名前の既存のテーブルを新しく初期化されたテーブルで置き換えることを意味します。

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### ドキュメントの保存

`MSSQLDocumentSaver.add_documents(<documents>)`を使ってLangchainドキュメントを保存します。 `MSSQLDocumentSaver`クラスを初期化するには、2つのものを提供する必要があります:

1. `engine` - `MSSQLEngine`エンジンのインスタンス。
2. `table_name` - Cloud SQLデータベース内のLangchainドキュメントを保存するテーブルの名前。

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mssql import MSSQLDocumentSaver

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
saver = MSSQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### ドキュメントのロード

`MSSQLLoader.load()`または`MSSQLLoader.lazy_load()`を使ってLangchainドキュメントをロードします。 `lazy_load`は、反復中にのみデータベースにクエリを実行するジェネレーターを返します。 `MSSQLDocumentSaver`クラスを初期化するには、以下を提供する必要があります:

1. `engine` - `MSSQLEngine`エンジンのインスタンス。
2. `table_name` - Cloud SQLデータベース内のLangchainドキュメントを保存するテーブルの名前。

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### ドキュメントの読み込み

テーブルからドキュメントを読み込むだけでなく、SQLクエリから生成されたビューからもドキュメントを読み込むことができます。例えば:

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(
    engine=engine,
    query=f"select * from \"{TABLE_NAME}\" where JSON_VALUE(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

生成されたビューのスキーマがデフォルトのテーブルと異なる場合、MSSQLLoaderの動作はデフォルトのスキーマ以外のテーブルからの読み込みと同じです。[ドキュメントのページコンテンツとメタデータのカスタマイズ](#ドキュメントのページコンテンツとメタデータのカスタマイズ)のセクションを参照してください。

### ドキュメントの削除

`MSSQLDocumentSaver.delete(<documents>)`を使って、MSSQLテーブルからLangChainドキュメントのリストを削除できます。

デフォルトのスキーマ(page_content、langchain_metadata)を持つテーブルの場合、削除の基準は以下のとおりです:

`row`は、リストにある`document`が以下の条件を満たす場合に削除されます:

- `document.page_content`が`row[page_content]`と等しい
- `document.metadata`が`row[langchain_metadata]`と等しい

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 高度な使用法

### ドキュメントのページコンテンツとメタデータのカスタマイズ

まず、デフォルトのスキーマ以外のスキーマを持つ例テーブルを準備し、任意のデータを入力します。

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f'DROP TABLE IF EXISTS "{TABLE_NAME}"'))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[{TABLE_NAME}]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[{TABLE_NAME}](
                        fruit_id INT IDENTITY(1,1) PRIMARY KEY,
                        fruit_name VARCHAR(100) NOT NULL,
                        variety VARCHAR(50),
                        quantity_in_stock INT NOT NULL,
                        price_per_unit DECIMAL(6,2) NOT NULL,
                        organic BIT NOT NULL
                    )
                END
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO "{TABLE_NAME}" (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

デフォルトのパラメータでMSSQLLoaderを使ってこのテーブルからLangChainドキュメントを読み込むと、読み込まれたドキュメントの`page_content`はテーブルの最初の列になり、`metadata`はその他の列のキーバリューペアで構成されます。

```python
loader = MSSQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

読み込むコンテンツとメタデータを指定するには、`MSSQLLoader`の初期化時に`content_columns`と`metadata_columns`を設定します。

1. `content_columns`: ドキュメントの`page_content`に書き込むカラム
2. `metadata_columns`: ドキュメントの`metadata`に書き込むカラム

ここの例では、`content_columns`のカラムの値がスペース区切りの文字列として`page_content`に書き込まれ、`metadata`には`metadata_columns`で指定したカラムのみが含まれます。

```python
loader = MSSQLLoader(
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

### カスタマイズしたページコンテンツとメタデータでドキュメントを保存

カスタマイズしたメタデータフィールドを持つテーブルにLangChainドキュメントを保存するには、まず`MSSQLEngine.init_document_table()`を使ってそのようなテーブルを作成し、`metadata_columns`として持たせたいカラムのリストを指定する必要があります。この例では、作成されるテーブルには以下のカラムがあります:

- description (type: text): 果物の説明を保存
- fruit_name (type text): 果物の名前を保存
- organic (type tinyint(1)): 果物が有機栽培かどうかを示す
- other_metadata (type: JSON): その他のメタデータ情報を保存

`MSSQLEngine.init_document_table()`には以下のパラメータを使用できます:

1. `table_name`: LangChainドキュメントを保存するCloudSQLデータベース内のテーブル名
2. `metadata_columns`: メタデータカラムとして使用する`sqlalchemy.Column`のリスト
3. `content_column`: `page_content`を保存するカラム名。デフォルト: `page_content`
4. `metadata_json_column`: 追加の`metadata`を保存するJSONカラム名。デフォルト: `langchain_metadata`

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

`MSSQLDocumentSaver.add_documents(<documents>)`を使ってドキュメントを保存します。この例では、

- `document.page_content`が`description`カラムに保存されます。
- `document.metadata.fruit_name`が`fruit_name`カラムに保存されます。
- `document.metadata.organic`が`organic`カラムに保存されます。
- `document.metadata.fruit_id`が`other_metadata`カラムにJSON形式で保存されます。

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MSSQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f'select * from "{TABLE_NAME}";'))
    print(result.keys())
    print(result.fetchall())
```

### カスタマイズしたページコンテンツとメタデータでドキュメントを削除

`MSSQLDocumentSaver.delete(<documents>)`を使って、カスタマイズしたメタデータカラムを持つテーブルからドキュメントを削除することもできます。削除の基準は以下のとおりです:

`row`は、リストにある`document`が以下の条件を満たす場合に削除されます:

- `document.page_content`が`row[page_content]`と等しい
- `document.metadata`の各メタデータフィールド`k`について
    - `document.metadata[k]`が`row[k]`と等しい、または`document.metadata[k]`が`row[langchain_metadata][k]`と等しい
- `row`に`document.metadata`にない追加のメタデータフィールドが存在しない

```python
loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
