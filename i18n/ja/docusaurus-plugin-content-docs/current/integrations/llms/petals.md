---
translated: true
---

# 花びら

`Petals`は、BitTorrentスタイルで自宅で100B+の言語モデルを実行します。

このノートブックでは、[Petals](https://github.com/bigscience-workshop/petals)を使ってLangChainの使用方法を説明します。

## Petalsのインストール

Petals APIを使用するには、`petals`パッケージが必要です。`pip3 install petals`を使用して`petals`をインストールします。

Apple Silicon(M1/M2)ユーザーは、[https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642](https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642)のガイドに従ってpetalsをインストールしてください。

```python
!pip3 install petals
```

## インポート

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import Petals
from langchain_core.prompts import PromptTemplate
```

## 環境API キーの設定

Hugging Faceから[APIキー](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)を取得してください。

```python
from getpass import getpass

HUGGINGFACE_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
```

## Petalsインスタンスの作成

モデル名、最大新しいトークン、温度などのさまざまなパラメーターを指定できます。

```python
# this can take several minutes to download big files!

llm = Petals(model_name="bigscience/bloom-petals")
```

```output
Downloading:   1%|▏                        | 40.8M/7.19G [00:24<15:44, 7.57MB/s]
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
