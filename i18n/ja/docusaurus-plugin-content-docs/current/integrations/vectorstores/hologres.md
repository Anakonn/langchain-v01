---
translated: true
---

# Hologres

>[Hologres](https://www.alibabacloud.com/help/en/hologres/latest/introduction)は、Alibaba Cloudが開発した統合リアルタイムデータウェアハウスサービスです。Hologresを使用して、大量のデータをリアルタイムで書き込み、更新、処理、分析することができます。
>Hologresは標準SQLシンタックスをサポートし、PostgreSQLと互換性があり、ほとんどのPostgreSQLの機能をサポートしています。Hologresは、ペタバイトのデータに対するオンライン分析処理(OLAP)およびアドホック分析をサポートし、高コンカレンシーと低レイテンシーのオンラインデータサービスを提供します。

>Hologresは、[Proxima](https://www.alibabacloud.com/help/en/hologres/latest/vector-processing)を採用することで、**ベクトルデータベース**の機能を提供しています。
>Proximaは、Alibaba DAMO Academyが開発した高性能なソフトウェアライブラリです。ベクトルの最近傍を検索することができます。Proximaは、Faissなどの同様のオープンソースソフトウェアよりも高い安定性とパフォーマンスを提供します。Proximaを使用すると、高スループットと低レイテンシーでテキストやイメージの埋め込みを検索することができます。Hologresは、Proximaと深く統合されており、高性能なベクトル検索サービスを提供しています。

このノートブックでは、`Hologres Proxima`ベクトルデータベースに関連する機能の使用方法を示します。
[ここ](https://www.alibabacloud.com/zh/product/hologres)をクリックすると、Hologresクラウドインスタンスを簡単にデプロイできます。

```python
%pip install --upgrade --quiet  hologres-vector
```

```python
from langchain_community.vectorstores import Hologres
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

OpenAI APIを呼び出してドキュメントを分割し、埋め込みを取得します。

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

関連する環境変数を設定してHologresに接続します。

```bash
export PG_HOST={host}
export PG_PORT={port} # Optional, default is 80
export PG_DATABASE={db_name} # Optional, default is postgres
export PG_USER={username}
export PG_PASSWORD={password}
```

次に、埋め込みとドキュメントをHologresに格納します。

```python
import os

connection_string = Hologres.connection_string_from_db_params(
    host=os.environ.get("PGHOST", "localhost"),
    port=int(os.environ.get("PGPORT", "80")),
    database=os.environ.get("PGDATABASE", "postgres"),
    user=os.environ.get("PGUSER", "postgres"),
    password=os.environ.get("PGPASSWORD", "postgres"),
)

vector_db = Hologres.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
    table_name="langchain_example_embeddings",
)
```

クエリを実行してデータを取得します。

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
