---
translated: true
---

# Databricks Vector Search

Databricks Vector Searchは、ベクトルデータベースにデータのベクトル表現とメタデータを保存できるサーバーレスの類似検索エンジンです。Vector Searchを使うと、Unity Catalogで管理されるDeltaテーブルからベクトル検索インデックスを自動更新して作成し、簡単なAPIでそれらを照会して最も類似したベクターを返すことができます。

このノートブックでは、LangChainを使ってDatabricks Vector Searchを使う方法を示します。

`databricks-vectorsearch`と、このノートブックで使用されるその他のPythonパッケージをインストールします。

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

埋め込みには`OpenAIEmbeddings`を使います。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

文書を分割し、埋め込みを取得します。

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))
```

## Databricks Vector Searchクライアントのセットアップ

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
```

## ベクトル検索エンドポイントの作成

このエンドポイントは、ベクトル検索インデックスの作成とアクセスに使用されます。

```python
vsc.create_endpoint(name="vector_search_demo_endpoint", endpoint_type="STANDARD")
```

## Direct Vector Access Indexの作成

Direct Vector Access Indexは、REST APIやSDKを通じて埋め込みベクトルとメタデータの直接読み書きをサポートしています。このインデックスの場合、埋め込みベクトルとインデックスの更新は自分で管理する必要があります。

```python
vector_search_endpoint_name = "vector_search_demo_endpoint"
index_name = "ml.llm.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        "source": "string",
    },
)

index.describe()
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    index, text_column="text", embedding=embeddings, columns=["source"]
)
```

## ドキュメントをインデックスに追加する

```python
dvs.add_documents(docs)
```

## 類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
dvs.similarity_search(query)
print(docs[0].page_content)
```

## Delta Sync Indexの操作

`DatabricksVectorSearch`を使って、Delta Sync Indexの検索もできます。Delta Sync Indexは自動的にDeltaテーブルから同期されます。`add_text`/`add_documents`を手動で呼び出す必要はありません。詳細は[Databricksのドキュメントページ](https://docs.databricks.com/en/generative-ai/vector-search.html#delta-sync-index-with-managed-embeddings)を参照してください。

```python
dvs_delta_sync = DatabricksVectorSearch("catalog_name.schema_name.delta_sync_index")
dvs_delta_sync.similarity_search(query)
```
