---
translated: true
---

# Tencent Cloud VectorDB

> [Tencent Cloud VectorDB](https://cloud.tencent.com/document/product/1709)は、多次元ベクトルデータの保存、検索、分析を目的とした、完全に管理されたセルフ開発の企業レベルの分散データベースサービスです。

このチュートリアルでは、Tencent Cloud VectorDBを使用して`SelfQueryRetriever`をデモンストレーションします。

## TencentVectorDBインスタンスの作成

まず、TencentVectorDBを作成し、いくつかのデータを入力します。映画のサマリーを含む小さなデモデータセットを作成しました。

**注意:** self-query retrieverを使用するには、`lark`(`pip install lark`)とインテグレーション固有の要件をインストールする必要があります。

```python
%pip install --upgrade --quiet tcvectordb langchain-openai tiktoken lark
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

`OpenAIEmbeddings`を使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

TencentVectorDBインスタンスを作成し、いくつかのデータを入力します:

```python
from langchain_community.vectorstores.tencentvectordb import (
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document
from tcvectordb.model.enum import FieldType

meta_fields = [
    MetaField(name="year", data_type="uint64", index=True),
    MetaField(name="rating", data_type="string", index=False),
    MetaField(name="genre", data_type=FieldType.String, index=True),
    MetaField(name="director", data_type=FieldType.String, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.",
        metadata={
            "year": 2012,
            "rating": "8.0",
            "genre": "science fiction",
            "director": "Joss Whedon",
        },
    ),
    Document(
        page_content="Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.",
        metadata={
            "year": 2018,
            "rating": "7.3",
            "genre": "science fiction",
            "director": "Ryan Coogler",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="self_query_movies",
    meta_fields=meta_fields,
    drop_old=True,
)
```

## self-querying retrieverの作成

次に、retrieverをインスタンス化できます。これを行うには、ドキュメントがサポートするメタデータフィールドの情報と、ドキュメントの内容の簡単な説明を提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
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
        name="rating", description="A 1-10 rating for the movie", type="string"
    ),
]
document_content_description = "Brief summary of a movie"
```

```python
llm = ChatOpenAI(temperature=0, model="gpt-4", max_tokens=4069)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_db, document_content_description, metadata_field_info, verbose=True
)
```

## テストしてみる

それでは、実際にretrieverを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("movies about a superhero")
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'}),
 Document(page_content='The Godfather is a 1972 American crime film directed by Francis Ford Coppola.', metadata={'year': 1972, 'rating': '9.2', 'genre': 'crime', 'director': 'Francis Ford Coppola'})]
```

```python
# This example only specifies a filter
retriever.invoke("movies that were released after 2010")
```

```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```

```python
# This example specifies both a relevant query and a filter
retriever.invoke("movies about a superhero which were released after 2010")
```

```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```

## kのフィルタリング

self-query retrieverを使用して、`k`(取得するドキュメントの数)を指定することもできます。

これは、コンストラクターに`enable_limit=True`を渡すことで行えます。

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_db,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
retriever.invoke("what are two movies about a superhero")
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'})]
```
