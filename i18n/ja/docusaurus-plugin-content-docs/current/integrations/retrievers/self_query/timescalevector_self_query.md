---
translated: true
---

# Timescale Vector (Postgres)

>[Timescale Vector](https://www.timescale.com/ai)は、AIアプリケーション向けの`PostgreSQL++`です。これにより、`PostgreSQL`内で数十億のベクトル埋め込みを効率的に保存およびクエリできるようになります。

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)、別名`Postgres`は、拡張性とSQL準拠性を重視する無料のオープンソース関係データベース管理システム(RDBMS)です。

このノートブックでは、Postgresのベクトルデータベース(`TimescaleVector`)を使用してセルフクエリを行う方法を示します。ノートブックでは、TimescaleVectorベクトルストアをラップした`SelfQueryRetriever`をデモンストレーションします。

## Timescale Vectorとは?

**[Timescale Vector](https://www.timescale.com/ai)は、AIアプリケーション向けのPostgreSQL++です。**

Timescale Vectorにより、`PostgreSQL`内で数百万のベクトル埋め込みを効率的に保存およびクエリできるようになります。
- DiskANN inspired indexing algorithmにより、`pgvector`をより高速かつ正確なシミラリティ検索に強化しています。
- 自動的なタイムベースのパーティショニングとインデックス化により、時間ベースのベクトル検索を高速化しています。
- ベクトル埋め込みと関係データを照会するための、SQL ベースのファミリアなインターフェイスを提供しています。

Timescale Vectorは、POCから本番環境まで拡張できるクラウドPostgreSQLです:
- 関係メタデータ、ベクトル埋め込み、時系列データを単一のデータベースに保存できるため、運用が簡素化されます。
- ストリーミングバックアップ、レプリケーション、高可用性、行レベルセキュリティなどのエンタープライズグレードの機能を備えた堅牢なPostgreSQLの基盤を活用できます。
- エンタープライズグレードのセキュリティとコンプライアンスにより、心配なく利用できます。

## Timescale Vectorへのアクセス

Timescale Vectorは、クラウドPostgreSQLプラットフォームの[Timescale](https://www.timescale.com/ai)で利用できます。(現時点では自己ホスト版はありません。)

LangChainユーザーは、Timescale Vectorの90日間の無料トライアルを受けられます。
- 開始するには、[サインアップ](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)してTimescaleにアカウントを作成し、新しいデータベースを作成し、このノートブックに従ってください。
- 詳細とパフォーマンスベンチマークについては、[Timescale Vector explainer blog](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)を参照してください。
- Pythonでのタイムスケールベクトルの使用方法の詳細については、[installation instructions](https://github.com/timescale/python-vector)を参照してください。

## TimescaleVectorベクトルストアの作成

まず、Timescale Vectorベクトルストアを作成し、いくつかのデータを入力する必要があります。映画のサマリーを含む小さなデモデータセットを用意しました。

注意: セルフクエリリトリーバーを使用するには、`lark`をインストールする必要があります(`pip install lark`)。また、`timescale-vector`パッケージも必要です。

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  timescale-vector
```

この例では`OpenAIEmbeddings`を使用するので、OpenAI APIキーをロードしましょう。

```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

PostgreSQLデータベースに接続するには、サービスURIが必要です。これは、新しいデータベースを作成した後にダウンロードした`cheatsheet`または`.env`ファイルで確認できます。

まだ登録していない場合は、[Timescaleにサインアップ](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)し、新しいデータベースを作成してください。

URIは次のような形式になります: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`

```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```

```python
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

ここでは、このデモで使用するサンプルドキュメントを示します。このデータは映画に関するものであり、特定の映画に関する内容とメタデータのフィールドが含まれています。

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
```

最後に、Timescale Vectorベクトルストアを作成します。コレクション名は、ドキュメントが保存されるPostgreSQLテーブルの名前になります。

```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## セルフクエリリトリーバーの作成

次に、リトリーバーをインスタンス化します。これを行うには、ドキュメントがサポートするメタデータフィールドの情報と、ドキュメントの内容の簡単な説明を提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Timescale Vector (Postgres)でのセルフクエリ検索

さて、実際にリトリーバーを使ってみましょう!

以下のクエリを実行し、クエリ、フィルター、複合フィルター(AND、ORを使ったフィルター)を自然言語で指定できることに注目してください。セルフクエリリトリーバーがそれらをSQL に変換し、Timescale Vector (Postgres)ベクトルストアで検索を実行します。

これがセルフクエリリトリーバーの強みを示しています。ユーザーがSQL を直接書く必要なく、ベクトルストアに対して複雑な検索を実行できます。

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

### kのフィルタリング

セルフクエリリトリーバーを使って、取得するドキュメントの数`k`を指定することもできます。

これを行うには、コンストラクタに`enable_limit=True`を渡します。

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```
