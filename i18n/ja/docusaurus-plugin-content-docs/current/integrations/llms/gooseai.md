---
translated: true
---

# GooseAI

`GooseAI` は、APIを介して提供される完全に管理されたNLP-as-a-Serviceです。GooseAIでは、[これらのモデル](https://goose.ai/docs/models)にアクセスできます。

このノートブックでは、[GooseAI](https://goose.ai/)とLangchainの使用方法について説明します。

## openaiのインストール

GooseAIのAPIを使用するには、`openai`パッケージが必要です。`pip install openai`を使用して`openai`をインストールします。

```python
%pip install --upgrade --quiet  langchain-openai
```

## インポート

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## 環境API Keyの設定

GooseAIからAPIキーを取得してください。さまざまなモデルをテストするために、$10の無料クレジットが付与されます。

```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```

```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## GooseAIインスタンスの作成

モデル名、生成される最大トークン数、温度などのさまざまなパラメーターを指定できます。

```python
llm = GooseAI()
```

## プロンプトテンプレートの作成

質問と回答用のプロンプトテンプレートを作成します。

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChainの初期化

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChainの実行

質問を入力し、LLMChainを実行します。

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
