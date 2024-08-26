---
sidebar_label: Anthropic
translated: true
---

# AnthropicLLM

이 예제에서는 `Anthropic` 모델과 상호 작용하는 방법을 LangChain을 사용하여 설명합니다.

참고: AnthropicLLM은 레거시 Claude 2 모델만 지원합니다. 최신 Claude 3 모델을 사용하려면 [`ChatAnthropic`](/docs/integrations/chat/anthropic)을 사용하세요.

## 설치

```python
%pip install -qU langchain-anthropic
```

## 환경 설정

[Anthropic](https://console.anthropic.com/settings/keys)에서 API 키를 얻고 `ANTHROPIC_API_KEY` 환경 변수를 설정해야 합니다:

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## 사용법

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
