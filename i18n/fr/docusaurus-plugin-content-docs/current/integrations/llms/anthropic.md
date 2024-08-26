---
sidebar_label: Anthropic
translated: true
---

# AnthropicLLM

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles `Anthropic`.

REMARQUE : AnthropicLLM ne prend en charge que les anciens modèles Claude 2. Pour utiliser les nouveaux modèles Claude 3, veuillez utiliser [`ChatAnthropic`](/docs/integrations/chat/anthropic) à la place.

## Installation

```python
%pip install -qU langchain-anthropic
```

## Configuration de l'environnement

Nous devrons obtenir une clé d'API [Anthropic](https://console.anthropic.com/settings/keys) et définir la variable d'environnement `ANTHROPIC_API_KEY` :

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## Utilisation

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
