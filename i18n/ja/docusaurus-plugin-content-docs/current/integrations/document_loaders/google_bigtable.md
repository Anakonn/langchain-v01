---
translated: true
---

# Google Bigtable

> [Bigtable](https://cloud.google.com/bigtable) は、キー・バリュー型およびワイドカラムストアであり、構造化データ、半構造化データ、または非構造化データへの高速アクセスに最適です。Bigtable の Langchain 統合を活用して、データベースアプリケーションを拡張し、AI搭載のエクスペリエンスを構築しましょう。

このノートブックでは、`BigtableLoader` と `BigtableSaver` を使用して [Bigtable](https://cloud.google.com/bigtable) で [langchain ドキュメントを保存、読み込み、削除する](/docs/modules/data_connection/document_loaders/) 方法について説明します。

パッケージの詳細は [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/) で確認できます。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の手順を行う必要があります：

* [Google Cloud プロジェクトを作成する](https://developers.google.com/workspace/guides/create-project)
* [Bigtable API を有効にする](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Bigtable インスタンスを作成する](https://cloud.google.com/bigtable/docs/creating-instance)
* [Bigtable テーブルを作成する](https://cloud.google.com/bigtable/docs/managing-tables)
* [Bigtable アクセス認証情報を作成する](https://developers.google.com/workspace/guides/create-credentials)

このノートブックの実行環境でデータベースへのアクセスを確認した後、以下の値を入力し、例のスクリプトを実行する前にセルを実行します。

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

統合は独自の `langchain-google-bigtable` パッケージにあるため、これをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab のみ**：以下のセルのコメントを解除してカーネルを再起動するか、ボタンを使用してカーネルを再起動してください。Vertex AI Workbench では、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud プロジェクトの設定

このノートブック内で Google Cloud リソースを活用できるように、Google Cloud プロジェクトを設定します。

プロジェクト ID がわからない場合は、以下を試してください：

* `gcloud config list` を実行します。
* `gcloud projects list` を実行します。
* サポートページを参照します：[プロジェクト ID の特定](https://support.google.com/googleapi/answer/7014113)。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしている IAM ユーザーとして Google Cloud に認証し、Google Cloud プロジェクトにアクセスします。

- このノートブックを実行するために Colab を使用している場合は、以下のセルを使用して続行します。
- Vertex AI Workbench を使用している場合は、セットアップ手順を [こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) で確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用法

### セーバーの使用

`BigtableSaver.add_documents(<documents>)` を使用して langchain ドキュメントを保存します。`BigtableSaver` クラスを初期化するには、以下の2つが必要です：

1. `instance_id` - Bigtable のインスタンス。
1. `table_id` - langchain ドキュメントを保存する Bigtable 内のテーブルの名前。

```python
from langchain_core.documents import Document
from langchain_google_bigtable import BigtableSaver

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

saver = BigtableSaver(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

saver.add_documents(test_docs)
```

### Bigtable からのドキュメントのクエリ

Bigtable テーブルへの接続の詳細については、[Python SDK ドキュメント](https://cloud.google.com/python/docs/reference/bigtable/latest/client) をご確認ください。

#### テーブルからのドキュメントの読み込み

`BigtableLoader.load()` または `BigtableLoader.lazy_load()` を使用して langchain ドキュメントを読み込みます。`lazy_load` は、イテレーション中にのみデータベースにクエリを実行するジェネレーターを返します。`BigtableLoader` クラスを初期化するには、以下の2つが必要です：

1. `instance_id` - Bigtable のインスタンス。
1. `table_id` - langchain ドキュメントを保存する Bigtable 内のテーブルの名前。

```python
from langchain_google_bigtable import BigtableLoader

loader = BigtableLoader(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### ドキュメントの削除

`BigtableSaver.delete(<documents>)` を使用して Bigtable テーブルから langchain ドキュメントのリストを削除します。

```python
from langchain_google_bigtable import BigtableSaver

docs = loader.load()
print("Documents before delete: ", docs)

onedoc = test_docs[0]
saver.delete([onedoc])
print("Documents after delete: ", loader.load())
```

## 高度な使用法

### 返される行の制限

返される行を制限する方法は2つあります：

1. [filter](https://cloud.google.com/python/docs/reference/bigtable/latest/row-filters) の使用
2. [row_set](https://cloud.google.com/python/docs/reference/bigtable/latest/row-set#google.cloud.bigtable.row_set.RowSet) の使用

```python
import google.cloud.bigtable.row_filters as row_filters

filter_loader = BigtableLoader(
    INSTANCE_ID, TABLE_ID, filter=row_filters.ColumnQualifierRegexFilter(b"os_build")
)


from google.cloud.bigtable.row_set import RowSet

row_set = RowSet()
row_set.add_row_range_from_keys(
    start_key="phone#4c410523#20190501", end_key="phone#4c410523#201906201"
)

row_set_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    row_set=row_set,
)
```

### カスタムクライアント

デフォルトで作成されるクライアントはデフォルトのクライアントであり、admin=True オプションのみを使用しています。非デフォルトの [カスタムクライアント](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) をコンストラクターに渡すことができます。

```python
from google.cloud import bigtable

custom_client_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
)
```

### カスタムコンテンツ

BigtableLoader は、`langchain` というカラムファミリーがあり、その中に `content` というカラムがあり、UTF-8 でエンコードされた値が含まれていると仮定しています。これらのデフォルトは以下のように変更できます：

```python
from langchain_google_bigtable import Encoding

custom_content_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
)
```

### メタデータマッピング

デフォルトでは、`Document` オブジェクトの `metadata` マップには `rowkey` という単一のキーが含まれ、その値は行の rowkey 値になります。このマップにアイテムを追加するには、metadata_mapping を使用します。

```python
import json

from langchain_google_bigtable import MetadataMapping

metadata_mapping_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
)
```

### メタデータを JSON 形式で

Bigtable に JSON 文字列を含むカラムがあり、それを出力ドキュメントのメタデータに追加したい場合は、以下のパラメータを BigtableLoader に追加することが可能です。なお、`metadata_as_json_encoding` のデフォルト値は UTF-8 です。

```python
metadata_as_json_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```

### BigtableSaver のカスタマイズ

BigtableSaver も BigtableLoader と同様にカスタマイズ可能です。

```python
saver = BigtableSaver(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```
