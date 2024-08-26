---
translated: true
---

# Modelo de chat personalizado

En esta guía, aprenderemos a crear un modelo de chat personalizado utilizando las abstracciones de LangChain.

¡Envolver tu LLM con la interfaz `BaseChatModel` estándar te permite usar tu LLM en los programas existentes de LangChain con mínimas modificaciones de código!

Como un bonus, tu LLM se convertirá automáticamente en un `Runnable` de LangChain y se beneficiará de algunas optimizaciones fuera de la caja (por ejemplo, procesamiento por lotes a través de un grupo de subprocesos), soporte asíncrono, la API `astream_events`, etc.

## Entradas y salidas

Primero, necesitamos hablar sobre los **mensajes** que son las entradas y salidas de los modelos de chat.

### Mensajes

Los modelos de chat toman mensajes como entradas y devuelven un mensaje como salida.

LangChain tiene algunos tipos de mensajes integrados:

| Tipo de mensaje       | Descripción                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `SystemMessage`       | Se usa para configurar el comportamiento de la IA, generalmente se pasa como el primero de una secuencia de mensajes de entrada.   |
| `HumanMessage`        | Representa un mensaje de una persona que interactúa con el modelo de chat.                             |
| `AIMessage`           | Representa un mensaje del modelo de chat. Esto puede ser texto o una solicitud para invocar una herramienta.|
| `FunctionMessage` / `ToolMessage` | Mensaje para pasar los resultados de la invocación de la herramienta de vuelta al modelo.               |
| `AIMessageChunk` / `HumanMessageChunk` / ... | Variante de fragmentos de cada tipo de mensaje. |

:::note
`ToolMessage` y `FunctionMessage` siguen de cerca los roles `function` y `tool` de OpenAI.

Este es un campo en rápido desarrollo y, a medida que más modelos agreguen capacidades de llamada de función, espera que haya adiciones a este esquema.
:::

```python
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    FunctionMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
```

### Variante de transmisión

Todos los mensajes de chat tienen una variante de transmisión que contiene `Chunk` en el nombre.

```python
from langchain_core.messages import (
    AIMessageChunk,
    FunctionMessageChunk,
    HumanMessageChunk,
    SystemMessageChunk,
    ToolMessageChunk,
)
```

Estos fragmentos se utilizan cuando se transmite la salida de los modelos de chat, y todos definen una propiedad aditiva.

```python
AIMessageChunk(content="Hello") + AIMessageChunk(content=" World!")
```

```output
AIMessageChunk(content='Hello World!')
```

## Modelo de chat base

¡Implementemos un modelo de chat que repita los primeros `n` caracteres del último mensaje en el mensaje!

Para hacerlo, heredaremos de `BaseChatModel` y tendremos que implementar lo siguiente:

| Método/Propiedad                  | Descripción                                                       | Requerido/Opcional  |
|------------------------------------|-------------------------------------------------------------------|--------------------|
| `_generate`                        | Usar para generar un resultado de chat a partir de un mensaje    | Requerido           |
| `_llm_type` (propiedad)             | Se usa para identificar de manera única el tipo del modelo. Se usa para registro.| Requerido           |
| `_identifying_params` (propiedad)   | Representar la parametrización del modelo para fines de seguimiento.            | Opcional           |
| `_stream`                          | Usar para implementar transmisión.                                       | Opcional           |
| `_agenerate`                       | Usar para implementar un método asíncrono nativo.                           | Opcional           |
| `_astream`                         | Usar para implementar la versión asíncrona de `_stream`.                      | Opcional           |

:::tip
La implementación de `_astream` usa `run_in_executor` para lanzar el `_stream` sincrónico en un subproceso separado si se implementa `_stream`, de lo contrario se vuelve a `_agenerate`.

Puedes usar este truco si quieres reutilizar la implementación de `_stream`, pero si puedes implementar código que sea nativo asíncrono, esa es una mejor solución ya que ese código se ejecutará con menos sobrecarga.
:::

### Implementación

