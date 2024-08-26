---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain)は、さまざまな[LLM](https://deepinfra.com/models?utm_source=langchain)と[埋め込みモデル](https://deepinfra.com/models?type=embeddings&utm_source=langchain)にアクセスできるサーバーレスのインファレンスサービスです。このノートブックでは、LangChainを使ってDeepInfraの言語モデルを使う方法を説明します。

## 環境API キーの設定

DeepInfraからAPIキーを取得してください。[ログイン](https://deepinfra.com/login?from=%2Fdash)して新しいトークンを取得する必要があります。

1時間分のサーバーレスGPUコンピューティングを無料で試用できます。([こちら](https://github.com/deepinfra/deepctl#deepctl))を参照)
`deepctl auth token`でトークンを表示できます。

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## DeepInfraインスタンスの作成

オープンソースの[deepctlツール](https://github.com/deepinfra/deepctl#deepctl)を使ってモデルのデプロイを管理することもできます。利用可能なパラメーターの一覧は[こちら](https://deepinfra.com/databricks/dolly-v2-12b#API)にあります。

```python
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```

```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```

```output
'This is a question that has puzzled many people'
```

```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```

```output
 Will
 Smith
.
```

## プロンプトテンプレートの作成

質問と回答用のプロンプトテンプレートを作成します。

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChainの初期化

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChainの実行

質問を入力してLLMChainを実行します。

```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```

```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```
