---
sidebar_label: Upstage
translated: true
---

# ChatUpstage

Este cuaderno cubre cómo comenzar con los modelos de chat de Upstage.

## Instalación

Instala el paquete `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuración del entorno

Asegúrate de establecer las siguientes variables de entorno:

- `UPSTAGE_API_KEY`: Tu clave API de Upstage desde la [consola de Upstage](https://console.upstage.ai/).

## Uso

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

## Encadenamiento

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
