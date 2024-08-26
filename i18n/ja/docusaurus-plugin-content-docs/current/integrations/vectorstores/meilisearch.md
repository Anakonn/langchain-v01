---
translated: true
---

# Meilisearch

> [Meilisearch](https://meilisearch.com)は、オープンソースの高速で高度に関連性の高い検索エンジンです。開発者がスムーズな検索体験を構築するのに役立つ優れたデフォルト設定が用意されています。
>
> [Meilisearchをセルフホスト](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation)したり、[Meilisearch Cloud](https://www.meilisearch.com/pricing)で実行したりすることができます。

Meilisearch v1.3はベクトル検索をサポートしています。このページでは、Meilisearchをベクトルストアとして統合し、ベクトル検索を行う方法を説明します。

## セットアップ

### Meilisearchインスタンスの起動

ベクトルストアとして使用するには、実行中のMeilisearchインスタンスが必要です。[ローカルでMeilisearchを実行](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation)するか、[Meilisearch Cloud](https://cloud.meilisearch.com/)アカウントを作成することができます。

Meilisearch v1.3では、ベクトルストレージは実験的な機能です。Meilisearchインスタンスを起動したら、**ベクトルストレージを有効にする**必要があります。セルフホストのMeilisearchの場合は、[実験的機能の有効化](https://www.meilisearch.com/docs/learn/experimental/overview)に関するドキュメントを参照してください。**Meilisearch Cloud**の場合は、プロジェクトの_設定_ページで_ベクトルストア_を有効にします。

これで、ベクトルストレージが有効になったMeilisearchインスタンスが起動しました。 🎉

### 認証情報

Meilisearch SDKでMeilisearchインスタンスと対話するには、ホスト(インスタンスのURL)とAPIキーが必要です。

**ホスト**

- **ローカル**の場合、デフォルトのホストは `localhost:7700` です
- **Meilisearch Cloud**の場合、プロジェクトの_設定_ページでホストを確認できます

**APIキー**

Meilisearchインスタンスには、デフォルトで3つのAPIキーが用意されています:
- `MASTER KEY` - Meilisearchインスタンスの作成にのみ使用する
- `ADMIN KEY` - データベースと設定の更新にのみサーバー側で使用する
- `SEARCH KEY` - フロントエンドアプリケーションで安全に共有できるキー

必要に応じて[追加のAPIキーを作成](https://www.meilisearch.com/docs/learn/security/master_api_keys)することができます。

### 依存関係のインストール

このガイドでは[Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)を使用します。以下のコマンドでインストールできます:

```python
%pip install --upgrade --quiet  meilisearch
```

詳細は[Meilisearch Python SDKのドキュメント](https://meilisearch.github.io/meilisearch-python/)を参照してください。

## 例

Meilisearchベクトルストアを初期化する方法は複数あります。Meilisearchクライアントを提供するか、_URL_と_APIキー_を必要に応じて指定します。以下の例では、資格情報は環境変数から読み込みます。

`os`と`getpass`を使って、ノートブック環境で環境変数を利用可能にすることができます。以下の例すべてでこの手法を使うことができます。

```python
import getpass
import os

os.environ["MEILI_HTTP_ADDR"] = getpass.getpass("Meilisearch HTTP address and port:")
os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

OpenAIEmbeddingsを使用するため、OpenAIのAPIキーを取得する必要があります。

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### テキストとエンベディングの追加

この例では、Meilisearchベクトルストアを初期化せずにテキストをベクトルデータベースに追加します。

```python
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

内部的にMeilisearchはテキストを複数のベクトルに変換します。次の例と同じ結果になります。

### ドキュメントとエンベディングの追加

この例では、Langchain TextSplitterを使ってテキストを複数のドキュメントに分割し、それらのドキュメントとエンベディングを保存します。

```python
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## Meilisearch Vectorstoreを作成してドキュメントを追加

このアプローチでは、ベクトルストアオブジェクトを作成し、ドキュメントを追加します。

```python
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## スコア付きの類似検索

このメソッドでは、ドキュメントと検索クエリの距離スコアを返すことができます。`embedder_name`は意味検索に使用するエンベディングモデルの名前で、デフォルトは"default"です。

```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## ベクトルによる類似検索

`embedder_name`は意味検索に使用するエンベディングモデルの名前で、デフォルトは"default"です。

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## 追加リソース

ドキュメンテーション
- [Meilisearch](https://www.meilisearch.com/docs/)
- [Meilisearch Python SDK](https://python-sdk.meilisearch.com)

オープンソースリポジトリ
- [Meilisearchリポジトリ](https://github.com/meilisearch/meilisearch)
- [Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)
