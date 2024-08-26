---
translated: true
---

# Elasticsearch

> [Elasticsearch](https://www.elastic.co/elasticsearch/)は分散型のRESTfulな検索およびアナリティクスエンジンです。
> HTTPウェブインターフェースとスキーマフリーのJSONドキュメントを備えた分散型の多テナント対応の全文検索エンジンを提供します。

このノートブックでは、`Elasticsearch`ベクトアストアを使用した`SelfQueryRetriever`のデモを行います。

## Elasticsearchベクトアストアの作成

まず、`Elasticsearch`ベクトアストアを作成し、いくつかのデータを入力します。映画のサマリーを含む小さなデモセットを作成しました。

**注意:** self-query retrieverを使用するには、`lark`をインストールする必要があります(`pip install lark`)。また、`elasticsearch`パッケージも必要です。

```python
%pip install --upgrade --quiet  U lark langchain langchain-elasticsearch
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3 is available.
You should consider upgrading via the '/Users/joe/projects/elastic/langchain/libs/langchain/.venv/bin/python3 -m pip install --upgrade pip' command.[0m[33m
[0m
```

```python
import getpass
import os

from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

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
vectorstore = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    index_name="elasticsearch-self-query-demo",
    es_url="http://localhost:9200",
)
```

## self-querying retrieverの作成

次に、retrieverをインスタンス化します。これを行うには、ドキュメントがサポートするメタデータフィールドの情報と、ドキュメントの内容の簡単な説明を事前に提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

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

## 試してみる

さて、実際にretrieverを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky', 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.6})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'director': 'Greta Gerwig', 'rating': 8.3})]
```

## kのフィルタリング

self-query retrieverを使って、`k`(取得するドキュメントの数)を指定することもできます。

これは、コンストラクタに`enable_limit=True`を渡すことで行えます。

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

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## 複雑なクエリの実行

これまでは簡単なクエリを試してきましたが、より複雑なクエリはどうでしょうか。Elasticsearchの機能を最大限に活用したいくつかの複雑なクエリを試してみましょう。

```python
retriever.invoke(
    "what animated or comedy movies have been released in the last 30 years about animated toys?"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
vectorstore.client.indices.delete(index="elasticsearch-self-query-demo")
```
