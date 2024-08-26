---
translated: true
---

# Redis

>[Redis](https://redis.com)は、キャッシュ、メッセージブローカー、データベース、ベクトルデータベースなどに使用できるオープンソースのキーバリューストアです。

ノートブックでは、`Redis`ベクトルストアをラップした`SelfQueryRetriever`をデモンストレーションします。

## Redisベクトルストアの作成

まず、Redisベクトルストアを作成し、いくつかのデータを入力します。映画のサマリーを含む小さなデモデータセットを作成しました。

**注意:** self-query retrieverを使用するには、`lark`(`pip install lark`)と統合固有の要件をインストールする必要があります。

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken lark
```

`OpenAIEmbeddings`を使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import Redis
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={
            "year": 1993,
            "rating": 7.7,
            "director": "Steven Spielberg",
            "genre": "science fiction",
        },
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={
            "year": 2010,
            "director": "Christopher Nolan",
            "genre": "science fiction",
            "rating": 8.2,
        },
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={
            "year": 2006,
            "director": "Satoshi Kon",
            "genre": "science fiction",
            "rating": 8.6,
        },
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={
            "year": 2019,
            "director": "Greta Gerwig",
            "genre": "drama",
            "rating": 8.3,
        },
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={
            "year": 1995,
            "director": "John Lasseter",
            "genre": "animated",
            "rating": 9.1,
        },
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]
```

```python
index_schema = {
    "tag": [{"name": "genre"}],
    "text": [{"name": "director"}],
    "numeric": [{"name": "year"}, {"name": "rating"}],
}

vectorstore = Redis.from_documents(
    docs,
    embeddings,
    redis_url="redis://localhost:6379",
    index_name="movie_reviews",
    index_schema=index_schema,
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'genre'}], 'text': [{'name': 'director'}], 'numeric': [{'name': 'year'}, {'name': 'rating'}]}
generated_schema: {'text': [{'name': 'director'}, {'name': 'genre'}], 'numeric': [{'name': 'year'}, {'name': 'rating'}], 'tag': []}
```

## self-querying retrieverの作成

次に、retrieverをインスタンス化できます。これを行うには、ドキュメントがサポートするメタデータフィールドの情報と、ドキュメントの内容の簡単な説明を提供する必要があります。

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
```

```python
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 試してみる

それでは、実際にretrieverを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/bagatur/langchain/libs/langchain/langchain/chains/llm.py:278: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 'doc:movie_reviews:7b5481d753bc4135851b66fa61def7fb', 'director': 'Steven Spielberg', 'genre': 'science fiction', 'year': '1993', 'rating': '7.7'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 'doc:movie_reviews:9e4e84daa0374941a6aa4274e9bbb607', 'director': 'John Lasseter', 'genre': 'animated', 'year': '1995', 'rating': '9.1'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 'doc:movie_reviews:2cc66f38bfbd438eb3a045d90a1a4088', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'year': '1979', 'rating': '9.9'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 'doc:movie_reviews:edf567b1d5334e02b2a4c692d853c80c', 'director': 'Satoshi Kon', 'genre': 'science fiction', 'year': '2006', 'rating': '8.6'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.4")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.4) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 'doc:movie_reviews:9e4e84daa0374941a6aa4274e9bbb607', 'director': 'John Lasseter', 'genre': 'animated', 'year': '1995', 'rating': '9.1'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 'doc:movie_reviews:2cc66f38bfbd438eb3a045d90a1a4088', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'year': '1979', 'rating': '9.9'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 'doc:movie_reviews:edf567b1d5334e02b2a4c692d853c80c', 'director': 'Satoshi Kon', 'genre': 'science fiction', 'year': '2006', 'rating': '8.6'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'id': 'doc:movie_reviews:bb899807b93c442083fd45e75a4779d5', 'director': 'Greta Gerwig', 'genre': 'drama', 'year': '2019', 'rating': '8.3'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.CONTAIN: 'contain'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 'doc:movie_reviews:2cc66f38bfbd438eb3a045d90a1a4088', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'year': '1979', 'rating': '9.9'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 'doc:movie_reviews:edf567b1d5334e02b2a4c692d853c80c', 'director': 'Satoshi Kon', 'genre': 'science fiction', 'year': '2006', 'rating': '8.6'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.CONTAIN: 'contain'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 'doc:movie_reviews:9e4e84daa0374941a6aa4274e9bbb607', 'director': 'John Lasseter', 'genre': 'animated', 'year': '1995', 'rating': '9.1'})]
```

## フィルターk

self-query retrieverを使って、`k`(取得するドキュメントの数)を指定することもできます。

これは、コンストラクターに`enable_limit=True`を渡すことで行えます。

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
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 'doc:movie_reviews:7b5481d753bc4135851b66fa61def7fb', 'director': 'Steven Spielberg', 'genre': 'science fiction', 'year': '1993', 'rating': '7.7'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 'doc:movie_reviews:9e4e84daa0374941a6aa4274e9bbb607', 'director': 'John Lasseter', 'genre': 'animated', 'year': '1995', 'rating': '9.1'})]
```
