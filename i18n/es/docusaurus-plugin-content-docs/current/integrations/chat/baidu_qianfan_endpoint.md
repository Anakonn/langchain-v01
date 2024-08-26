---
sidebar_label: Baidu Qianfan
translated: true
---

# QianfanChatEndpoint

La plataforma Baidu AI Cloud Qianfan es una plataforma de desarrollo y operación de modelos grandes de un solo paso para desarrolladores empresariales. Qianfan no solo proporciona el modelo de Wenxin Yiyan (ERNIE-Bot) y los modelos de código abierto de terceros, sino que también proporciona varias herramientas de desarrollo de IA y todo el conjunto de entorno de desarrollo, lo que facilita a los clientes el uso y el desarrollo de aplicaciones de modelos grandes.

Básicamente, esos modelos se dividen en los siguientes tipos:

- Embedding
- Chat
- Completion

En este cuaderno, presentaremos cómo usar langchain con [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html) principalmente en `Chat` correspondiente al paquete `langchain/chat_models` en langchain:

## Inicialización de la API

Para usar los servicios de LLM basados en Baidu Qianfan, debe inicializar estos parámetros:

Puede elegir inicializar el AK, SK en variables de entorno o inicializar los parámetros:

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

## Modelos compatibles actuales:

- ERNIE-Bot-turbo (modelos predeterminados)
- ERNIE-Bot
- BLOOMZ-7B
- Llama-2-7b-chat
- Llama-2-13b-chat
- Llama-2-70b-chat
- Qianfan-BLOOMZ-7B-compressed
- Qianfan-Chinese-Llama-2-7B
- ChatGLM2-6B-32K
- AquilaChat-7B

## Configurar

```python
"""For basic init and call"""
import os

from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["QIANFAN_AK"] = "Your_api_key"
os.environ["QIANFAN_SK"] = "You_secret_Key"
```

## Uso

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

### Transmisión

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

## Usar diferentes modelos en Qianfan

El modelo predeterminado es ERNIE-Bot-turbo, en el caso de que desee implementar su propio modelo basado en Ernie Bot o un modelo de código abierto de terceros, puede seguir estos pasos:

1. (Opcional, si los modelos están incluidos en los modelos predeterminados, omítalo) Implemente su modelo en la consola de Qianfan, obtenga su propio punto final de implementación personalizado.
2. Configurar el campo llamado `endpoint` en la inicialización:

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

## Parámetros del modelo:

Por ahora, solo `ERNIE-Bot` y `ERNIE-Bot-turbo` admiten los parámetros del modelo a continuación, es posible que admitamos más modelos en el futuro.

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
