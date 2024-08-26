---
translated: true
---

# Google Vertex AI Search

>[Google Vertex AI Search](https://cloud.google.com/enterprise-search) (旧称 `Enterprise Search` on `Generative AI App Builder`) は、`Google Cloud` が提供する [Vertex AI](https://cloud.google.com/vertex-ai) マシンラーニングプラットフォームの一部です。

>`Vertex AI Search` により、組織は顧客や従業員向けの生成型AI搭載の検索エンジンを迅速に構築できます。これは、semantic search など、さまざまな `Google Search` テクノロジーに基づいています。semantic searchは、自然言語処理とマシンラーニングの手法を使ってコンテンツ内の関係性とユーザーのクエリ意図を推測することで、従来のキーワード検索よりも関連性の高い結果を提供します。Vertex AI Searchは、ユーザーの検索行動の理解と、コンテンツの関連性を考慮した結果の表示にも恩恵を受けています。

>`Vertex AI Search` は `Google Cloud Console` や API を通じて企業ワークフローに統合できます。

このノートブックでは、`Vertex AI Search` の設定と、Vertex AI Search retrieverの使用方法を説明します。Vertex AI Search retrieverは[Python クライアントライブラリ](https://cloud.google.com/generative-ai-app-builder/docs/libraries#client-libraries-install-python)をカプセル化し、[Search Service API](https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.services.search_service)にアクセスします。

## 前提条件のインストール

Vertex AI Search retrieverを使用するには、`google-cloud-discoveryengine`パッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet google-cloud-discoveryengine
```

## Google CloudとVertex AI Searchへのアクセスを設定する

Vertex AI Searchは2023年8月時点で一般提供されており、ホワイトリストは不要です。

retrieverを使用するには、以下の手順を完了する必要があります:

### 検索エンジンの作成と非構造化データストアの入力

- [Vertex AI Search 入門ガイド](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search)の手順に従って、Google CloudプロジェクトとVertex AI Searchを設定します。
- [Google Cloud Consoleを使用して非構造化データストアを作成](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es#unstructured-data)
  - `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs` Cloud Storageフォルダからの例PDFドキュメントで入力します。
  - `Cloud Storage (without metadata)` オプションを使用してください。

### Vertex AI Search APIへのアクセス資格情報の設定

Vertex AI Search retrieverが使用する[Vertex AI Search クライアントライブラリ](https://cloud.google.com/generative-ai-app-builder/docs/libraries)は、Google Cloudへの認証を行うための高水準な言語サポートを提供しています。
クライアントライブラリは[Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)をサポートしており、ライブラリは定義された場所で資格情報を検索し、それらの資格情報を使用してAPIへの要求を認証します。
ADCを使用すると、アプリケーションコードを変更することなく、ローカル開発や本番環境など、さまざまな環境で資格情報を利用可能にできます。

[Google Colab](https://colab.google)で実行する場合は`google.colab.google.auth`で認証し、それ以外の場合は[サポートされている方法](https://cloud.google.com/docs/authentication/application-default-credentials)の1つに従って、Application Default Credentialsが適切に設定されていることを確認してください。

```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth as google_auth

    google_auth.authenticate_user()
```

## Vertex AI Search retrieverの設定と使用

Vertex AI Search retrieverは`langchain.retriever.GoogleVertexAISearchRetriever`クラスで実装されています。`get_relevant_documents`メソッドは、`langchain.schema.Document`ドキュメントのリストを返します。各ドキュメントの`page_content`フィールドにはドキュメントのコンテンツが入っています。
Vertex AI Searchで使用するデータタイプ(ウェブサイト、構造化、または非構造化)に応じて、`page_content`フィールドは以下のように入力されます:

- 高度なインデックス付きウェブサイト: クエリに一致する`extractive answer`。`metadata`フィールドには、抽出されたセグメントや回答が含まれるドキュメントのメタデータ(あれば)が入っています。
- 非構造化データソース: クエリに一致する`extractive segment`または`extractive answer`。`metadata`フィールドには、抽出されたセグメントや回答が含まれるドキュメントのメタデータ(あれば)が入っています。
- 構造化データソース: 構造化データソースから返された全フィールドを含むJSON文字列。`metadata`フィールドには、ドキュメントのメタデータ(あれば)が入っています。

### Extractive answersとextractive segments

Extractive answerは、各検索結果に含まれる元のドキュメントから直接抽出された文字列です。Extractive answersは、ユーザーのクエリに関連性の高い簡潔な回答を提供するために、ウェブページの上部に表示されることが一般的です。Extractive answersは、ウェブサイトと非構造化検索で利用できます。

Extractive segmentは、各検索結果に含まれる元のドキュメントから直接抽出された、より詳細な文字列です。Extractive segmentsは、クエリの回答として表示したり、後処理タスクの入力や大規模言語モデルへの入力として使用したりできます。Extractive segmentsは非構造化検索で利用できます。

Extractive segmentsとextractive answersの詳細については、[製品ドキュメント](https://cloud.google.com/generative-ai-app-builder/docs/snippets)を参照してください。

注意: Extractive segmentsには[Enterprise edition](https://cloud.google.com/generative-ai-app-builder/docs/about-advanced-features#enterprise-features)の機能が必要です。

retrieverのインスタンスを作成する際は、アクセスするデータストアや自然言語クエリの処理方法を制御するためのパラメーターを指定できます。これにはextractive answersとextractive segmentsの設定も含まれます。

### 必須パラメーターは以下のとおりです:

- `project_id` - Google Cloud プロジェクト ID。
- `location_id` - データストアの場所。
  - `global` (デフォルト)
  - `us`
  - `eu`

以下のいずれか:
- `search_engine_id` - 使用するサーチアプリの ID。(Blended Search の場合は必須)
- `data_store_id` - 使用するデータストアの ID。

`project_id`、`search_engine_id`、`data_store_id` パラメーターは、リトリーバーのコンストラクターで明示的に指定するか、環境変数 `PROJECT_ID`、`SEARCH_ENGINE_ID`、`DATA_STORE_ID` から取得できます。

オプションのパラメーターも設定できます:

- `max_documents` - 抽出的なセグメントや抽出的な回答を提供するために使用される最大のドキュメント数
- `get_extractive_answers` - デフォルトでは、リトリーバーは抽出的なセグメントを返すように構成されています。
  - この項目を `True` に設定すると、抽出的な回答が返されます。これは `engine_data_type` が `0` (非構造化) の場合にのみ使用されます。
- `max_extractive_answer_count` - 各検索結果で返される抽出的な回答の最大数。
  - 最大 5 つの回答が返されます。これは `engine_data_type` が `0` (非構造化) の場合にのみ使用されます。
- `max_extractive_segment_count` - 各検索結果で返される抽出的なセグメントの最大数。
  - 現在は 1 つのセグメントが返されます。これは `engine_data_type` が `0` (非構造化) の場合にのみ使用されます。
- `filter` - データストア内のドキュメントに関連付けられたメタデータに基づいた検索結果のフィルター式。
- `query_expansion_condition` - クエリ拡張を行うかどうかを決定する仕様。
  - `0` - 指定されていないクエリ拡張条件。この場合、サーバーの動作はデフォルトで無効になります。
  - `1` - クエリ拡張を無効にする。検索クエリそのものが使用されます。
  - `2` - Search API によって構築された自動クエリ拡張。
- `engine_data_type` - Vertex AI Search のデータ型を定義します。
  - `0` - 非構造化データ
  - `1` - 構造化データ
  - `2` - Webサイトデータ
  - `3` - [Blended search](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es#multi-data-stores)

### `GoogleCloudEnterpriseSearchRetriever` の移行ガイド

以前のバージョンでは、このリトリーバーは `GoogleCloudEnterpriseSearchRetriever` と呼ばれていました。

新しいリトリーバーに更新するには、以下の変更を行います:

- インポートを `from langchain.retrievers import GoogleCloudEnterpriseSearchRetriever` から `from langchain.retrievers import GoogleVertexAISearchRetriever` に変更します。
- すべてのクラス参照を `GoogleCloudEnterpriseSearchRetriever` から `GoogleVertexAISearchRetriever` に変更します。

### **非構造化**データの抽出的なセグメントを使用するリトリーバーの設定と使用

```python
from langchain_community.retrievers import (
    GoogleVertexAIMultiTurnSearchRetriever,
    GoogleVertexAISearchRetriever,
)

PROJECT_ID = "<YOUR PROJECT ID>"  # Set to your Project ID
LOCATION_ID = "<YOUR LOCATION>"  # Set to your data store location
SEARCH_ENGINE_ID = "<YOUR SEARCH APP ID>"  # Set to your search app ID
DATA_STORE_ID = "<YOUR DATA STORE ID>"  # Set to your data store ID
```

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
)
```

```python
query = "What are Alphabet's Other Bets?"

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **非構造化**データの抽出的な回答を使用するリトリーバーの設定と使用

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **構造化**データを使用するリトリーバーの設定と使用

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    engine_data_type=1,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **Webサイト**データの高度なWebサイトインデックスを使用するリトリーバーの設定と使用

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
    engine_data_type=2,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **Blended**データを使用するリトリーバーの設定と使用

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    search_engine_id=SEARCH_ENGINE_ID,
    max_documents=3,
    engine_data_type=3,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### マルチターン検索を使用するリトリーバーの設定と使用

[フォローアップ検索](https://cloud.google.com/generative-ai-app-builder/docs/multi-turn-search)は、ジェネレーティブな AI モデルに基づいており、通常の非構造化データ検索とは異なります。

```python
retriever = GoogleVertexAIMultiTurnSearchRetriever(
    project_id=PROJECT_ID, location_id=LOCATION_ID, data_store_id=DATA_STORE_ID
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```
