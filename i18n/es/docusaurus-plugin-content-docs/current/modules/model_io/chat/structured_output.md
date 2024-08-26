---
sidebar_position: 3
translated: true
---

# Salida estructurada

A menudo es crucial que los LLM devuelvan una salida estructurada. Esto se debe a que, a menudo, las salidas de los LLM se utilizan en aplicaciones posteriores, donde se requieren argumentos específicos. Tener el LLM que devuelva una salida estructurada de manera confiable es necesario para eso.

Hay algunas estrategias de alto nivel diferentes que se utilizan para hacer esto:

- Prompting: Esto es cuando le pides al LLM (muy amablemente) que devuelva la salida en el formato deseado (JSON, XML). Esto es agradable porque funciona con todos los LLM. No es agradable porque no hay garantía de que el LLM devuelva la salida en el formato correcto.
- Llamada de función: Esto es cuando el LLM se ajusta para poder generar no solo una finalización, sino también una llamada de función. Las funciones que el LLM puede llamar generalmente se pasan como parámetros adicionales a la API del modelo. Los nombres y descripciones de las funciones deben tratarse como parte del prompt (generalmente cuentan contra los recuentos de tokens y son utilizados por el LLM para decidir qué hacer).
- Llamada de herramienta: Una técnica similar a la llamada de función, pero permite que el LLM llame a varias funciones a la vez.
- Modo JSON: Esto es cuando el LLM garantiza que devolverá JSON.

Los diferentes modelos pueden admitir diferentes variantes de estos, con parámetros ligeramente diferentes. Para facilitar que los LLM devuelvan una salida estructurada, hemos agregado una interfaz común a los modelos de LangChain: `.with_structured_output`.

Al invocar este método (y pasar un esquema JSON o un modelo Pydantic), el modelo agregará los parámetros del modelo y los analizadores de salida necesarios para obtener la salida estructurada. Puede haber más de una forma de hacer esto (por ejemplo, llamada de función vs. modo JSON): puede configurar el método a utilizar pasándolo a ese método.

¡Veamos algunos ejemplos de esto en acción!

Utilizaremos Pydantic para estructurar fácilmente el esquema de respuesta.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class Joke(BaseModel):
    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
```

## OpenAI

OpenAI expone algunas formas diferentes de obtener salidas estructuradas.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)

```python
from langchain_openai import ChatOpenAI
```

#### Llamada de herramienta/función

De forma predeterminada, utilizaremos `function_calling`

```python
model = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='To keep an eye on the mouse!')
```

#### Modo JSON

También admitimos el modo JSON. Tenga en cuenta que debemos especificar en el prompt el formato en el que debe responder.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!')
```

## Fireworks

[Fireworks](https://fireworks.ai/) también admite la llamada de función y el modo JSON para modelos seleccionados.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_fireworks.chat_models.ChatFireworks.html#langchain_fireworks.chat_models.ChatFireworks.with_structured_output)

```python
from langchain_fireworks import ChatFireworks
```

#### Llamada de herramienta/función

De forma predeterminada, utilizaremos `function_calling`

```python
model = ChatFireworks(model="accounts/fireworks/models/firefunction-v1")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### Modo JSON

También admitimos el modo JSON. Tenga en cuenta que debemos especificar en el prompt el formato en el que debe responder.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about dogs, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why did the dog sit in the shade?', punchline='To avoid getting burned.')
```

## Mistral

También admitimos la salida estructurada con modelos Mistral, aunque solo admitimos la llamada de función.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html#langchain_mistralai.chat_models.ChatMistralAI.with_structured_output)

```python
from langchain_mistralai import ChatMistralAI
```

```python
model = ChatMistralAI(model="mistral-large-latest")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Juntos

Dado que [TogetherAI](https://www.together.ai/) es solo un reemplazo directo de OpenAI, podemos usar la integración de OpenAI

```python
import os

from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the cat sit on the computer?', punchline='To keep an eye on the mouse!')
```

## Groq

Groq proporciona una API de llamada de función compatible con OpenAI.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_groq.chat_models.ChatGroq.html#langchain_groq.chat_models.ChatGroq.with_structured_output)

```python
from langchain_groq import ChatGroq
```

#### Llamada de herramienta/función

De forma predeterminada, utilizaremos `function_calling`

```python
model = ChatGroq()
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### Modo JSON

También admitimos el modo JSON. Tenga en cuenta que debemos especificar en el prompt el formato en el que debe responder.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Anthropic

La API de llamada de herramienta de Anthropic se puede usar para estructurar las salidas. Tenga en cuenta que actualmente no hay forma de forzar una llamada de herramienta a través de la API, por lo que seguir el prompt del modelo correctamente sigue siendo importante.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html#langchain_anthropic.chat_models.ChatAnthropic.with_structured_output)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-opus-20240229", temperature=0)
structured_llm = model.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats. Make sure to call the Joke function.")
```

```output
Joke(setup='What do you call a cat that loves to bowl?', punchline='An alley cat!')
```

## Google Vertex AI

Los modelos Gemini de Google admiten [llamada de función](https://ai.google.dev/docs/function_calling), que podemos acceder a través de Vertex AI y usar para estructurar las salidas.

[Referencia de API](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html#langchain_google_vertexai.chat_models.ChatVertexAI.with_structured_output)

```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-pro", temperature=0)
structured_llm = llm.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the scarecrow win an award?', punchline='Why did the scarecrow win an award? Because he was outstanding in his field.')
```
