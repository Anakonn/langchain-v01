---
sidebar_label: PromptLayer ChatOpenAI
translated: true
---

# PromptLayerChatOpenAI

Este ejemplo muestra cómo conectarse a [PromptLayer](https://www.promptlayer.com) para comenzar a registrar sus solicitudes de ChatOpenAI.

## Instalar PromptLayer

Se requiere el paquete `promptlayer` para usar PromptLayer con OpenAI. Instale `promptlayer` usando pip.

```python
pip install promptlayer
```

## Importaciones

```python
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## Establecer la clave de la API del entorno

Puede crear una clave de API de PromptLayer en [www.promptlayer.com](https://www.promptlayer.com) haciendo clic en el engranaje de configuración de la barra de navegación.

Configúrelo como una variable de entorno llamada `PROMPTLAYER_API_KEY`.

```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## Usar el LLM PromptLayerOpenAI como de costumbre

*Opcionalmente, puede pasar `pl_tags` para rastrear sus solicitudes con la función de etiquetado de PromptLayer.*

```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```

```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```

**La solicitud anterior ahora debe aparecer en su [panel de PromptLayer](https://www.promptlayer.com).**

## Usar el seguimiento de PromptLayer

Si desea usar cualquiera de las [funciones de seguimiento de PromptLayer](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9), debe pasar el argumento `return_pl_id` al instanciar el LLM de PromptLayer para obtener el ID de la solicitud.

```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

Esto le permite rastrear el rendimiento de su modelo en el panel de PromptLayer. Si está usando una plantilla de solicitud, también puede adjuntar una plantilla a una solicitud.
En general, esto le brinda la oportunidad de rastrear el rendimiento de diferentes plantillas y modelos en el panel de PromptLayer.
