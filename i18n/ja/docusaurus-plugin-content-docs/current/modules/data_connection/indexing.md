---
translated: true
---

# インデックス作成

ここでは、LangChainのインデックス作成APIを使用した基本的なインデックス作成ワークフローについて見ていきます。

インデックス作成APIを使うと、任意のソースからドキュメントをロードし、ベクトルストアと同期させることができます。具体的には以下のようなことができます:

* ベクトルストアへの重複コンテンツの書き込みを避ける
* 変更のないコンテンツの再書き込みを避ける
* 変更のないコンテンツの埋め込み再計算を避ける

これらにより、時間とコストを節約でき、ベクトル検索の結果も改善されます。

重要なのは、インデックス作成APIは、元のソースドキュメントに対して複数の変換ステップ(テキストチャンキングなど)を経たドキュメントでも機能するということです。

## 仕組み

LangChainのインデックス作成では、レコードマネージャー(`RecordManager`)を使ってドキュメントのベクトルストアへの書き込みを管理しています。

コンテンツをインデックス化する際、各ドキュメントのハッシュを計算し、レコードマネージャーに以下の情報を保存します:

- ドキュメントハッシュ(コンテンツとメタデータの両方のハッシュ)
- 書き込み時間
- ソースID - 各ドキュメントにはメタデータに、このドキュメントの最終ソースを特定できる情報が含まれている必要があります

## 削除モード

ベクトルストアにドキュメントをインデックス化する際、既存のドキュメントの一部を削除する必要がある場合があります。新しくインデックス化するドキュメントと同じソースから派生したドキュメントを削除したい場合や、既存のドキュメントを一括で削除したい場合などです。インデックス作成APIの削除モードを使うと、目的の動作を選択できます:

| クリーンアップモード | 重複コンテンツを除去 | 並列化可能 | 削除されたソースドキュメントをクリーンアップ | ソースドキュメントの変更や派生ドキュメントのクリーンアップ | クリーンアップタイミング |
|-------------------|-------------------|------------|----------------------------------------|---------------------------------------------------|-------------------------|
| None              | ✅                | ✅         | ❌                                    | ❌                                               | -                       |
| Incremental       | ✅                | ✅         | ❌                                    | ✅                                               | 継続的                  |
| Full              | ✅                | ❌         | ✅                                    | ✅                                               | インデックス作成終了時  |

`None`モードでは自動クリーンアップは行わず、ユーザーが手動でクリーンアップを行う必要があります。

`incremental`と`full`では以下のような自動クリーンアップが行われます:

* ソースドキュメントやその派生ドキュメントの**コンテンツが変更**された場合、`incremental`と`full`の両方でそれ以前のバージョンが削除されます。
* ソースドキュメントが**削除**された(現在インデックス化されているドキュメントに含まれていない)場合、`full`クリーンアップモードではベクトルストアから正しく削除されますが、`incremental`モードでは削除されません。

コンテンツが変更された(ソースのPDFファイルが改訂された)場合、新しいコンテンツが書き込まれた後、古いバージョンが削除されるまでの間、両方のバージョンが返される可能性があります。

* `incremental`インデックス作成では、書き込み時に継続的にクリーンアップを行うため、この期間を最小限に抑えられます。
* `full`モードではすべてのバッチの書き込み後にクリーンアップを行います。

## 要件

1. インデックス作成APIを使う前にコンテンツが事前に格納されたストアでは使用しないでください。レコードマネージャーでは以前に挿入されたレコードを認識できません。
2. 以下の機能をサポートするLangChain `vectorstore`でのみ動作します:
   * IDによるドキュメントの追加(`add_documents`メソッドの`ids`引数)
   * IDによるドキュメントの削除(`delete`メソッドの`ids`引数)

