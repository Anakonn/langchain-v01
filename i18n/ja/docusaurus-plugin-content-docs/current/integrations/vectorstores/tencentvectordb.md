---
translated: true
---

# Tencent Cloud VectorDB

>[Tencent Cloud VectorDB](https://cloud.tencent.com/document/product/1709)は、多次元ベクトルデータの保存、検索、分析を目的とした、完全に管理されたTencent独自開発のエンタープライズレベルの分散データベースサービスです。このデータベースは複数のインデックスタイプと類似性計算方法をサポートしています。単一のインデックスは最大10億のベクトルをサポートし、数百万QPS、ミリ秒レベルの応答時間を実現できます。Tencent Cloud Vector Databaseは、大規模モデルの精度向上のための外部知識ベースの提供だけでなく、レコメンデーションシステム、NLPサービス、コンピュータービジョン、インテリジェントカスタマーサービスなどのAI分野でも広く使用できます。

このノートブックでは、Tencent ベクトルデータベースの機能の使用方法を示します。

実行するには、[データベースインスタンス](https://cloud.tencent.com/document/product/1709/95101)が必要です。

## 基本的な使用方法

```python
!pip3 install tcvectordb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import TencentVectorDB
from langchain_community.vectorstores.tencentvectordb import ConnectionParams
from langchain_text_splitters import CharacterTextSplitter
```

文書をロードし、チャンクに分割します。

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

文書のエンベディングには2つの方法をサポートしています:
- Langchain Embeddingsと互換性のある任意のEmbeddingsモデルを使用する。
- Tencent VectorStore DBのEmbeddingモデル名を指定する。選択肢は以下の通りです:
    - `bge-base-zh`, 次元: 768
    - `m3e-base`, 次元: 768
    - `text2vec-large-chinese`, 次元: 1024
    - `e5-large-v2`, 次元: 1024
    - `multilingual-e5-base`, 次元: 768

以下のコードでは、両方の方法を示しています。どちらか一方をコメントアウトして使用してください:

```python
##  you can use a Langchain Embeddings model, like OpenAIEmbeddings:

# from langchain_community.embeddings.openai import OpenAIEmbeddings
#
# embeddings = OpenAIEmbeddings()
# t_vdb_embedding = None

## Or you can use a Tencent Embedding model, like `bge-base-zh`:

t_vdb_embedding = "bge-base-zh"  # bge-base-zh is the default model
embeddings = None
```

次に、TencentVectorDBインスタンスを作成します。`embeddings`または`t_vdb_embedding`パラメータのいずれかを指定する必要があります。両方が指定された場合は、`embeddings`パラメータが使用されます:

```python
conn_params = ConnectionParams(
    url="http://10.0.X.X",
    key="eC4bLRy2va******************************",
    username="root",
    timeout=20,
)

vector_db = TencentVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, t_vdb_embedding=t_vdb_embedding
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

```python
vector_db = TencentVectorDB(embeddings, conn_params)

vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```

```output
'Ankush went to Princeton'
```

## メタデータとフィルタリング

Tencent VectorDBはメタデータと[フィルタリング](https://cloud.tencent.com/document/product/1709/95099#c6f6d3a3-02c5-4891-b0a1-30fe4daf18d8)をサポートしています。文書にメタデータを追加し、メタデータに基づいて検索結果をフィルタリングできます。

新しいTencentVectorDBコレクションを作成し、メタデータに基づいて検索結果をフィルタリングする方法を示します:

```python
from langchain_community.vectorstores.tencentvectordb import (
    META_FIELD_TYPE_STRING,
    META_FIELD_TYPE_UINT64,
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document

meta_fields = [
    MetaField(name="year", data_type=META_FIELD_TYPE_UINT64, index=True),
    MetaField(name="rating", data_type=META_FIELD_TYPE_STRING, index=False),
    MetaField(name="genre", data_type=META_FIELD_TYPE_STRING, index=True),
    MetaField(name="director", data_type=META_FIELD_TYPE_STRING, index=True),
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
            "genre": "superhero",
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
    collection_name="movies",
    meta_fields=meta_fields,
)

query = "film about dream by Christopher Nolan"

# you can use the tencentvectordb filtering syntax with the `expr` parameter:
result = vector_db.similarity_search(query, expr='director="Christopher Nolan"')

# you can either use the langchain filtering syntax with the `filter` parameter:
# result = vector_db.similarity_search(query, filter='eq("director", "Christopher Nolan")')

result
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='Inception is a 2010 science fiction action film written and directed by Christopher Nolan.', metadata={'year': 2010, 'rating': '8.8', 'genre': 'science fiction', 'director': 'Christopher Nolan'})]
```
