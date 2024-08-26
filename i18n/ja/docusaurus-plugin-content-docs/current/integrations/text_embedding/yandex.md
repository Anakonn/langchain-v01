---
translated: true
---

# YandexGPT

このノートブックでは、[YandexGPT](https://cloud.yandex.com/en/services/yandexgpt) 埋め込みモデルを使用する方法について説明します。

使用するには、`yandexcloud` Pythonパッケージがインストールされている必要があります。

```python
%pip install --upgrade --quiet  yandexcloud
```

まず、`ai.languageModels.user`ロールを持つ[サービスアカウントを作成](https://cloud.yandex.com/en/docs/iam/operations/sa/create)する必要があります。

次に、2つの認証オプションがあります:
- [IAMトークン](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)
    コンストラクターパラメーター `iam_token` または環境変数 `YC_IAM_TOKEN` でトークンを指定できます。
- [APIキー](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    コンストラクターパラメーター `api_key` または環境変数 `YC_API_KEY` でキーを指定できます。

使用するモデルは `model_uri` パラメーターで指定できます。詳細は[ドキュメント](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-embeddings)を参照してください。

デフォルトでは、`folder_id` パラメーターまたは `YC_FOLDER_ID` 環境変数で指定されたフォルダーから最新バージョンの `text-search-query` が使用されます。

```python
from langchain_community.embeddings.yandex import YandexGPTEmbeddings
```

```python
embeddings = YandexGPTEmbeddings()
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

```python
query_result[:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```

```python
doc_result[0][:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```
