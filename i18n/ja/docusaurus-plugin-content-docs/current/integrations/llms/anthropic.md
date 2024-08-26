---
sidebar_label: Anthropic
translated: true
---

# AnthropicLLM

この例では、LangChainを使用して`Anthropic`モデルとやり取りする方法について説明します。

注意: AnthropicLLMは従来のClaude 2モデルのみをサポートしています。最新のClaude 3モデルを使用する場合は、代わりに[`ChatAnthropic`](/docs/integrations/chat/anthropic)を使用してください。

## インストール

```python
%pip install -qU langchain-anthropic
```

## 環境設定

[Anthropic](https://console.anthropic.com/settings/keys) APIキーを取得し、`ANTHROPIC_API_KEY`環境変数を設定する必要があります:

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## 使用方法

```python
from langchain_anthropic import AnthropicLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

model = AnthropicLLM(model="claude-2.1")

chain = prompt | model

chain.invoke({"question": "What is LangChain?"})
```

```output
'\nLangChain is a decentralized blockchain network that leverages AI and machine learning to provide language translation services.'
```
