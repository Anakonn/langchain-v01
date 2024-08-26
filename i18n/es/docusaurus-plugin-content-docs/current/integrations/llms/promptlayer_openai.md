---
translated: true
---

# PromptLayer OpenAI

`PromptLayer` es la primera plataforma que le permite rastrear, administrar y compartir su ingeniería de prompts de GPT. `PromptLayer` actúa como un middleware entre su código y la biblioteca de Python de `OpenAI`.

`PromptLayer` registra todas sus solicitudes de `OpenAI API`, lo que le permite buscar y explorar el historial de solicitudes en el panel de control de `PromptLayer`.

Este ejemplo muestra cómo conectarse a [PromptLayer](https://www.promptlayer.com) para comenzar a registrar sus solicitudes de OpenAI.

Otro ejemplo está [aquí](/docs/integrations/providers/promptlayer).

## Instalar PromptLayer

Se requiere el paquete `promptlayer` para usar PromptLayer con OpenAI. Instale `promptlayer` usando pip.

```python
%pip install --upgrade --quiet  promptlayer
```

## Importaciones

```python
import os

import promptlayer
from langchain_community.llms import PromptLayerOpenAI
```

## Establecer la clave de la API del entorno

Puede crear una clave de API de PromptLayer en [www.promptlayer.com](https://www.promptlayer.com) haciendo clic en el engranaje de configuración en la barra de navegación.

Configúrelo como una variable de entorno llamada `PROMPTLAYER_API_KEY`.

También necesita una clave de OpenAI, llamada `OPENAI_API_KEY`.

```python
from getpass import getpass

PROMPTLAYER_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["PROMPTLAYER_API_KEY"] = PROMPTLAYER_API_KEY
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## Usar el LLM de PromptLayerOpenAI como de costumbre

*Opcionalmente, puede pasar `pl_tags` para rastrear sus solicitudes con la función de etiquetado de PromptLayer.*

```python
llm = PromptLayerOpenAI(pl_tags=["langchain"])
llm("I am a cat and I want")
```

**La solicitud anterior ahora debe aparecer en su [panel de control de PromptLayer](https://www.promptlayer.com).**

## Usando el seguimiento de PromptLayer

Si desea usar cualquiera de las [funciones de seguimiento de PromptLayer](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9), debe pasar el argumento `return_pl_id` al instanciar el LLM de PromptLayer para obtener el ID de la solicitud.

```python
llm = PromptLayerOpenAI(return_pl_id=True)
llm_results = llm.generate(["Tell me a joke"])

for res in llm_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

Usar esto le permite rastrear el rendimiento de su modelo en el panel de control de PromptLayer. Si está usando una plantilla de prompt, también puede adjuntar una plantilla a una solicitud.
En general, esto le da la oportunidad de rastrear el rendimiento de diferentes plantillas y modelos en el panel de control de PromptLayer.
