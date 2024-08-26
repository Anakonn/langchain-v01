---
translated: true
---

# Google BigQuery ベクトル検索

> [Google Cloud BigQuery ベクトル検索](https://cloud.google.com/bigquery/docs/vector-search-intro)を使うと、GoogleSQLを使って意味検索ができます。ベクトルインデックスを使えば高速な近似検索ができ、ブルートフォースを使えば正確な検索ができます。

このチュートリアルでは、LangChainのエンドツーエンドのデータとエンベディング管理システムを使い、BigQueryでスケーラブルな意味検索を行う方法を説明します。

## はじめに

### ライブラリのインストール

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**Colab のみ:** 次のセルのコメントを外してカーネルを再起動するか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## 始める前に

#### プロジェクトIDの設定

プロジェクトIDがわからない場合は、次のようにしてください:
* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)のサポートページを参照する。

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### リージョンの設定

BigQueryの`REGION`変数を変更することもできます。[BigQueryのリージョン](https://cloud.google.com/bigquery/docs/locations#supported_locations)について詳しく学びましょう。

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### データセットとテーブル名の設定

これらがBigQueryベクトルストアになります。

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### ノート環境の認証

- **Colab**でこのノートブックを実行する場合は、以下のセルのコメントを外して続行してください。
- **Vertex AI Workbench**を使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## デモ: BigQueryVectorSearch

### エンベディングクラスのインスタンスを作成する

プロジェクトでVertex AI APIを有効にする必要がある場合は、
`gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}`
(プロジェクト名を`{PROJECT_ID}`に置き換えてください)を実行してください。

[LangChainのエンベディングモデル](/docs/integrations/text_embedding/)を使うことができます。

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### BigQueryデータセットを作成する

データセットが存在しない場合のオプションのステップです。

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### 既存のBigQueryデータセットでBigQueryVectorSearchベクトルストアを初期化する

```python
from langchain.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import BigQueryVectorSearch

store = BigQueryVectorSearch(
    project_id=PROJECT_ID,
    dataset_name=DATASET,
    table_name=TABLE,
    location=REGION,
    embedding=embedding,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### テキストを追加する

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### ドキュメントを検索する

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### ベクトルによるドキュメントの検索

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### メタデータフィルターによるドキュメントの検索

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### BigQueryジョブIDでジョブ統計を探索する

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```
