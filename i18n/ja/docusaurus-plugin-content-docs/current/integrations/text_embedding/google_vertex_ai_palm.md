---
translated: true
---

# Google Vertex AI PaLM

>[Vertex AI PaLM API](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview)は、Google Cloudで提供されるエンベディングモデルを公開するサービスです。

注意: このインテグレーションは、Google PaLM インテグレーションとは別のものです。

デフォルトでは、Google Cloudは[顧客データを使用して](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development)基盤モデルをトレーニングしません。これは、Google Cloudの AI/ML プライバシーコミットメントの一部です。Google がデータを処理する方法の詳細は、[Google の顧客データ処理付録(CDPA)](https://cloud.google.com/terms/data-processing-addendum)にも記載されています。

Vertex AI PaLMを使用するには、`langchain-google-vertexai`Pythonパッケージをインストールし、次のいずれかを行う必要があります:
- 環境の資格情報(gcloud、ワークロードアイデンティティなど)を設定する
- GOOGLE_APPLICATION_CREDENTIALS環境変数にサービスアカウントJSONファイルのパスを保存する

このコードベースでは`google.auth`ライブラリを使用しており、まず上記の資格情報変数を探し、次にシステムレベルの認証を探します。

詳細については、次のリソースを参照してください:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain langchain-google-vertexai
```

```python
from langchain_google_vertexai import VertexAIEmbeddings
```

```python
embeddings = VertexAIEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
