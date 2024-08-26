---
translated: true
---

# Personalizado LLM

Este cuaderno repasa cómo crear un wrapper personalizado de LLM, en caso de que quieras usar tu propio LLM o un wrapper diferente al que se admite en LangChain.

¡Envolver tu LLM con la interfaz estándar `LLM` te permite usar tu LLM en los programas existentes de LangChain con mínimas modificaciones de código!

Como bonus, tu LLM se convertirá automáticamente en un `Runnable` de LangChain y se beneficiará de algunas optimizaciones fuera de la caja, soporte asíncrono, la API `astream_events`, etc.

## Implementación

Solo hay dos cosas requeridas que un LLM personalizado debe implementar:

| Método        | Descripción                                                               |
|---------------|---------------------------------------------------------------------------|
| `_call`       | Toma una cadena y algunas palabras de parada opcionales, y devuelve una cadena. Utilizado por `invoke`. |
| `_llm_type`   | Una propiedad que devuelve una cadena, utilizada solo para fines de registro.

Implementaciones opcionales:

| Método    | Descripción                                                                                               |
|----------------------|-----------------------------------------------------------------------------------------------------------|
| `_identifying_params` | Se utiliza para ayudar a identificar el modelo e imprimir el LLM; debe devolver un diccionario. Este es un **@property**.                 |
| `_acall`              | Proporciona una implementación nativa asíncrona de `_call`, utilizada por `ainvoke`.                                    |
| `_stream`             | Método para transmitir la salida token por token.                                                               |
| `_astream`            | Proporciona una implementación nativa asíncrona de `_stream`; en versiones más recientes de LangChain, se establece por defecto en `_stream`. |

Implementemos un LLM personalizado simple que simplemente devuelva los primeros n caracteres de la entrada.

```python
from typing import Any, Dict, Iterator, List, Mapping, Optional

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models.llms import LLM
from langchain_core.outputs import GenerationChunk


class CustomLLM(LLM):
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

    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Run the LLM on the given input.

        Override this method to implement the LLM logic.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of the stop substrings.
                If stop tokens are not supported consider raising NotImplementedError.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            The model output as a string. Actual completions SHOULD NOT include the prompt.
        """
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        return prompt[: self.n]

    def _stream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        """Stream the LLM on the given prompt.

        This method should be overridden by subclasses that support streaming.

        If not implemented, the default behavior of calls to stream will be to
        fallback to the non-streaming version of the model and return
        the output as a single chunk.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of these substrings.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            An iterator of GenerationChunks.
        """
        for char in prompt[: self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)

            yield chunk

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "CustomChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "custom"
```

### Probémoslo 🧪

Este LLM implementará la interfaz estándar `Runnable` de LangChain, que muchas de las abstracciones de LangChain admiten.

```python
llm = CustomLLM(n=5)
print(llm)
```

```output
[1mCustomLLM[0m
Params: {'model_name': 'CustomChatModel'}
```

```python
llm.invoke("This is a foobar thing")
```

```output
'This '
```

```python
await llm.ainvoke("world")
```

```output
'world'
```

```python
llm.batch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
await llm.abatch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
async for token in llm.astream("hello"):
    print(token, end="|", flush=True)
```

```output
h|e|l|l|o|
```

Confirmemos que se integra bien con otras API de `LangChain`.

```python
from langchain_core.prompts import ChatPromptTemplate
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "you are a bot"), ("human", "{input}")]
)
```

```python
llm = CustomLLM(n=7)
chain = prompt | llm
```

```python
idx = 0
async for event in chain.astream_events({"input": "hello there!"}, version="v1"):
    print(event)
    idx += 1
    if idx > 7:
        # Truncate
        break
```

```output
{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
```

## Contribución

Apreciamos todas las contribuciones de integración de modelos de chat.

Aquí hay una lista de verificación para ayudarte a asegurarte de que tu contribución se agregue a LangChain:

Documentación:

* El modelo contiene cadenas de documentación para todos los argumentos de inicialización, ya que se mostrarán en la [APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html).
* La cadena de documentación de la clase para el modelo contiene un enlace a la API del modelo si este está alimentado por un servicio.

Pruebas:

* [ ] Agrega pruebas unitarias o de integración a los métodos anulados. Verifica que `invoke`, `ainvoke`, `batch`, `stream` funcionen si has anulado el código correspondiente.

Transmisión (si la estás implementando):

* [ ] Asegúrate de invocar el callback `on_llm_new_token`
* [ ] `on_llm_new_token` se invoca ANTES de devolver el fragmento

Comportamiento del token de parada:

* [ ] El token de parada debe respetarse
* [ ] El token de parada debe INCLUIRSE como parte de la respuesta

Claves de API secretas:

* [ ] Si tu modelo se conecta a una API, probablemente aceptará claves de API como parte de su inicialización. Usa el tipo `SecretStr` de Pydantic para los secretos, para que no se impriman accidentalmente cuando la gente imprima el modelo.
