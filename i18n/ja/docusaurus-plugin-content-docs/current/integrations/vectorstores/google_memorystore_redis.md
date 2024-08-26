---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)は、Redis インメモリデータストアを活用して、サブミリ秒のデータアクセスを提供するアプリケーションキャッシュを構築するための完全管理型サービスです。Memorystore for Redisの Langchain統合を活用して、データベースアプリケーションを拡張し、AI駆動のエクスペリエンスを構築できます。

このノートブックでは、[Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)を使用してベクトル埋め込みを保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## 前提条件

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloud Projectの作成](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redisインスタンスの作成](https://cloud.google.com/memorystore/docs/redis/create-instance-console)。バージョンが7.2以上であることを確認してください。

### 🦜🔗 ライブラリのインストール

統合は `langchain-google-memorystore-redis` パッケージに含まれているため、これをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
```

**Colab のみ:** 次のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ[プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

* Colabでこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### ベクトルインデックスの初期化

```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### ドキュメントの準備

テキストを処理し、ベクトルストアと対話するための数値表現を生成する必要があります。これには以下の作業が含まれます:

* テキストの読み込み: TextLoaderを使用して、ファイル(例: "state_of_the_union.txt")からテキストデータを取得します。
* テキストの分割: CharacterTextSplitterを使用して、テキストを小さな塊に分割します。

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### ドキュメントをベクトルストアに追加

テキストの準備と埋め込み生成が完了したら、以下のメソッドを使用してRedisベクトルストアにデータを挿入します。

#### メソッド1: 直接挿入用のクラスメソッド

このアプローチでは、埋め込み作成と挿入を単一のステップで行うことができます。from_documentsクラスメソッドを使用します:

```python
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### メソッド2: インスタンスベースの挿入

このアプローチでは、新しいまたは既存のRedisVectorStoreで柔軟に作業できます:

* [オプション] RedisVectorStoreインスタンスの作成: カスタマイズ用にRedisVectorStoreオブジェクトをインスタンス化します。既にインスタンスがある場合は、次のステップに進んでください。
* メタデータ付きのテキストの追加: 生のテキストとメタデータを提供します。埋め込み生成とベクトルストアへの挿入は自動的に処理されます。

```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### 類似性検索(KNN)の実行

ベクトルストアにデータが格納されたら、クエリに意味的に類似したテキストを検索できます。デフォルト設定でKNN(K-Nearest Neighbors)を使用する方法は以下のとおりです:

* クエリの作成: 自然言語の質問で検索意図を表現します(例: "大統領はKetanji Brown Jacksonについてどのようなことを言いましたか")。
* 類似結果の取得: `similarity_search`メソッドを使用して、ベクトルストア内の意味的に最も近い項目を見つけます。

```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### 範囲ベースの類似性検索の実行

範囲クエリを使用すると、クエリテキストと共に類似性のしきい値を指定できるため、より細かな制御が可能です:

* クエリの作成: 自然言語の質問で検索意図を定義します。
* 類似性しきい値の設定: `distance_threshold`パラメーターで、関連性とみなされる最小の類似性を指定します。
* 結果の取得: `similarity_search_with_score`メソッドを使用して、指定された類似性しきい値内の項目をベクトルストアから見つけます。

```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### 最大限の限界関連性(MMR)検索の実行

MMRクエリは、クエリに関連性が高く、互いに多様な結果を見つけることを目的としています。これにより、検索結果の冗長性が低減されます。

* クエリの作成: 自然言語の質問で検索意図を定義します。
* 関連性と多様性のバランス: `lambda_mult`パラメーターで、厳密な関連性と結果の多様性のトレードオフを制御します。
* MMR結果の取得: `max_marginal_relevance_search`メソッドを使用して、lambda設定に基づいて関連性と多様性の最適な組み合わせの項目を返します。

```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## ベクトルストアをRetrieverとして使用する

LangChainの他のコンポーネントとの滑らかな統合を実現するため、ベクトルストアをRetrieverに変換できます。これにより以下のようなメリットがあります:

* LangChain互換性: 多くのLangChainツールおよびメソッドは、retrieversと直接対話するように設計されています。
* 使いやすさ: `as_retriever()`メソッドを使用して、ベクトルストアをクエリしやすい形式に変換できます。

```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## クリーンアップ

### ベクトルストアからドキュメントを削除する

時折、ベクトルストアからドキュメント(およびそれに関連するベクトル)を削除する必要があります。`delete`メソッドを使用してこの機能を提供します。

```python
rvs.delete(ids)
```

---
title: ベクトルインデックスの削除
---

### ベクトルインデックスの削除

既存のベクトルインデックスを削除する必要がある状況がある可能性があります。一般的な理由は以下の通りです:

* インデックス設定の変更: インデックスパラメーターを変更する必要がある場合、インデックスを削除して再作成する必要がある場合がある。
* ストレージ管理: 使用されていないインデックスを削除することで、Redis インスタンス内のスペースを解放できる。

注意: ベクトルインデックスの削除は取り消し不可能な操作です。ストアされているベクトルと検索機能がもはや必要ない場合にのみ、この操作を行ってください。

```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```
