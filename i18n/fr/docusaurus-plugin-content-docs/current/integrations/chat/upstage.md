---
sidebar_label: Upstage
translated: true
---

# ChatUpstage

Ce cahier couvre comment se lancer avec les modèles de chat Upstage.

## Installation

Installez le package `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuration de l'environnement

Assurez-vous de définir les variables d'environnement suivantes :

- `UPSTAGE_API_KEY` : Votre clé API Upstage depuis [la console Upstage](https://console.upstage.ai/).

## Utilisation

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
```

```python
# using chat invoke
chat.invoke("Hello, how are you?")
```

```python
# using chat stream
for m in chat.stream("Hello, how are you?"):
    print(m)
```

## Enchaînement

```python
# using chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant that translates English to French."),
        ("human", "Translate this sentence from English to French. {english_text}."),
    ]
)
chain = prompt | chat

chain.invoke({"english_text": "Hello, how are you?"})
```
