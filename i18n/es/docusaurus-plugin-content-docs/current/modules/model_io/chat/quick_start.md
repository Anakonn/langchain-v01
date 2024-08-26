---
sidebar_position: 0
title: Inicio rápido
translated: true
---

# Inicio rápido

Los modelos de chat son una variación de los modelos de lenguaje.
Si bien los modelos de chat utilizan modelos de lenguaje bajo el capó, la interfaz que utilizan es un poco diferente.
En lugar de usar una API de "texto de entrada, texto de salida", utilizan una interfaz donde los "mensajes de chat" son las entradas y salidas.

## Configuración

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="chat" />

Si prefiere no establecer una variable de entorno, puede pasar la clave directamente a través del parámetro de argumento de clave de la API al iniciar la clase del modelo de chat:

<ChatModelTabs
  anthropicParams={`model="claude-3-sonnet-20240229", api_key="..."`}
  openaiParams={`model="gpt-3.5-turbo-0125", api_key="..."`}
  mistralParams={`model="mistral-large-latest", api_key="..."`}
  fireworksParams={`model="accounts/fireworks/models/mixtral-8x7b-instruct", api_key="..."`}
  googleParams={`model="gemini-pro", google_api_key="..."`}
  togetherParams={`, together_api_key="..."`}
  customVarName="chat"
/>

## Mensajes

La interfaz del modelo de chat se basa en mensajes en lugar de texto sin formato.
Los tipos de mensajes actualmente compatibles en LangChain son `AIMessage`, `HumanMessage`, `SystemMessage`, `FunctionMessage` y `ChatMessage` -- `ChatMessage` acepta un parámetro de rol arbitrario. La mayoría de las veces, solo trabajará con `HumanMessage`, `AIMessage` y `SystemMessage`.

## LCEL

Los modelos de chat implementan la [interfaz Runnable](/docs/expression_language/interface), el bloque de construcción básico del [Lenguaje de Expresión de LangChain (LCEL)](/docs/expression_language/). Esto significa que admiten llamadas `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

Los modelos de chat aceptan `List[BaseMessage]` como entradas, u objetos que se pueden convertir en mensajes, incluidos `str` (convertidos en `HumanMessage`) y `PromptValue`.

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(content="What is the purpose of model regularization?"),
]
```

```python
# | output: false
# | echo: false

from langchain_openai import ChatOpenAI

chat = ChatOpenAI()
```

```python
chat.invoke(messages)
```

```output
AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to fit the noise in the training data, leading to poor generalization on unseen data. Regularization techniques introduce additional constraints or penalties to the model's objective function, discouraging it from becoming overly complex and promoting simpler and more generalizable models. Regularization helps to strike a balance between fitting the training data well and avoiding overfitting, leading to better performance on new, unseen data.")
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting and improve the generalization of a machine learning model. Overfitting occurs when a model is too complex and learns the noise or random variations in the training data, which leads to poor performance on new, unseen data. Regularization techniques introduce additional constraints or penalties to the model's learning process, discouraging it from fitting the noise and reducing the complexity of the model. This helps to improve the model's ability to generalize well and make accurate predictions on unseen data.
```

```python
chat.batch([messages])
```

```output
[AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to learn the noise or random fluctuations in the training data, rather than the underlying patterns or relationships. Regularization techniques add a penalty term to the model's objective function, which discourages the model from becoming too complex and helps it generalize better to new, unseen data. This improves the model's ability to make accurate predictions on new data by reducing the variance and increasing the model's overall performance.")]
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning general patterns and relationships. This leads to poor performance on new, unseen data.\n\nRegularization techniques introduce additional constraints or penalties to the model during training, discouraging it from becoming overly complex. This helps to strike a balance between fitting the training data well and generalizing to new data. Regularization techniques can include adding a penalty term to the loss function, such as L1 or L2 regularization, or using techniques like dropout or early stopping. By regularizing the model, it encourages it to learn the most relevant features and reduce the impact of noise or outliers in the data.')
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning the underlying patterns. Regularization techniques help in reducing the complexity of the model by adding a penalty to the loss function. This penalty encourages the model to have smaller weights or fewer features, making it more generalized and less prone to overfitting. The goal is to find the right balance between fitting the training data well and being able to generalize well to unseen data.
```

