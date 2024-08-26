---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/)は、ベクトル検索と語彙検索の両方を実行できる、分散型のRESTful検索およびアナリティクスエンジンです。Apache Luceneライブラリの上に構築されています。

このノートブックでは、`Elasticsearch`を使ってチャットメッセージ履歴の機能を使う方法を示します。

## Elasticsearchのセットアップ

Elasticsearchインスタンスを設定する主な2つの方法があります:

1. **Elastic Cloud.** Elastic Cloudは管理されたElasticsearchサービスです。[無料トライアル](https://cloud.elastic.co/registration?storm=langchain-notebook)にサインアップしてください。

2. **ローカルElasticsearchのインストール.** Elasticsearchをローカルで実行して始めましょう。最も簡単な方法は、公式のElasticsearchDockerイメージを使うことです。詳細は[Elasticsearch Dockerのドキュメント](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)を参照してください。

## 依存関係のインストール

```python
%pip install --upgrade --quiet  elasticsearch langchain
```

## 認証

### "elastic"ユーザーのパスワードを取得する方法

Elastic Cloudの"elastic"ユーザーのパスワードを取得するには:
1. [Elastic Cloudコンソール](https://cloud.elastic.co)にログインします
2. "Security" > "Users"に移動します
3. "elastic"ユーザーを見つけて"Edit"をクリックします
4. "Reset password"をクリックします
5. プロンプトに従ってパスワードをリセットします

### ユーザー名/パスワードを使用する

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### APIキーを取得する方法

APIキーを取得するには:
1. [Elastic Cloudコンソール](https://cloud.elastic.co)にログインします
2. `Kibana`を開き、Stack Management > API Keysに移動します
3. "Create API key"をクリックします
4. APIキーの名前を入力し、"Create"をクリックします

### APIキーを使用する

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```

## Elasticsearchクライアントとチャットメッセージ履歴を初期化

```python
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## チャットメッセージ履歴を使用する

```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```
