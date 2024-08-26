---
sidebar_label: OpenAI
translated: true
---

# ChatOpenAI

Este cuaderno cubre cómo comenzar con los modelos de chat de OpenAI.

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

La celda anterior supone que su clave de API de OpenAI está establecida en sus variables de entorno. Si prefiere especificar manualmente su clave de API y/o ID de organización, use el siguiente código:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0, api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

Elimine el parámetro openai_organization si no le aplica.

```python
messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    ("human", "Translate this sentence from English to French. I love programming."),
]
llm.invoke(messages)
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 34, 'total_tokens': 40}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-8591eae1-b42b-402b-a23a-dfdb0cd151bd-0')
```

## Encadenamiento

Podemos encadenar nuestro modelo con una plantilla de indicación de la siguiente manera:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```

```output
AIMessage(content='Ich liebe Programmieren.', response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 26, 'total_tokens': 31}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-94fa6741-c99b-4513-afce-c3f562631c79-0')
```

## Llamada de herramientas

OpenAI tiene una [llamada de herramientas](https://platform.openai.com/docs/guides/function-calling) (usamos "llamada de herramientas" e "invocación de funciones" indistintamente aquí) API que le permite describir herramientas y sus argumentos, y hacer que el modelo devuelva un objeto JSON con una herramienta a invocar y las entradas de esa herramienta. La llamada de herramientas es extremadamente útil para construir cadenas y agentes que utilizan herramientas, y para obtener salidas estructuradas de los modelos en general.

### ChatOpenAI.bind_tools()

Con `ChatAnthropic.bind_tools`, podemos pasar fácilmente clases Pydantic, esquemas de diccionarios, herramientas de LangChain o incluso funciones como herramientas al modelo. Debajo del capó, estos se convierten en un esquema de herramientas de Anthropic, que se ve así:

```output
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```

y se pasa en cada invocación del modelo.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = llm.bind_tools([GetWeather])
```

```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_H7fABDuzEau48T10Qn0Lsh0D', 'function': {'arguments': '{"location":"San Francisco"}', 'name': 'GetWeather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 70, 'total_tokens': 85}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-b469135e-2718-446a-8164-eef37e672ba2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}])
```

### AIMessage.tool_calls

Tenga en cuenta que el AIMessage tiene un atributo `tool_calls`. Esto contiene en un formato ToolCall estandarizado que es independiente del proveedor del modelo.

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}]
```

Para más información sobre la vinculación de herramientas y las salidas de las llamadas de herramientas, dirígete a la documentación de [llamada de herramientas](/docs/modules/model_io/chat/function_calling/).

## Ajuste fino

Puede llamar a los modelos de OpenAI ajustados pasando el parámetro `modelName` correspondiente.

Esto generalmente toma la forma de `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}`. Por ejemplo:

```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model(messages)
```

```output
AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)
```
