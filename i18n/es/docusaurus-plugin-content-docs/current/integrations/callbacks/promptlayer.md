---
translated: true
---

# PromptLayer

>[PromptLayer](https://docs.promptlayer.com/introduction) es una plataforma para la ingeniería de prompts. También ayuda con la observabilidad de LLM para visualizar solicitudes, versionar prompts y rastrear el uso.
>
>Si bien `PromptLayer` tiene LLM que se integran directamente con LangChain (por ejemplo, [`PromptLayerOpenAI`](/docs/integrations/llms/promptlayer_openai)), el uso de un callback es la forma recomendada de integrar `PromptLayer` con LangChain.

En esta guía, repasaremos cómo configurar el `PromptLayerCallbackHandler`.

Consulta la [documentación de PromptLayer](https://docs.promptlayer.com/languages/langchain) para obtener más información.

## Instalación y configuración

```python
%pip install --upgrade --quiet  promptlayer --upgrade
```

### Obtener credenciales de API

Si no tienes una cuenta de PromptLayer, crea una en [promptlayer.com](https://www.promptlayer.com). Luego, obtén una clave API haciendo clic en el engranaje de configuración de la barra de navegación y
establécela como una variable de entorno llamada `PROMPTLAYER_API_KEY`.

## Uso

Comenzar con `PromptLayerCallbackHandler` es bastante sencillo, toma dos argumentos opcionales:
1. `pl_tags` - una lista opcional de cadenas que se rastrearán como etiquetas en PromptLayer.
2. `pl_id_callback` - una función opcional que tomará `promptlayer_request_id` como argumento. Este ID se puede usar con todas las funciones de seguimiento de PromptLayer para rastrear, metadatos, puntajes y uso de prompts.

## Ejemplo simple de OpenAI

En este ejemplo simple, usamos `PromptLayerCallbackHandler` con `ChatOpenAI`. Agregamos una etiqueta de PromptLayer llamada `chatopenai`.

```python
import promptlayer  # Don't forget this 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## Ejemplo de GPT4All

```python
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## Ejemplo completo

En este ejemplo, desbloqueamos más del poder de `PromptLayer`.

PromptLayer te permite crear, versionar y rastrear plantillas de prompts de forma visual. Usando el [Prompt Registry](https://docs.promptlayer.com/features/prompt-registry), podemos buscar la plantilla de prompt llamada `example` de forma programática.

También definimos una función `pl_id_callback` que toma el `promptlayer_request_id` y registra un puntaje, metadatos y vincula la plantilla de prompt utilizada. Lee más sobre el seguimiento en [nuestra documentación](https://docs.promptlayer.com/features/prompt-history/request-id).

```python
from langchain_openai import OpenAI


def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # score is an integer 0-100
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # metadata is a dictionary of key value pairs that is tracked on PromptLayer
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # link the request to a prompt template


openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

¡Eso es todo! Después de la configuración, todas tus solicitudes aparecerán en el panel de PromptLayer.
Este callback también funciona con cualquier LLM implementado en LangChain.
