---
translated: true
---

# PGVector

> LangChain ベクトルストア抽象化の実装で、バックエンドに `postgres` を使用し、`pgvector` 拡張機能を利用しています。

コードは [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/) という統合パッケージにあります。

以下のコマンドを実行して、`pgvector` 拡張機能を備えた Postgres コンテナを起動できます:

```shell
docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

## ステータス

このコードは `langchain_community` から `langchain-postgres` という専用パッケージにポートされました。以下の変更が行われています:

* langchain_postgres は psycopg3 のみ動作します。接続文字列を `postgresql+psycopg2://...` から `postgresql+psycopg://langchain:langchain@...` に更新してください (ドライバー名は `psycopg3` ではなく `psycopg` ですが、`psycopg3` を使用します)。
* エンベディングストアとコレクションのスキーマが変更され、ユーザー指定の ID でも add_documents が正しく動作するようになりました。
* 明示的な接続オブジェクトを渡す必要があります。

現在、スキーマの変更に対応する簡単なデータ移行メカニズムはありません。したがって、ベクトルストアのスキーマを変更する場合、ユーザーが手動でテーブルを再作成し、ドキュメントを再追加する必要があります。
これが問題である場合は、別のベクトルストアを使用してください。そうでなければ、この実装はご利用のユースケースに適しています。

## 依存関係のインストール

ここでは `langchain_cohere` を使ってエンベディングを行いますが、他のエンベディングプロバイダーも使えます。

```python
!pip install --quiet -U langchain_cohere
!pip install --quiet -U langchain_postgres
```

## ベクトルストアの初期化

```python
from langchain_cohere import CohereEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"
embeddings = CohereEmbeddings()

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## テーブルの削除

(エンベディングの次元を変更したり、エンベディングプロバイダーを更新したりする際に)テーブルを削除する必要がある場合:

```python
vectorstore.drop_tables()
```

## ドキュメントの追加

ベクトルストアにドキュメントを追加します

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

```python
vectorstore.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```python
vectorstore.similarity_search("kitty", k=10)
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'})]
```

ID によるドキュメントの追加は、一致するIDのドキュメントを上書きします。

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

## フィルタリングのサポート

ベクトルストアでは、ドキュメントのメタデータフィールドに対して一連のフィルターを適用できます。

| 演算子 | 意味/カテゴリー        |
|----------|-------------------------|
| \$eq      | 等価 (==)           |
| \$ne      | 不等価 (!=)         |
| \$lt      | 未満 (<)           |
| \$lte     | 以下 (<=) |
| \$gt      | 超過 (>)        |
| \$gte     | 以上 (>=) |
| \$in      | 特殊ケース (in)      |
| \$nin     | 特殊ケース (not in)  |
| \$between | 特殊ケース (between) |
| \$like    | テキスト (like)             |
| \$ilike   | テキスト (大文字小文字を区別しないlike) |
| \$and     | 論理 (and)           |
| \$or      | 論理 (or)            |

```python
vectorstore.similarity_search("kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}})
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'})]
```

複数のフィールドを持つ辞書を渡した場合、トップレベルは論理 **AND** フィルターとして解釈されます。

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search("bird", k=10, filter={"location": {"$ne": "pond"}})
```

```output
[Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'})]
```
