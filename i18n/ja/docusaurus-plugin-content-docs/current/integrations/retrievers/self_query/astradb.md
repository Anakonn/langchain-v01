---
translated: true
---

# Astra DB (Cassandra)

>[DataStax Astra DB](https://docs.datastax.com/en/astra/home/astra.html)は、`Cassandra`に基づいて構築されたサーバーレスのベクトル対応データベースで、使いやすいJSONAPIを通して提供されています。

このウォークスルーでは、`Astra DB`ベクトルストアを使って`SelfQueryRetriever`をデモンストレーションします。

## Astra DBベクトルストアの作成

まず、Astra DBベクトルストアを作成し、いくつかのデータを入力します。映画のサマリーを含む小さなデモデータセットを用意しました。

注意: self-query retrieverを使うには、`lark`をインストールする必要があります(`pip install lark`)。また、`astrapy`パッケージも必要です。

```python
%pip install --upgrade --quiet lark astrapy langchain-openai
```

`OpenAIEmbeddings`を使用するには、OpenAI APIキーを取得する必要があります。

```python
import os
from getpass import getpass

from langchain_openai.embeddings import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

Astra DBベクトルストアを作成します:

- APIエンドポイントは`https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`のようになります
- トークンは`AstraCS:6gBhNmsk135....`のようになります

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
from langchain.vectorstores import AstraDB
from langchain_core.documents import Document

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

vectorstore = AstraDB.from_documents(
    docs,
    embeddings,
    collection_name="astra_self_query_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)
```

## self-querying retrieverの作成

次に、retrieverをインスタンス化します。事前に、ドキュメントがサポートするメタデータフィールドと、ドキュメントの内容の簡単な説明を提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.llms import OpenAI
from langchain.retrievers.self_query.base import SelfQueryRetriever

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
llm = OpenAI(temperature=0)

retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## テストしてみる

それでは、実際にretrieverを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs?")
```

```python
# This example specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example only specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5), science fiction movie ?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie about toys after 1990 but before 2005, and is animated"
)
```

## kのフィルタリング

self-query retrieverを使って、取得するドキュメントの数`k`を指定することもできます。

`enable_limit=True`をコンストラクタに渡すことで、これを行うことができます。

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```

## クリーンアップ

Astra DBインスタンスからコレクションを完全に削除したい場合は、このコードを実行してください。

_(保存したデータはすべて失われます。)_

```python
vectorstore.delete_collection()
```