```python
async for chunk in chat.astream_log(messages):
    print(chunk)
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '754c4143-2348-46c4-ad2b-3095913084c6',
            'logs': {},
            'streamed_output': []}})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='The')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' purpose')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' regularization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' is')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' prevent')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' machine')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learning')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' improve')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' its')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' general')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' ability')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' occurs')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' when')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becomes')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' noise')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' or')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' random')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fluctuations')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' in')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' instead')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' capturing')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' underlying')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' patterns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' relationships')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Regular')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' techniques')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' introduce')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' penalty')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' term')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' objective')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' function')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' which')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' discour')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ages')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becoming')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' This')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' helps')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' control')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complexity')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' reduces')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' risk')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' leading')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' better')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' performance')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' on')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' unseen')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop'},
                              'message': AIMessageChunk(content="The purpose of model regularization is to prevent a machine learning model from overfitting the training data and improve its generalization ability. Overfitting occurs when a model becomes too complex and learns to fit the noise or random fluctuations in the training data, instead of capturing the underlying patterns and relationships. Regularization techniques introduce a penalty term to the model's objective function, which discourages the model from becoming too complex. This helps to control the model's complexity and reduces the risk of overfitting, leading to better performance on unseen data."),
                              'text': 'The purpose of model regularization is '
                                      'to prevent a machine learning model '
                                      'from overfitting the training data and '
                                      'improve its generalization ability. '
                                      'Overfitting occurs when a model becomes '
                                      'too complex and learns to fit the noise '
                                      'or random fluctuations in the training '
                                      'data, instead of capturing the '
                                      'underlying patterns and relationships. '
                                      'Regularization techniques introduce a '
                                      "penalty term to the model's objective "
                                      'function, which discourages the model '
                                      'from becoming too complex. This helps '
                                      "to control the model's complexity and "
                                      'reduces the risk of overfitting, '
                                      'leading to better performance on unseen '
                                      'data.'}]],
            'llm_output': None,
            'run': None}})
```

## [LangSmith](/docs/langsmith)

Todos los `ChatModel`s vienen con trazado de LangSmith incorporado. Simplemente establezca las siguientes variables de entorno:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=<your-api-key>
```

y cualquier invocación de `ChatModel` (ya sea anidada en una cadena o no) se rastreará automáticamente. Un rastro incluirá entradas, salidas, latencia, uso de tokens, parámetros de invocación, parámetros ambientales y más. Vea un ejemplo aquí: https://smith.langchain.com/public/a54192ae-dd5c-4f7a-88d1-daa1eaba1af7/r.

En LangSmith, luego puede proporcionar comentarios para cualquier rastro, compilar conjuntos de datos anotados para evaluaciones, depurar el rendimiento en el área de juego y más.

## [Legacy] `__call__`

#### Mensajes de entrada -> mensaje de salida

Por conveniencia, también puede tratar a los modelos de chat como llamables. Puede obtener completaciones de chat pasando uno o más mensajes al modelo de chat. La respuesta será un mensaje.

```python
from langchain_core.messages import HumanMessage, SystemMessage

chat(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore la programmation.")
```

El modelo de chat de OpenAI admite múltiples mensajes como entrada. Consulte [aquí](https://platform.openai.com/docs/guides/chat/chat-vs-completions) para obtener más información. Aquí hay un ejemplo de enviar un mensaje de sistema y un mensaje de usuario al modelo de chat:

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]
chat(messages)
```

```output
AIMessage(content="J'adore la programmation.")
```

## [Legacy] `generate`

#### Llamadas por lotes, salidas más ricas

Puede ir un paso más allá y generar completaciones para múltiples conjuntos de mensajes usando `generate`. Esto devuelve un `LLMResult` con un parámetro `message` adicional. Esto incluirá información adicional sobre cada generación más allá del mensaje devuelto (por ejemplo, la razón de finalización) e información adicional sobre la llamada completa a la API (por ejemplo, el uso total de tokens).

```python
batch_messages = [
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ],
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love artificial intelligence."),
    ],
]
result = chat.generate(batch_messages)
result
```

```output
LLMResult(generations=[[ChatGeneration(text="J'adore programmer.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore programmer."))], [ChatGeneration(text="J'adore l'intelligence artificielle.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore l'intelligence artificielle."))]], llm_output={'token_usage': {'prompt_tokens': 53, 'completion_tokens': 18, 'total_tokens': 71}, 'model_name': 'gpt-3.5-turbo'}, run=[RunInfo(run_id=UUID('077917a9-026c-47c4-b308-77b37c3a3bfa')), RunInfo(run_id=UUID('0a70a0bf-c599-4f51-932a-c7d42202c984'))])
```

Puede recuperar cosas como el uso de tokens de este LLMResult:

```python
result.llm_output
```

```output
{'token_usage': {'prompt_tokens': 53,
  'completion_tokens': 18,
  'total_tokens': 71},
 'model_name': 'gpt-3.5-turbo'}
```
