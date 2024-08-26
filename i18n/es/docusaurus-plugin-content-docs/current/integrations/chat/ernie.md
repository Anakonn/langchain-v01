---
sidebar_label: Ernie Bot Chat
translated: true
---

# ErnieBotChat

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11) es un modelo de lenguaje a gran escala desarrollado por Baidu, que cubre una gran cantidad de datos en chino.
Este cuaderno cubre cómo comenzar con los modelos de chat de ErnieBot.

**Advertencia de Obsolescencia**

Recomendamos a los usuarios que usen `langchain_community.chat_models.ErnieBotChat`
que usen `langchain_community.chat_models.QianfanChatEndpoint` en su lugar.

la documentación de `QianfanChatEndpoint` está [aquí](/docs/integrations/chat/baidu_qianfan_endpoint/).

hay 4 razones por las que recomendamos a los usuarios que usen `QianfanChatEndpoint`:

1. `QianfanChatEndpoint` admite más LLM en la plataforma Qianfan.
2. `QianfanChatEndpoint` admite el modo de transmisión.
3. `QianfanChatEndpoint` admite el uso de llamadas a funciones.
4. `ErnieBotChat` carece de mantenimiento y está en desuso.

Algunos consejos para la migración:

- cambia `ernie_client_id` a `qianfan_ak`, también cambia `ernie_client_secret` a `qianfan_sk`.
- instala el paquete `qianfan`. como `pip install qianfan`
- cambia `ErnieBotChat` a `QianfanChatEndpoint`.

```python
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## Uso

```python
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

o puedes establecer `client_id` y `client_secret` en tus variables de entorno

```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

```python
chat([HumanMessage(content="hello there, who are you?")])
```

```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```
