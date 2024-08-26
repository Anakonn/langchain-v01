---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/)は、専用およびサーバーレスのオプションを提供する包括的なデータベースアズアサービス(DBaaS)ソリューションです。TiDB Serverlessは、MySQL環境に組み込みのベクトル検索を統合しています。この機能強化により、新しいデータベースやその他の技術スタックを必要とせずに、TiDB Serverlessを使ってAIアプリケーションを開発できます。プライベートベータに参加して、この機能を初めて体験してください。https://tidb.cloud/aiにアクセスしてウェイトリストに登録してください。

このノートブックでは、langchainでTiDBからデータを読み込むために `TiDBLoader` を使う方法を紹介します。

## 前提条件

`TiDBLoader` を使う前に、以下の依存関係をインストールする必要があります:

```python
%pip install --upgrade --quiet langchain
```

次に、TiDBへの接続を設定します。このノートブックでは、TiDB Cloudが提供する標準的な接続方法に従って、安全で効率的なデータベース接続を確立します。

```python
import getpass

# copy from tidb cloud console，replace it with your own
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## TiDBからデータを読み込む

`TiDBLoader` の動作をカスタマイズするための主要な引数は以下の通りです:

- `query` (str): TiDBデータベースに対して実行するSQLクエリです。このクエリは、`Document`オブジェクトにロードするデータを選択します。
    例えば、`"SELECT * FROM my_table"` のようなクエリを使って、`my_table`からすべてのデータを取得できます。

- `page_content_columns` (Optional[List[str]]): `Document`オブジェクトの`page_content`に含める列名のリストを指定します。
    デフォルトではNoneに設定されており、クエリによって返される全列が`page_content`に含まれます。これにより、データの特定の列に基づいて各ドキュメントの内容をカスタマイズできます。

- `metadata_columns` (Optional[List[str]]): `Document`オブジェクトの`metadata`に含める列名のリストを指定します。
    デフォルトでは空のリストに設定されており、明示的に指定しない限りメタデータは含まれません。これは、メインコンテンツの一部ではないが処理や分析に役立つ追加情報を各ドキュメントに含めるのに便利です。

```python
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine

# Connect to the database
engine = create_engine(tidb_connection_string)
metadata = MetaData()
table_name = "test_tidb_loader"

# Create a table
test_table = Table(
    table_name,
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255)),
    Column("description", String(255)),
)
metadata.create_all(engine)


with engine.connect() as connection:
    transaction = connection.begin()
    try:
        connection.execute(
            test_table.insert(),
            [
                {"name": "Item 1", "description": "Description of Item 1"},
                {"name": "Item 2", "description": "Description of Item 2"},
                {"name": "Item 3", "description": "Description of Item 3"},
            ],
        )
        transaction.commit()
    except:
        transaction.rollback()
        raise
```

```python
from langchain_community.document_loaders import TiDBLoader

# Setup TiDBLoader to retrieve data
loader = TiDBLoader(
    connection_string=tidb_connection_string,
    query=f"SELECT * FROM {table_name};",
    page_content_columns=["name", "description"],
    metadata_columns=["id"],
)

# Load data
documents = loader.load()

# Display the loaded documents
for doc in documents:
    print("-" * 30)
    print(f"content: {doc.page_content}\nmetada: {doc.metadata}")
```

```output
------------------------------
content: name: Item 1
description: Description of Item 1
metada: {'id': 1}
------------------------------
content: name: Item 2
description: Description of Item 2
metada: {'id': 2}
------------------------------
content: name: Item 3
description: Description of Item 3
metada: {'id': 3}
```

```python
test_table.drop(bind=engine)
```