```python
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional

from langchain_core.callbacks import (
    AsyncCallbackManagerForLLMRun,
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel, SimpleChatModel
from langchain_core.messages import AIMessageChunk, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from langchain_core.runnables import run_in_executor


class CustomChatModelAdvanced(BaseChatModel):
    """A custom chat model that echoes the first `n` characters of the input.

    When contributing an implementation to LangChain, carefully document
    the model including the initialization parameters, include
    an example of how to initialize the model and include any relevant
    links to the underlying models documentation or API.

    Example:

        .. code-block:: python

            model = CustomChatModel(n=2)
            result = model.invoke([HumanMessage(content="hello")])
            result = model.batch([[HumanMessage(content="hello")],
                                 [HumanMessage(content="world")]])
    """

    model_name: str
    """The name of the model"""
    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override the _generate method to implement the chat model logic.

        This can be a call to an API, a call to a local model, or any other
        implementation that generates a response to the input prompt.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        # Replace this with actual logic to generate a response from a list
        # of messages.
        last_message = messages[-1]
        tokens = last_message.content[: self.n]
        message = AIMessage(
            content=tokens,
            additional_kwargs={},  # Used to add additional payload (e.g., function calling request)
            response_metadata={  # Use for response metadata
                "time_in_seconds": 3,
            },
        )
        ##

        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """Stream the output of the model.

        This method should be implemented if the model can generate output
        in a streaming fashion. If the model does not support streaming,
        do not implement it. In that case streaming requests will be automatically
        handled by the _generate method.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        last_message = messages[-1]
        tokens = last_message.content[: self.n]

        for token in tokens:
            chunk = ChatGenerationChunk(message=AIMessageChunk(content=token))

            if run_manager:
                # This is optional in newer versions of LangChain
                # The on_llm_new_token will be called automatically
                run_manager.on_llm_new_token(token, chunk=chunk)

            yield chunk

        # Let's add some other information (e.g., response metadata)
        chunk = ChatGenerationChunk(
            message=AIMessageChunk(content="", response_metadata={"time_in_sec": 3})
        )
        if run_manager:
            # This is optional in newer versions of LangChain
            # The on_llm_new_token will be called automatically
            run_manager.on_llm_new_token(token, chunk=chunk)
        yield chunk

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "echoing-chat-model-advanced"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": self.model_name,
        }
```

### ¡Probémoslo! 🧪

¡El modelo de chat implementará la interfaz `Runnable` estándar de LangChain, que muchas de las abstracciones de LangChain admiten!

```python
model = CustomChatModelAdvanced(n=3, model_name="my_custom_model")
```

```python
model.invoke(
    [
        HumanMessage(content="hello!"),
        AIMessage(content="Hi there human!"),
        HumanMessage(content="Meow!"),
    ]
)
```

```output
AIMessage(content='Meo', response_metadata={'time_in_seconds': 3}, id='run-ddb42bd6-4fdd-4bd2-8be5-e11b67d3ac29-0')
```

```python
model.invoke("hello")
```

```output
AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-4d3cc912-44aa-454b-977b-ca02be06c12e-0')
```

```python
model.batch(["hello", "goodbye"])
```

```output
[AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-9620e228-1912-4582-8aa1-176813afec49-0'),
 AIMessage(content='goo', response_metadata={'time_in_seconds': 3}, id='run-1ce8cdf8-6f75-448e-82f7-1bb4a121df93-0')]
```

```python
for chunk in model.stream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

¡Consulta la implementación de `_astream` en el modelo! Si no lo implementas, entonces no se transmitirá ninguna salida.

```python
async for chunk in model.astream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

¡Intentemos usar la API de eventos `astream` que también ayudará a verificar que se implementaron todos los callbacks!

```python
async for event in model.astream_events("cat", version="v1"):
    print(event)
```

```output
{'event': 'on_chat_model_start', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'name': 'CustomChatModelAdvanced', 'tags': [], 'metadata': {}, 'data': {'input': 'cat'}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='c', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='a', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='t', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_end', 'name': 'CustomChatModelAdvanced', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'data': {'output': AIMessageChunk(content='cat', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}

/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

## Contribución

Apreciamos todas las contribuciones de integración de modelos de chat.

Aquí hay una lista de verificación para ayudar a asegurarse de que su contribución se agregue a LangChain:

Documentación:

* El modelo contiene cadenas de documentación para todos los argumentos de inicialización, ya que se mostrarán en la [APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html).
* La cadena de documentación de la clase para el modelo contiene un enlace a la API del modelo si este está alimentado por un servicio.

Pruebas:

* [ ] Agrega pruebas unitarias o de integración a los métodos anulados. Verifica que `invoke`, `ainvoke`, `batch`, `stream` funcionen si has anulado el código correspondiente.

Transmisión (si la estás implementando):

* [ ] Implementa el método `_stream` para que la transmisión funcione

Comportamiento del token de parada:

* [ ] El token de parada debe respetarse
* [ ] El token de parada debe INCLUIRSE como parte de la respuesta

Claves API secretas:

* [ ] Si tu modelo se conecta a una API, probablemente aceptará claves API como parte de su inicialización. Usa el tipo `SecretStr` de Pydantic para los secretos, para que no se impriman accidentalmente cuando la gente imprima el modelo.

Parámetros de identificación:

* [ ] Incluye un `model_name` en los parámetros de identificación

Optimizaciones:

¡Considera proporcionar soporte asíncrono nativo para reducir la sobrecarga del modelo!

* [ ] Proporcionó un asíncrono nativo de `_agenerate` (usado por `ainvoke`)
* [ ] Proporcionó un asíncrono nativo de `_astream` (usado por `astream`)
