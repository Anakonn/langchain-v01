---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/)は、Web、モバイル、サーバーレス、Jamstack、バックエンド、従来のアプリケーションを含む、モダンなアプリケーション向けに設計されたエンドツーエンドのクラウドネイティブデータベースです。SurrealDBを使うことで、データベースとAPIのインフラストラクチャを簡素化し、開発時間を短縮し、セキュアでパフォーマンスの高いアプリを迅速かつコスト効率的に構築できます。

>**SurrealDBの主な機能は以下の通りです:**

>* **開発時間の短縮:** SurrealDBはデータベースとAPIスタックを簡素化し、ほとんどのサーバーサイドコンポーネントが不要になるため、セキュアでパフォーマンスの高いアプリをより速く、より安価に構築できます。
>* **リアルタイムのコラボレーションAPI バックエンドサービス:** SurrealDBはデータベースとAPIバックエンドサービスの両方の機能を持ち、リアルタイムのコラボレーションを可能にします。
>* **複数のクエリ言語のサポート:** SurrealDBはクライアントデバイスからのSQL クエリ、GraphQL、ACID トランザクション、WebSocket接続、構造化/非構造化データ、グラフクエリ、全文検索、地理空間クエリをサポートしています。
>* **細かいアクセス制御:** SurrealDBは行レベルのパーミッションベースのアクセス制御を提供し、データアクセスを細かく管理できます。

>[機能](https://surrealdb.com/features)、最新の[リリース](https://surrealdb.com/releases)、[ドキュメンテーション](https://surrealdb.com/docs)をご覧ください。

このノートブックでは、`SurrealDBLoader`に関連する機能の使用方法を示します。

## 概要

SurrealDB Document Loaderは、SurrealDBデータベースからLangChain Documentsのリストを返します。

Document Loaderは以下のオプションパラメータを受け取ります:

* `dburl`: WebSocketエンドポイントの接続文字列。デフォルト: `ws://localhost:8000/rpc`
* `ns`: ネームスペースの名前。デフォルト: `langchain`
* `db`: データベースの名前。デフォルト: `database`
* `table`: テーブルの名前。デフォルト: `documents`
* `db_user`: 必要な場合のSurrealDB資格情報: データベースのユーザー名
* `db_pass`: 必要な場合のSurrealDB資格情報: データベースのパスワード
* `filter_criteria`: テーブルからの結果をフィルタリングするための`WHERE`句を構築するための辞書

出力の`Document`は以下の形式を取ります:

```output
Document(
    page_content=<json encoded string containing the result document>,
    metadata={
        'id': <document id>,
        'ns': <namespace name>,
        'db': <database_name>,
        'table': <table name>,
        ... <additional fields from metadata property of the document>
    }
)
```

## セットアップ

以下のセルをアンコメントして、surrealdbとlangchainをインストールします。

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
import json

from langchain_community.document_loaders.surrealdb import SurrealDBLoader
```

```python
loader = SurrealDBLoader(
    dburl="ws://localhost:8000/rpc",
    ns="langchain",
    db="database",
    table="documents",
    db_user="root",
    db_pass="root",
    filter_criteria={},
)
docs = loader.load()
len(docs)
```

```output
42
```

```python
doc = docs[-1]
doc.metadata
```

```output
{'id': 'documents:zzz434sa584xl3b4ohvk',
 'source': '../../modules/state_of_the_union.txt',
 'ns': 'langchain',
 'db': 'database',
 'table': 'documents'}
```

```python
len(doc.page_content)
```

```output
18078
```

```python
page_content = json.loads(doc.page_content)
```

```python
page_content["text"]
```

```output
'When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'
```
