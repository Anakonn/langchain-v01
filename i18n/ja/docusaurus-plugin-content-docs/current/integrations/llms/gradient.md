---
translated: true
---

# グラデーション

`グラデーション`は、シンプルなWebAPIを使ってLLMsの微調整と完成を行うことができます。

このノートブックでは、[Gradient](https://gradient.ai/)を使ったLangChainの使用方法について説明します。

## インポート

```python
from langchain.chains import LLMChain
from langchain_community.llms import GradientLLM
from langchain_core.prompts import PromptTemplate
```

## 環境API キーの設定

Gradient AIからAPIキーを取得してください。テストや微調整に使える$10の無料クレジットが付与されます。

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

オプション: `gradientai`Pythonパッケージを使って、環境変数`GRADIENT_ACCESS_TOKEN`と`GRADIENT_WORKSPACE_ID`を検証し、現在展開されているモデルを取得します。

```python
%pip install --upgrade --quiet  gradientai
```

```output
Requirement already satisfied: gradientai in /home/michi/.venv/lib/python3.10/site-packages (1.0.0)
Requirement already satisfied: aenum>=3.1.11 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (3.1.15)
Requirement already satisfied: pydantic<2.0.0,>=1.10.5 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.10.12)
Requirement already satisfied: python-dateutil>=2.8.2 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (2.8.2)
Requirement already satisfied: urllib3>=1.25.3 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.26.16)
Requirement already satisfied: typing-extensions>=4.2.0 in /home/michi/.venv/lib/python3.10/site-packages (from pydantic<2.0.0,>=1.10.5->gradientai) (4.5.0)
Requirement already satisfied: six>=1.5 in /home/michi/.venv/lib/python3.10/site-packages (from python-dateutil>=2.8.2->gradientai) (1.16.0)
```

```python
import gradientai

client = gradientai.Gradient()

models = client.list_models(only_base=True)
for model in models:
    print(model.id)
```

```output
99148c6d-c2a0-4fbe-a4a7-e7c05bdb8a09_base_ml_model
f0b97d96-51a8-4040-8b22-7940ee1fa24e_base_ml_model
cc2dafce-9e6e-4a23-a918-cad6ba89e42e_base_ml_model
```

```python
new_model = models[-1].create_model_adapter(name="my_model_adapter")
new_model.id, new_model.name
```

```output
('674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter', 'my_model_adapter')
```

## Gradientインスタンスの作成

モデル、max_tokens生成、温度などのパラメータを指定できます。

後で微調整を行いたいので、`674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter`というIDのmodel_adapterを選択しますが、任意のベースまたは微調整可能なモデルを使用できます。

```python
llm = GradientLLM(
    # `ID` listed in `$ gradient model list`
    model="674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter",
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
    model_kwargs=dict(max_generated_token_count=128),
)
```

## プロンプトテンプレートの作成

質問と回答用のプロンプトテンプレートを作成します。

```python
template = """Question: {question}

Answer: """

prompt = PromptTemplate.from_template(template)
```

## LLMChainの初期化

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChainの実行

質問を入力してLLMChainを実行します。

```python
question = "What NFL team won the Super Bowl in 1994?"

llm_chain.run(question=question)
```

```output
'\nThe San Francisco 49ers won the Super Bowl in 1994.'
```

# 微調整による結果の改善(オプション)

これは間違っています - サンフランシスコ49ersは勝っていません。
正しい答えは`ダラス・カウボーイズ!`です。

プロンプトテンプレートを使って正しい答えで微調整を行い、正解の確率を上げましょう。

```python
dataset = [
    {
        "inputs": template.format(question="What NFL team won the Super Bowl in 1994?")
        + " The Dallas Cowboys!"
    }
]
dataset
```

```output
[{'inputs': 'Question: What NFL team won the Super Bowl in 1994?\n\nAnswer:  The Dallas Cowboys!'}]
```

```python
new_model.fine_tune(samples=dataset)
```

```output
FineTuneResponse(number_of_trainable_tokens=27, sum_loss=78.17996)
```

```python
# we can keep the llm_chain, as the registered model just got refreshed on the gradient.ai servers.
llm_chain.run(question=question)
```

```output
'The Dallas Cowboys'
```
