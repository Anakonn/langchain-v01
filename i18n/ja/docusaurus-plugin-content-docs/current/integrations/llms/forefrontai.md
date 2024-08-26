---
translated: true
---

# ForefrontAI

`Forefront`プラットフォームを使うと、[オープンソースの大規模言語モデル](https://docs.forefront.ai/forefront/master/models)を微調整して使うことができます。

このノートブックでは、[ForefrontAI](https://www.forefront.ai/)を使う方法について説明します。

## インポート

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import ForefrontAI
from langchain_core.prompts import PromptTemplate
```

## 環境API キーの設定

ForefrontAIからAPIキーを取得してください。5日間の無料トライアルがあり、さまざまなモデルをテストできます。

```python
# get a new token: https://docs.forefront.ai/forefront/api-reference/authentication

from getpass import getpass

FOREFRONTAI_API_KEY = getpass()
```

```python
os.environ["FOREFRONTAI_API_KEY"] = FOREFRONTAI_API_KEY
```

## ForefrontAIインスタンスの作成

モデルのエンドポイントURL、長さ、温度などのさまざまなパラメーターを指定できます。エンドポイントURLを指定する必要があります。

```python
llm = ForefrontAI(endpoint_url="YOUR ENDPOINT URL HERE")
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

質問を入力してLLMChainを実行します。

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
