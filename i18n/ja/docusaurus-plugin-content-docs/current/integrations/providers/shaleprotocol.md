---
translated: true
---

# Shale プロトコル

[Shale プロトコル](https://shaleprotocol.com)は、オープンLLMのための本番用の推論APIを提供しています。高性能なGPUクラウドインフラストラクチャーにホストされているため、プラグアンドプレイのAPIです。

無料のティアでは、1日あたり最大1,000リクエストまでサポートしており、LLMを使ったgenAIアプリの構築を誰でも始められるようにしています。

Shale プロトコルを使えば、開発者や研究者はコストをかけずにオープンLLMの機能を活用したアプリを作成できます。

このページでは、Shale-Serve APIをLangChainに組み込む方法を説明します。

2023年6月現在、APIはデフォルトでVicuna-13Bをサポートしています。今後、Falcon-40Bなどの他のLLMもサポートする予定です。

## 使い方

### 1. https://shaleprotocol.comでDiscordのリンクを見つけ、Discordの"Shale Bot"からAPIキーを生成してください。クレジットカードは不要で、無料トライアルもありません。1日あたり1,000リクエストまでの永久無料のティアです。

### 2. https://shale.live/v1をOpenAI APIのドロップイン置換として使用してください

例えば

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```
