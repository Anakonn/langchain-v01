---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/) は統合ベクトルデータベースです。SQLからデータベースにアクセスできるほか、ここ、LangChainからもアクセスできます。
>`MyScale` は[さまざまなデータ型とフィルタ機能](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints)を利用できます。データの拡張やシステムの拡張に関わらず、LLMアプリケーションのパフォーマンスを向上させます。

このノートブックでは、いくつかの追加機能を組み込んだ `MyScale` ベクトルストアを使った `SelfQueryRetriever` のデモを行います。

要約すると、以下の4点に集約できます:
1. 複数の要素がマッチした場合に、リストの中に含まれているかどうかを判定する `contain` 比較演算子の追加
2. 日時のマッチングに使える `timestamp` データ型の追加 (ISO形式、または YYYY-MM-DD)
3. 文字列パターン検索に使える `like` 比較演算子の追加
4. 任意の関数を使えるようにする機能の追加

## MyScaleベクトルストアの作成

MyScaleはLangChainに既に統合されています。[このノートブック](/docs/integrations/vectorstores/myscale)に従って、自己クエリ検索リトリーバーのためのベクトルストアを作成できます。

**注意:** 全ての自己クエリ検索リトリーバーには `lark` がインストールされている必要があります (`pip install lark`)。文法定義に `lark` を使用しています。次のステップに進む前に、`clickhouse-connect` もMyScaleバックエンドとやり取りするために必要であることを忘れないでください。

```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

このチュートリアルでは他の例に倣い、`OpenAIEmbeddings` を使います。LLMへの有効なアクセスのためには、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

```python
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## サンプルデータの作成

ご覧のとおり、作成したデータは他の自己クエリ検索リトリーバーとは少し異なります。キーワード `year` を `date` に置き換え、LLMが新しい `contain` 比較演算子を使ってフィルタを構築できるようにしました。また、`like` 比較演算子と任意の関数サポートも提供しています。これらについては次のセルで説明します。

まずはデータを見てみましょう。

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## 自己クエリ検索リトリーバーの作成

他のリトリーバーと同じように、シンプルで使いやすいです。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
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
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 既存の機能を使って自己クエリ検索リトリーバーをテストする

さあ、実際にリトリーバーを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

# ちょっと待って...他にもできることがあるんじゃない?

MyScaleを使った自己クエリ検索リトリーバーにはさらに機能があります。見てみましょう。

```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```

```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```

```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```

```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
```

## kのフィルタリング

自己クエリ検索リトリーバーを使って、取得するドキュメントの数 `k` を指定することもできます。

`enable_limit=True` をコンストラクタに渡すことで、これを行えます。

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
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
