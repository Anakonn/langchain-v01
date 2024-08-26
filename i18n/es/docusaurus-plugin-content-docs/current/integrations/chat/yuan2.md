---
sidebar_label: Yuan2.0
translated: true
---

# Yuan2.0

Este cuaderno muestra cómo usar la [YUAN2 API](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md) en LangChain con langchain.chat_models.ChatYuan2.

[*Yuan2.0*](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md) es un modelo de lenguaje grande fundamental de nueva generación desarrollado por IEIT System. Hemos publicado los tres modelos, Yuan 2.0-102B, Yuan 2.0-51B y Yuan 2.0-2B. Y proporcionamos los scripts relevantes para el entrenamiento previo, el ajuste fino y los servicios de inferencia para otros desarrolladores. Yuan2.0 se basa en Yuan1.0, utilizando una gama más amplia de datos de entrenamiento previo de alta calidad y conjuntos de datos de ajuste fino de instrucciones para mejorar la comprensión del modelo sobre semántica, matemáticas, razonamiento, código, conocimiento y otros aspectos.

## Comenzando

### Instalación

Primero, Yuan2.0 proporcionó una API compatible con OpenAI, e integramos ChatYuan2 en el modelo de chat de langchain utilizando el cliente de OpenAI.
Por lo tanto, asegúrese de que el paquete openai esté instalado en su entorno de Python. Ejecute el siguiente comando:

```python
%pip install --upgrade --quiet openai
```

### Importar los módulos requeridos

Después de la instalación, importe los módulos necesarios a su script de Python:

```python
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### Configurar su servidor API

Configure su servidor API compatible con OpenAI siguiendo [yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md).
Si ha implementado el servidor api localmente, puede simplemente establecer `yuan2_api_key="EMPTY"` o cualquier cosa que desee.
Asegúrese de que `yuan2_api_base` esté configurado correctamente.

```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### Inicializar el modelo ChatYuan2

Así es como inicializar el modelo de chat:

```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### Uso básico

Invoque el modelo con mensajes de sistema y humanos de esta manera:

```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```

```python
print(chat.invoke(messages))
```

### Uso básico con transmisión

Para una interacción continua, use la función de transmisión:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```

```python
chat.invoke(messages)
```

## Características avanzadas

### Uso con llamadas asincrónicas

Invoque el modelo con llamadas no bloqueantes, así:

```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```

```python
import asyncio

asyncio.run(basic_agenerate())
```

### Uso con plantilla de indicación

Invoque el modelo con llamadas no bloqueantes y use la plantilla de chat así:

```python
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```

```python
asyncio.run(ainvoke_with_prompt_template())
```

### Uso con llamadas asincrónicas en transmisión

Para llamadas no bloqueantes con salida de transmisión, use el método astream:

```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```

```python
import asyncio

asyncio.run(basic_astream())
```
