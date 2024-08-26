---
translated: true
---

# NLP Cloud

[NLP Cloud](https://nlpcloud.io)は、NER、感情分析、分類、要約、言い換え、文法・スペル修正、キーワードおよびキーフレーズ抽出、チャットボット、製品説明および広告生成、意図分類、テキスト生成、画像生成、ブログ投稿生成、コード生成、質問応答、自動音声認識、機械翻訳、言語検出、セマンティック検索、セマンティック類似性、トークン化、品詞タグ付け、埋め込み、依存関係解析などの高性能な事前学習モデルまたはカスタムモデルを提供しています。本番環境で使用できるRESTAPIを通じて提供されています。

この例では、LangChainを使用して`NLP Cloud`[models](https://docs.nlpcloud.com/#models)と対話する方法について説明します。

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = NLPCloud()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```
