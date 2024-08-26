---
translated: true
---

# Oracle AI Vector Search: ドキュメント処理

Oracle AI Vector Search は、キーワードではなくセマンティクスに基づいてデータを照会できるAI(人工知能)ワークロード向けに設計されています。Oracle AI Vector Searchの最大の利点の1つは、非構造化データのセマンティック検索と、1つのシステム内のビジネスデータの関係検索を組み合わせられることです。これは強力であり、複数のシステム間でデータの断片化の問題を解決できるため、大幅に効果的です。

このガイドでは、Oracle AI Vector Searchのドキュメント処理機能を使用して、OracleDocLoaderとOracleTextSplitterを使用してドキュメントをロードおよびチャンクする方法を示します。

### 前提条件

Oracle AI Vector Searchを使用するには、Oracle Pythonクライアントドライバーをインストールする必要があります。

```python
# pip install oracledb
```

### Oracle Databaseに接続する

次のサンプルコードは、Oracle Databaseに接続する方法を示しています。

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

次に、テーブルを作成し、テスト用のサンプルドキュメントを挿入しましょう。

```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### ドキュメントのロード

ユーザーは、Oracle Databaseまたはファイルシステム、あるいはその両方からドキュメントをロードできます。ローダーのパラメーターを適切に設定するだけです。これらのパラメーターの完全な情報については、Oracle AI Vector Search Guideブックを参照してください。

OracleDocLoaderを使用する主な利点は、150以上の異なるファイル形式を処理できることです。ファイル形式ごとに異なるローダーを使用する必要はありません。サポートされているドキュメント形式のリストは次のとおりです: [Oracle Text Supported Document Formats](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)

次のサンプルコードは、その方法を示しています:

```python
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### ドキュメントの分割

ドキュメントのサイズは小さい、中程度、大きい、または非常に大きいことがあります。ユーザーは、エンベディングを生成するために、ドキュメントをより小さな部分に分割/チャンクしたいと考えています。ユーザーは、これらのパラメーターについて多くのカスタマイズを行うことができます。これらのパラメーターの完全な情報については、Oracle AI Vector Search Guideブックを参照してください。

次のサンプルコードは、その方法を示しています:

```python
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### エンドツーエンドのデモ

完全なデモガイド[Oracle AI Vector Search End-to-End Demo Guide](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md)を参照して、Oracle AI Vector Searchを使用してRAGパイプラインを構築してください。
