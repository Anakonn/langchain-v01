---
translated: true
---

# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs)は、効率的なコンピューティングへの簡単なアクセスを提供し、ユーザーが独自のAIモデルをアプリケーションに統合できるようにします。 `OctoAI`コンピューティングサービスは、AIアプリケーションを簡単に実行、調整、スケーリングできるようにします。

このノートブックでは、[OctoAIエンドポイント](https://octoai.cloud/text)に対する`langchain.chat_models.ChatOctoAI`の使用を示します。

## セットアップ

サンプルアプリを実行するには、2つの簡単な手順を踏む必要があります:

1. [OctoAIアカウントページ](https://octoai.cloud/settings)から APIトークンを取得します。

2. APIトークンをコードセルに貼り付けるか、`octoai_api_token`キーワード引数を使用します。

注意: [利用可能なモデル](https://octoai.cloud/text?selectedTags=Chat)以外のモデルを使用したい場合は、モデルをコンテナ化し、[Pythonからコンテナを構築する](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python)および[コンテナからカスタムエンドポイントを作成する](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container)の手順に従ってカスタムOctoAIエンドポイントを作成し、`OCTOAI_API_BASE`環境変数を更新することができます。

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## 例

```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

レオナルド・ダ・ヴィンチ(1452-1519)は、しばしば歴史上最も偉大な画家の1人と考えられているイタリアの博学者でした。しかし、彼の天才は芸術を遥かに超えていました。彼はまた、科学者、発明家、数学者、技術者、解剖学者、地質学者、地図作成者でもありました。

ダ・ヴィンチは、モナ・リザ、最後の晩餐、岩のマドンナなどの絵画で最も有名です。彼の科学的研究は時代を先取りしており、ノートブックには様々な機械、人体解剖、自然現象の詳細な図面と説明が含まれています。

正式な教育を受けたことがないにもかかわらず、ダ・ヴィンチの飽くなき好奇心と観察力により、彼は多くの分野の先駆者となりました。彼の業績は今日でも芸術家、科学者、思想家に影響を与え続けています。
