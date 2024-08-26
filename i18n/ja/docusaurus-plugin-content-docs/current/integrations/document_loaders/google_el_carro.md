---
translated: true
---

# Google El Carroによるオラクルワークロードの実行

> Google [El Carro Oracle Operator](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)
は、ポータブル、オープンソース、コミュニティ主導、ベンダーロックインのない
コンテナオーケストレーションシステムであるKubernetesでオラクルデータベースを
実行する方法を提供します。El Carroは、包括的で一貫した設定とデプロイ、
リアルタイムの運用とモニタリングのための強力な宣言型APIを提供します。
El Carro Langchainインテグレーションを活用して、オラクルデータベースの
機能を拡張し、AI駆動のエクスペリエンスを構築することができます。

このガイドでは、`ElCarroLoader`と`ElCarroDocumentSaver`を使用して
Langchainドキュメントを[保存、読み込み、削除する](/docs/modules/data_connection/document_loaders/)
方法について説明します。このインテグレーションは、オラクルデータベースが
どこで実行されているかに関係なく機能します。

パッケージの詳細については[GitHub](https://github.com/googleapis/langchain-google-el-carro-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## 始める前に

[Getting Started](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started)
セクションの手順に従って、El Carro Oracleデータベースのセットアップを完了してください。

### 🦜🔗 ライブラリのインストール

このインテグレーションは`langchain-google-el-carro`パッケージに含まれているため、
インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## 基本的な使い方

### Oracleデータベース接続の設定

以下の変数にオラクルデータベース接続の詳細を入力してください。

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

El Carroを使用している場合は、El Carro Kubernetesインスタンスのステータスに
ホスト名とポートの値が表示されます。
PDBに作成したユーザーパスワードを使用してください。

出力例:

```output
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### ElCarroEngineコネクションプール

`ElCarroEngine`は、アプリケーションからの成功した接続を可能にし、
業界のベストプラクティスに従ってオラクルデータベースへの
コネクションプールを構成します。

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### テーブルの初期化

`elcarro_engine.init_document_table(<table_name>)`を使用して、
デフォルトのスキーマでテーブルを初期化します。テーブルの列:

- page_content (type: text)
- langchain_metadata (type: JSON)

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### ドキュメントの保存

`ElCarroDocumentSaver.add_documents(<documents>)`を使用して
Langchainドキュメントを保存します。
`ElCarroDocumentSaver`クラスを初期化するには、以下の2つが必要です:

1. `elcarro_engine` - `ElCarroEngine`エンジンのインスタンス。
2. `table_name` - Langchainドキュメントを保存するオラクルデータベース内のテーブル名。

```python
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### ドキュメントの読み込み

`ElCarroLoader.load()`または`ElCarroLoader.lazy_load()`を使用して
Langchainドキュメントを読み込みます。
`lazy_load`は、イテレーション中にのみデータベースにクエリを実行する
ジェネレーターを返します。
`ElCarroLoader`クラスを初期化するには、以下が必要です:

1. `elcarro_engine` - `ElCarroEngine`エンジンのインスタンス。
2. `table_name` - Langchainドキュメントを保存するオラクルデータベース内のテーブル名。

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### クエリを使ってドキュメントを読み込む

テーブルからドキュメントを読み込むだけでなく、SQLクエリから生成された
ビューからドキュメントを読み込むこともできます。例:

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

SQLクエリから生成されたビューのスキーマがデフォルトのテーブルと異なる場合、
ElCarroLoaderの動作は、非デフォルトのスキーマを持つテーブルからの
読み込みと同様です。[ドキュメントのページコンテンツとメタデータのカスタマイズ](#load-documents-with-customized-document-page-content--metadata)
セクションを参照してください。

### ドキュメントの削除

`ElCarroDocumentSaver.delete(<documents>)`を使用して、
オラクルテーブルからLangchainドキュメントのリストを削除します。

デフォルトのスキーマ(page_content、langchain_metadata)を持つテーブルの場合、
削除の基準は以下のとおりです:

`row`は、リストにある`document`が以下の条件を満たす場合に削除されるべきです:

- `document.page_content`が`row[page_content]`と等しい
- `document.metadata`が`row[langchain_metadata]`と等しい

```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 高度な使用法

### カスタマイズされたドキュメントのページコンテンツとメタデータの読み込み

まず、非デフォルトのスキーマを持つ例テーブルを準備し、任意のデータで
それを埋めます。

```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

デフォルトのパラメーターで`ElCarroLoader`からこの例テーブルを
ロードすると、ロードされたドキュメントの`page_content`はテーブルの
最初の列になり、`metadata`はその他の列のキーと値のペアで構成されます。

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

`ElCarroLoader`の初期化時に`content_columns`と`metadata_columns`を
設定することで、ロードするコンテンツとメタデータを指定できます。

1. `content_columns`: ドキュメントの`page_content`に書き込むカラム。
2. `metadata_columns`: ドキュメントの`metadata`に書き込むカラム。

ここの例では、`content_columns`のカラムの値がスペース区切りの文字列として
`page_content`に結合され、`metadata_columns`で指定されたカラムのキーと値の
ペアのみが`metadata`に含まれます。

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### 文書をカスタマイズされたページコンテンツ&メタデータで保存する

LangChainの文書をテーブルに保存する際にカスタマイズされたメタデータフィールドを使うには、まず `ElCarroEngine.init_document_table()` を使ってそのようなテーブルを作成し、保持したいメタデータカラムのリストを `metadata_columns` で指定する必要があります。この例では、作成されるテーブルには以下のカラムがあります:

- content (type: text): 果物の説明を保存
- type (type VARCHAR2(200)): 果物の種類を保存
- weight (type INT): 果物の重さを保存
- extra_json_metadata (type: JSON): その他のメタデータ情報を保存

`elcarro_engine.init_document_table()` には以下のパラメーターを使用できます:

1. `table_name`: Oracle データベース内のLangChain文書を保存するテーブルの名前
2. `metadata_columns`: 必要なメタデータカラムを示す `sqlalchemy.Column` のリスト
3. `content_column`: LangChain文書の `page_content` を保存するカラム名。デフォルト: `"page_content", "VARCHAR2(4000)"`
4. `metadata_json_column`: 追加のJSON `metadata` を保存するカラム名。デフォルト: `"langchain_metadata", "VARCHAR2(4000)"`

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

`ElCarroDocumentSaver.add_documents(<documents>)` を使って文書を保存できます。この例では、

- `document.page_content` が `content` カラムに保存されます。
- `document.metadata.type` が `type` カラムに保存されます。
- `document.metadata.weight` が `weight` カラムに保存されます。
- `document.metadata.organic` が `extra_json_metadata` カラムにJSON形式で保存されます。

```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### カスタマイズされたページコンテンツ&メタデータを持つ文書を削除する

`ElCarroDocumentSaver.delete(<documents>)` を使って、カスタマイズされたメタデータカラムを持つテーブルから文書を削除することもできます。削除の基準は以下の通りです:

`row` は、リストの中の `document` が以下を満たす場合に削除されます:

- `document.page_content` が `row[page_content]` と等しい
- `document.metadata` の全てのフィールド `k` について
    - `document.metadata[k]` が `row[k]` と等しい、または `document.metadata[k]` が `row[langchain_metadata][k]` と等しい
- `row` にはないメタデータフィールドが `document.metadata` にはない

```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## その他の例

完全なコード例については、
[demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py)
と [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py)
を参照してください。
