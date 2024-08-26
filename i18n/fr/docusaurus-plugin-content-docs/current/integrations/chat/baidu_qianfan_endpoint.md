---
sidebar_label: Baidu Qianfan
translated: true
---

# QianfanChatEndpoint

La plateforme Baidu AI Cloud Qianfan est une plateforme de développement et d'exploitation de modèles de grande taille tout-en-un pour les développeurs d'entreprise. Qianfan fournit non seulement le modèle Wenxin Yiyan (ERNIE-Bot) et les modèles open-source tiers, mais aussi divers outils de développement IA et l'ensemble de l'environnement de développement, ce qui facilite l'utilisation et le développement d'applications de modèles de grande taille pour les clients.

Fondamentalement, ces modèles sont répartis dans les types suivants :

- Embedding
- Chat
- Completion

Dans ce notebook, nous présenterons comment utiliser langchain avec [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html) principalement dans `Chat` correspondant
 au package `langchain/chat_models` dans langchain :

## Initialisation de l'API

Pour utiliser les services LLM basés sur Baidu Qianfan, vous devez initialiser ces paramètres :

Vous pouvez choisir d'initialiser l'AK, SK dans les variables d'environnement ou les paramètres d'initialisation :

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

## Modèles actuellement pris en charge :

- ERNIE-Bot-turbo (modèles par défaut)
- ERNIE-Bot
- BLOOMZ-7B
- Llama-2-7b-chat
- Llama-2-13b-chat
- Llama-2-70b-chat
- Qianfan-BLOOMZ-7B-compressed
- Qianfan-Chinese-Llama-2-7B
- ChatGLM2-6B-32K
- AquilaChat-7B

## Configuration

```python
"""For basic init and call"""
import os

from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["QIANFAN_AK"] = "Your_api_key"
os.environ["QIANFAN_SK"] = "You_secret_Key"
```

## Utilisation

```python
chat = QianfanChatEndpoint(streaming=True)
messages = [HumanMessage(content="Hello")]
chat.invoke(messages)
```

```output
AIMessage(content='您好！请问您需要什么帮助？我将尽力回答您的问题。')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='您好！有什么我可以帮助您的吗？')]
```

### Streaming

```python
try:
    for chunk in chat.stream(messages):
        print(chunk.content, end="", flush=True)
except TypeError as e:
    print("")
```

```output
您好！有什么我可以帮助您的吗？
```

## Utiliser différents modèles dans Qianfan

Le modèle par défaut est ERNIE-Bot-turbo, dans le cas où vous souhaitez déployer votre propre modèle basé sur Ernie Bot ou un modèle open-source tiers, vous pouvez suivre ces étapes :

1. (Facultatif, si les modèles sont inclus dans les modèles par défaut, ignorez cette étape) Déployez votre modèle dans la console Qianfan, obtenez votre propre point de terminaison de déploiement personnalisé.
2. Configurez le champ appelé `endpoint` dans l'initialisation :

```python
chatBot = QianfanChatEndpoint(
    streaming=True,
    model="ERNIE-Bot",
)

messages = [HumanMessage(content="Hello")]
chatBot.invoke(messages)
```

```output
AIMessage(content='Hello，可以回答问题了，我会竭尽全力为您解答，请问有什么问题吗？')
```

## Paramètres du modèle :

Pour le moment, seuls `ERNIE-Bot` et `ERNIE-Bot-turbo` prennent en charge les paramètres de modèle ci-dessous, nous pourrions prendre en charge davantage de modèles à l'avenir.

- temperature
- top_p
- penalty_score

```python
chat.invoke(
    [HumanMessage(content="Hello")],
    **{"top_p": 0.4, "temperature": 0.1, "penalty_score": 1},
)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```
