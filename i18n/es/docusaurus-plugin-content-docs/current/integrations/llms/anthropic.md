---
sidebar_label: Anthropic
translated: true
---

# AnthropicLLM

Este ejemplo explica cómo usar LangChain para interactuar con los modelos `Anthropic`.

NOTA: AnthropicLLM solo admite modelos heredados de Claude 2. Para usar los modelos más nuevos de Claude 3, utilice [`ChatAnthropic`](/docs/integrations/chat/anthropic) en su lugar.

## Instalación

```python
%pip install -qU langchain-anthropic
```

## Configuración del entorno

Necesitaremos obtener una clave de API [Anthropic](https://console.anthropic.com/settings/keys) y establecer la variable de entorno `ANTHROPIC_API_KEY`:

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## Uso

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