対応するベクトルストア: `AnalyticDB`, `AstraDB`, `AzureCosmosDBVectorSearch`, `AzureSearch`, `AwaDB`, `Bagel`, `Cassandra`, `Chroma`, `CouchbaseVectorStore`, `DashVector`, `DatabricksVectorSearch`, `DeepLake`, `Dingo`, `ElasticVectorSearch`, `ElasticsearchStore`, `FAISS`, `HanaDB`, `LanceDB`, `Milvus`, `MyScale`, `OpenSearchVectorSearch`, `PGVector`, `Pinecone`, `Qdrant`, `Redis`, `Rockset`, `ScaNN`, `SupabaseVectorStore`, `SurrealDBStore`, `TimescaleVector`, `UpstashVectorStore`, `Vald`, `VDMS`, `Vearch`, `VespaStore`, `Weaviate`, `ZepVectorStore`, `TencentVectorDB`, `OpenSearchVectorSearch`, `Yellowbrick`.

## 注意

レコードマネージャーは時間ベースのメカニズムを使ってクリーンアップ対象のコンテンツを判断します(`full`または`incremental`クリーンアップモードを使う場合)。

2つのタスクが連続して実行され、最初のタスクが時計の時間変更前に完了した場合、2つ目のタスクではコンテンツをクリーンアップできない可能性があります。

実際の設定では以下の理由から、これは問題になることはまれです:

1. RecordManagerは高精度のタイムスタンプを使用しています。
2. 最初と2つ目のタスクの実行間隔が短ければ、データが変更される可能性は低くなります。
3. インデックス作成タスクは通常数ミリ秒以上かかります。

## クイックスタート

```python
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

ベクトルストアを初期化し、埋め込みをセットアップします:

```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

適切な名前空間でレコードマネージャーを初期化します。

**提案:** ベクトルストアとベクトルストア内のコレクション名の両方を考慮した名前空間を使用してください。例: 'redis/my_docs'、'chromadb/my_docs'、'postgres/my_docs'。

```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

レコードマネージャーを使用する前にスキーマを作成します。

```python
record_manager.create_schema()
```

テストドキュメントをインデックス化してみましょう:

```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

空のベクトルストアにインデックス化する:

```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### ``None`` 削除モード

このモードは古いバージョンのコンテンツの自動クリーンアップを行いませんが、コンテンツの重複排除は行います。

```python
_clear()
```

```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
_clear()
```

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

2回目は全てのコンテンツがスキップされます:

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

### ``"incremental"`` 削除モード

```python
_clear()
```

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

再度インデックス化すると、両方のドキュメントが**スキップ**されます - 埋め込み操作もスキップされます!

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

増分インデックス化モードで何もドキュメントを提供しない場合、何も変更されません。

```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

ドキュメントを変更すると、新しいバージョンが書き込まれ、同じソースを共有するすべての古いバージョンが削除されます。

```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```

```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```

### ``"full"`` 削除モード

`full`モードでは、インデックス化する関数に、インデックス化する必要のある完全なコンテンツを渡す必要があります。

インデックス化関数に渡されていないが、ベクトルストアに存在するドキュメントはすべて削除されます!

この動作は、ソースドキュメントの削除を処理するのに役立ちます。

```python
_clear()
```

```python
all_docs = [doc1, doc2]
```

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

誰かが最初のドキュメントを削除したとしましょう:

```python
del all_docs[0]
```

```python
all_docs
```

```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```

フルモードを使用すると、削除されたコンテンツも削除されます。

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```

## ソース

メタデータ属性には `source` というフィールドが含まれています。このソースは、関連付けられたドキュメントの*最終的な*出所を指す必要があります。

例えば、これらのドキュメントが親ドキュメントのチャンクを表している場合、両方のドキュメントの `source` は同じで、親ドキュメントを参照する必要があります。

一般に、`source` は常に指定する必要があります。`None` を使用するのは、`incremental` モードを**決して**使用しない場合で、何らかの理由で `source` フィールドを正しく指定できない場合のみです。

```python
from langchain_text_splitters import CharacterTextSplitter
```

```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```

```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```

```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```

```python
_clear()
```

```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

これにより、`doggy.txt` ソースに関連付けられた古いバージョンのドキュメントが削除され、新しいバージョンに置き換えられます。

```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```

## ローダーの使用

インデックス化は、ドキュメントの反復可能なオブジェクトを受け入れるか、ローダーを受け入れることができます。

**注意:** ローダーは**必ず**ソースキーを正しく設定する必要があります。

```python
from langchain_community.document_loaders.base import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```

```python
_clear()
```

```python
loader = MyCustomLoader()
```

```python
loader.load()
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```
