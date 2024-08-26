---
translated: true
---

# AnalyticDB

>[AnalyticDB for PostgreSQL](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) は、大量のデータをオンラインで分析するために設計された大規模並列処理 (MPP) データウェアハウスサービスです。

>`AnalyticDB for PostgreSQL` はオープンソースの `Greenplum Database` プロジェクトに基づいて開発されており、`Alibaba Cloud` による詳細な拡張が施されています。AnalyticDB for PostgreSQL は ANSI SQL 2003 構文および PostgreSQL と Oracle データベースエコシステムと互換性があります。また、AnalyticDB for PostgreSQL は行ストアと列ストアの両方をサポートしています。AnalyticDB for PostgreSQL はペタバイトのデータをオフラインで高性能に処理し、高度に並行したオンラインクエリをサポートします。

このノートブックは、`AnalyticDB` ベクターデータベースに関連する機能の使用方法を示します。
実行するには、[AnalyticDB](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) インスタンスが稼働している必要があります:
- [AnalyticDB Cloud Vector Database](https://www.alibabacloud.com/product/hybriddb-postgresql) を使用します。ここをクリックして迅速にデプロイします。

```python
from langchain_community.vectorstores import AnalyticDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

OpenAI API を呼び出してドキュメントを分割し、埋め込みを取得します

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

関連する環境を設定して AnalyticDB に接続します

```bash
export PG_HOST={your_analyticdb_hostname}
export PG_PORT={your_analyticdb_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

次に、埋め込みとドキュメントを AnalyticDB に保存します

```python
import os

connection_string = AnalyticDB.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = AnalyticDB.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

データをクエリして取得します

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
