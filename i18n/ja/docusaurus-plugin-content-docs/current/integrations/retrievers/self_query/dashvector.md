---
translated: true
---

# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html)は、高次元の密な/疎なベクトルをサポートし、リアルタイムの挿入と絞り込み検索が可能な完全管理型のベクトルDBサービスです。自動的にスケーリングし、さまざまなアプリケーション要件に適応することができます。
> `DashVector`ベクトル検索サービスは、`DAMO Academy`が独自に開発した効率的なベクトルエンジンの`Proxima`コアに基づいており、水平方向の拡張機能を備えたクラウドネイティブの完全管理型ベクトル検索サービスを提供します。
> `DashVector`は、シンプルで使いやすいSDK/APIインターフェイスを通じて、強力なベクトル管理、ベクトル検索、その他の多様な機能を公開しており、上位層のAIアプリケーションによる迅速な統合が可能です。これにより、大規模モデルエコロジー、マルチモーダルAI検索、分子構造解析など、効率的なベクトル検索機能を必要とするさまざまなアプリケーションシナリオにサービスを提供します。

このノートブックでは、`DashVector`ベクトルストアを使用した`SelfQueryRetriever`のデモを行います。

## DashVectorベクトルストアの作成

まず、`DashVector`ベクトルストアを作成し、いくつかのデータを投入します。映画のサマリーを含む小さなデモデータセットを用意しました。

DashVectorを使用するには、`dashvector`パッケージをインストールし、APIキーと環境を用意する必要があります。[インストール手順](https://help.aliyun.com/document_detail/2510223.html)は以下の通りです。

注意: self-query retrieverを使用するには、`lark`パッケージもインストールする必要があります。

```python
%pip install --upgrade --quiet  lark dashvector
```

```python
import os

import dashvector

client = dashvector.Client(api_key=os.environ["DASHVECTOR_API_KEY"])
```

```python
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_core.documents import Document

embeddings = DashScopeEmbeddings()

# create DashVector collection
client.create("langchain-self-retriever-demo", dimension=1536)
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "action"},
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
vectorstore = DashVector.from_documents(
    docs, embeddings, collection_name="langchain-self-retriever-demo"
)
```

## self-querying retrieverの作成

次に、retrieverのインスタンスを作成します。事前に、ドキュメントがサポートするメタデータフィールドと、ドキュメントの内容の簡単な説明を提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.llms import Tongyi

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
llm = Tongyi(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 動作確認

さて、実際にretrieverを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaurs' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.699999809265137, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'year': 2010, 'director': 'Christopher Nolan', 'rating': 8.199999809265137}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.600000381469727})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'director': 'Andrei Tarkovsky', 'rating': 9.899999618530273, 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.600000381469727})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='Greta Gerwig' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'director': 'Greta Gerwig', 'rating': 8.300000190734863})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query='science fiction' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction'), Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5)]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'director': 'Andrei Tarkovsky', 'rating': 9.899999618530273, 'genre': 'science fiction'})]
```

## フィルタリングk

self-query retrieverを使って、取得するドキュメントの数`k`を指定することもできます。

`enable_limit=True`をコンストラクタに渡すことで、これを行うことができます。

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
query='dinosaurs' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.699999809265137, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
