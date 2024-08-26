---
translated: true
---

# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb)は[SemaFind](https://www.semafind.com)から提供されるAIアプリケーション構築のための無料のベクトル類似性データベースです。ホスティングされた`SemaDB Cloud`では、開発を簡単に始められるデベロッパー体験を提供しています。

APIの完全なドキュメントと例、対話型のプレイグラウンドは[RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb)で利用できます。

このノートブックでは、`SemaDB Cloud`ベクトルストアの使用方法を示します。

## ドキュメントの埋め込みをロードする

ローカルで実行するために、一般的に文章の埋め込みに使用される[Sentence Transformers](https://www.sbert.net/)を使用しています。LangChainが提供するどの埋め込みモデルでも使用できます。

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```

```output
114
```

## SemaDBに接続する

SemaDB Cloudは[RapidAPIキー](https://rapidapi.com/semafind-semadb/api/semadb)を使用して認証します。無料のRapidAPIアカウントを作成することで、キーを取得できます。

```python
import getpass
import os

os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```

```output
SemaDB API Key: ········
```

```python
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

SemaDBベクトルストアのパラメーターはAPIに直接反映されています:

- "mycollection": ベクトルを保存するコレクション名です。
- 768: ベクトルの次元数です。この場合、Sentence Transformerの埋め込みは768次元のベクトルを生成します。
- API_KEY: RapidAPIキーです。
- embeddings: ドキュメント、テキスト、クエリの埋め込みを生成する方法を指定します。
- DistanceStrategy: 使用する距離メトリックです。ラッパーはCOSINEを使用する場合、自動的にベクトルを正規化します。

```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```

```output
True
```

SemaDBベクトルストアのラッパーは、後で参照できるようにドキュメントテキストをポイントメタデータとして追加します。大量のテキストを保存することは*推奨されません*。大規模なコレクションをインデックス化する場合は、代わりに外部IDなどのドキュメントへの参照を保存することをお勧めします。

```python
db.add_documents(docs)[:2]
```

```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```

## 類似検索

デフォルトのLangChain類似検索インターフェイスを使用して、最も類似した文章を検索します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```

## クリーンアップ

コレクションを削除してすべてのデータを削除できます。

```python
db.delete_collection()
```

```output
True
```
