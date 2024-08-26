---
sidebar_label: Tencent Hunyuan
translated: true
---

# Tencent Hunyuan

>[El modelo híbrido de Tencent API](https://cloud.tencent.com/document/product/1729) (`Hunyuan API`)
> implementa la comunicación de diálogo, la generación de contenido,
> el análisis y la comprensión, y se puede utilizar ampliamente en diversos escenarios como el servicio
> al cliente inteligente, el marketing inteligente, la interpretación de roles, la redacción publicitaria, la descripción de
> productos, la creación de guiones, la generación de currículums, la redacción de artículos, la generación de código, el análisis de datos y el análisis de contenido.

Consulte [más información](https://cloud.tencent.com/document/product/1729).

```python
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```

```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'aime programmer.")
```

## Para ChatHunyuan con Streaming

```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessageChunk(content="J'aime programmer.")
```
