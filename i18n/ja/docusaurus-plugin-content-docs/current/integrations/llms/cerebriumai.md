---
translated: true
---

# CerebriumAI

`Cerebrium` は AWS Sagemaker の代替品です。 [いくつかのLLMモデル](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment)へのAPIアクセスも提供しています。

このノートブックでは、[CerebriumAI](https://docs.cerebrium.ai/introduction)を使用する方法について説明します。

## Cerebrium のインストール

`cerebrium`パッケージを使用して`CerebriumAI` APIを使用する必要があります。 `pip3 install cerebrium`を使用して`cerebrium`をインストールします。

```python
# Install the package
!pip3 install cerebrium
```

## インポート

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## 環境 API キーの設定

CerebriumAI から API キーを取得してください。 [こちら](https://dashboard.cerebrium.ai/login)を参照してください。 サーバーレスのGPUコンピューティングを1時間無料で試すことができます。

```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## CerebriumAI インスタンスの作成

モデルのエンドポイントURL、最大長、温度などのさまざまなパラメーターを指定できます。エンドポイントURLを指定する必要があります。

```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
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
