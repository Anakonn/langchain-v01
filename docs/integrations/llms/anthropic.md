---
canonical: https://python.langchain.com/v0.1/docs/integrations/llms/anthropic
sidebar_label: Anthropic
translated: false
---

# AnthropicLLM

This example goes over how to use LangChain to interact with `Anthropic` models.

NOTE: AnthropicLLM only supports legacy Claude 2 models. To use the newest Claude 3 models, please use [`ChatAnthropic`](/docs/integrations/chat/anthropic) instead.

## Installation

```python
%pip install -qU langchain-anthropic
```

## Environment Setup

We'll need to get an [Anthropic](https://console.anthropic.com/settings/keys) API key and set the `ANTHROPIC_API_KEY` environment variable:

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## Usage

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