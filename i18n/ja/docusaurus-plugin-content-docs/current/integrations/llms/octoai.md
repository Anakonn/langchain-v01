---
translated: true
---

# OctoAI

[OctoAI](https://docs.octoai.cloud/docs)は、効率的なコンピューティングへの簡単なアクセスを提供し、ユーザーが選択したAIモデルをアプリケーションに統合できるようにします。 `OctoAI`コンピューティングサービスは、AIアプリケーションを簡単に実行、調整、スケーリングできるようにします。

この例では、LangChainを使用して`OctoAI` [LLMエンドポイント](https://octoai.cloud/templates)と対話する方法について説明します。

## セットアップ

サンプルアプリを実行するには、2つの簡単な手順を実行する必要があります:

1. [OctoAIアカウントページ](https://octoai.cloud/settings)からAPIトークンを取得します。

2. 以下のコードセルにAPIキーを貼り付けます。

注意: 別のLLMモデルを使用する場合は、[Pythonからコンテナーを構築](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python)し、[コンテナーからカスタムエンドポイントを作成](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container)してから、`OCTOAI_API_BASE`環境変数を更新できます。

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## 例

```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```

```python
llm = OctoAIEndpoint(
    model="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```

```python
question = "Who was Leonardo da Vinci?"

llm_chain = LLMChain(prompt=prompt, llm=llm)

print(llm_chain.run(question))
```

レオナルド・ダ・ヴィンチは真の Renaissance man でした。 1452年にイタリアのヴィンチで生まれ、芸術、科学、工学、数学など、さまざまな分野で知られています。 彼は史上最も偉大な画家の1人と考えられており、モナ・リザやラスト・サパーなどの最も有名な作品を残しています。 彼の芸術以外にも、工学や解剖学に大きな貢献をし、彼の機械や発明の設計は時代を先取りしていました。 また、彼の膨大な日記と図面は、彼の考えと考えを理解する上で貴重な洞察を提供しています。 ダ・ヴィンチの遺産は、今日世界中のアーティスト、科学者、思想家に影響を与え続けています。
