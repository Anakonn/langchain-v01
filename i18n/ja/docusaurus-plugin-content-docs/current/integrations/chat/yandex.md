---
sidebar_label: YandexGPT
translated: true
---

# ChatYandexGPT

このノートブックでは、[YandexGPT](https://cloud.yandex.com/en/services/yandexgpt) チャットモデルを使用する方法について説明します。

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

使用するモデルは `model_uri` パラメーターで指定できます。詳細は[ドキュメント](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation)を参照してください。

デフォルトでは、パラメーター `folder_id` または環境変数 `YC_FOLDER_ID` で指定されたフォルダーから最新バージョンの `yandexgpt-lite` が使用されます。

```python
from langchain_community.chat_models import ChatYandexGPT
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat_model = ChatYandexGPT()
```

```python
answer = chat_model.invoke(
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ]
)
answer
```

```output
AIMessage(content='Je adore le programmement.')
```
