---
keywords:
- gemini
- vertex
- ChatVertexAI
- gemini-pro
sidebar_label: Google Cloud Vertex AI
translated: true
---

# ChatVertexAI

Nota: Esto es independiente de la integración de Google PaLM. Google ha decidido ofrecer una versión empresarial de PaLM a través de GCP, y esto es compatible con los modelos disponibles a través de allí.

ChatVertexAI expone todos los modelos fundamentales disponibles en Google Cloud:

- Gemini (`gemini-pro` y `gemini-pro-vision`)
- PaLM 2 para texto (`text-bison`)
- Codey para generación de código (`codechat-bison`)

Para obtener una lista completa y actualizada de los modelos disponibles, visite [la documentación de VertexAI](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview).

De forma predeterminada, Google Cloud [no utiliza](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) los datos de los clientes para entrenar sus modelos fundamentales como parte del Compromiso de Privacidad de IA/ML de Google Cloud. Puede encontrar más detalles sobre cómo Google procesa los datos en [el Anexo de Procesamiento de Datos del Cliente (CDPA) de Google](https://cloud.google.com/terms/data-processing-addendum).

Para usar `Google Cloud Vertex AI` PaLM, debe tener instalado el paquete Python `langchain-google-vertexai` y:
- Tener las credenciales configuradas para su entorno (gcloud, identidad de carga de trabajo, etc.)
- Almacenar la ruta a un archivo JSON de cuenta de servicio como la variable de entorno GOOGLE_APPLICATION_CREDENTIALS

Este código base utiliza la biblioteca `google.auth`, que primero busca la variable de credenciales de la aplicación mencionada anteriormente y luego busca la autenticación a nivel del sistema.

Para obtener más información, consulte:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet  langchain-google-vertexai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI
```

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content=" J'aime la programmation.")
```

Gemini no admite SystemMessage por el momento, pero se puede agregar al primer mensaje humano de la fila. Si desea este comportamiento, simplemente establezca `convert_system_message_to_human` en `True`:

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="gemini-pro", convert_system_message_to_human=True)

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content="J'aime la programmation.")
```

Si queremos construir una cadena simple que tome parámetros especificados por el usuario:

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat

chain.invoke(
    {
        "input_language": "English",
        "output_language": "Japanese",
        "text": "I love programming",
    }
)
```

```output
AIMessage(content=' プログラミングが大好きです')
```

## Modelos de chat de generación de código

Ahora puede aprovechar la API de Codey para el chat de código dentro de Vertex AI. El modelo disponible es:
- `codechat-bison`: para asistencia de código

```python
chat = ChatVertexAI(model="codechat-bison", max_tokens=1000, temperature=0.5)

message = chat.invoke("Write a Python function generating all prime numbers")
print(message.content)
```

```output
 ```python
def is_prime(n):
  """
  Check if a number is prime.

  Args:
    n: The number to check.

  Returns:
    True if n is prime, False otherwise.
  """

  # If n is 1, it is not prime.
  if n == 1:
    return False

  # Iterate over all numbers from 2 to the square root of n.
  for i in range(2, int(n ** 0.5) + 1):
    # If n is divisible by any number from 2 to its square root, it is not prime.
    if n % i == 0:
      return False

  # If n is divisible by no number from 2 to its square root, it is prime.
  return True


def find_prime_numbers(n):
  """
  Find all prime numbers up to a given number.

  Args:
    n: The upper bound for the prime numbers to find.

  Returns:
    A list of all prime numbers up to n.
  """

  # Create a list of all numbers from 2 to n.
  numbers = list(range(2, n + 1))

  # Iterate over the list of numbers and remove any that are not prime.
  for number in numbers:
    if not is_prime(number):
      numbers.remove(number)

  # Return the list of prime numbers.
  return numbers
  ```
```

## Información de generación completa

Podemos usar el método `generate` para obtener metadatos adicionales como [atributos de seguridad](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring) y no solo completaciones de chat.

Tenga en cuenta que la `generation_info` será diferente según si está utilizando un modelo gemini o no.

### Modelo Gemini

`generation_info` incluirá:

- `is_blocked`: si la generación se bloqueó o no
- `safety_ratings`: categorías y etiquetas de probabilidad de las calificaciones de seguridad

```python
from pprint import pprint

from langchain_core.messages import HumanMessage
from langchain_google_vertexai import HarmBlockThreshold, HarmCategory
```

```python
human = "Translate this sentence from English to French. I love programming."
messages = [HumanMessage(content=human)]


chat = ChatVertexAI(
    model_name="gemini-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
)

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'citation_metadata': None,
 'is_blocked': False,
 'safety_ratings': [{'blocked': False,
                     'category': 'HARM_CATEGORY_HATE_SPEECH',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_HARASSMENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                     'probability_label': 'NEGLIGIBLE'}],
 'usage_metadata': {'candidates_token_count': 6,
                    'prompt_token_count': 12,
                    'total_token_count': 18}}
```

### Modelo no Gemini

`generation_info` incluirá:

- `is_blocked`: si la generación se bloqueó o no
- `safety_attributes`: un diccionario que asigna atributos de seguridad a sus puntuaciones

```python
chat = ChatVertexAI()  # default is `chat-bison`

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'errors': (),
 'grounding_metadata': {'citations': [], 'search_queries': []},
 'is_blocked': False,
 'safety_attributes': [{'Derogatory': 0.1, 'Insult': 0.1, 'Sexual': 0.2}],
 'usage_metadata': {'candidates_billable_characters': 88.0,
                    'candidates_token_count': 24.0,
                    'prompt_billable_characters': 58.0,
                    'prompt_token_count': 12.0}}
```

## Llamada de herramientas (también conocida como llamada de funciones) con Gemini

Podemos pasar definiciones de herramientas a los modelos Gemini para que el modelo invoque esas herramientas cuando sea apropiado. Esto es útil no solo para el uso de herramientas impulsadas por LLM, sino también para obtener salidas estructuradas de los modelos de manera más general.

Con `ChatVertexAI.bind_tools()`, podemos pasar fácilmente clases Pydantic, esquemas de diccionarios, herramientas de LangChain o incluso funciones como herramientas al modelo. Debajo de la superficie, estos se convierten en un esquema de herramientas Gemini, que se ve así:

```python
{
    "name": "...",  # tool name
    "description": "...",  # tool description
    "parameters": {...}  # tool input schema as JSONSchema
}
```

```python
from langchain.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm = ChatVertexAI(model="gemini-pro", temperature=0)
llm_with_tools = llm.bind_tools([GetWeather])
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'GetWeather', 'arguments': '{"location": "San Francisco, CA"}'}}, response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'citation_metadata': None, 'usage_metadata': {'prompt_token_count': 41, 'candidates_token_count': 7, 'total_token_count': 48}}, id='run-05e760dc-0682-4286-88e1-5b23df69b083-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}])
```

Las llamadas a herramientas se pueden acceder a través del atributo `AIMessage.tool_calls`, donde se extraen en un formato independiente del modelo:

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

Para obtener una guía completa sobre la llamada de herramientas, [vaya aquí](/docs/modules/model_io/chat/function_calling/).

## Salidas estructuradas

Muchas aplicaciones requieren salidas de modelo estructuradas. La llamada de herramientas facilita mucho hacer esto de manera confiable. El constructor [with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) proporciona una interfaz simple basada en la llamada de herramientas para obtener salidas estructuradas de un modelo. Para obtener una guía completa sobre las salidas estructuradas, [vaya aquí](/docs/modules/model_io/chat/structured_output/).

###  ChatVertexAI.with_structured_outputs()

Para obtener salidas estructuradas de nuestro modelo Gemini, todo lo que necesitamos hacer es especificar un esquema deseado, ya sea como una clase Pydantic o como un esquema JSON,

```python
class Person(BaseModel):
    """Save information about a person."""

    name: str = Field(..., description="The person's name.")
    age: int = Field(..., description="The person's age.")


structured_llm = llm.with_structured_output(Person)
structured_llm.invoke("Stefan is already 13 years old")
```

```output
Person(name='Stefan', age=13)
```

### [Legacy] Uso de `create_structured_runnable()`

La forma heredada de obtener salidas estructuradas es usar el constructor `create_structured_runnable`:

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("My name is Erick and I'm 27 years old")
```

## Llamadas asincrónicas

Podemos hacer llamadas asincrónicas a través de la [Interfaz Async](/docs/expression_language/interface) de Runnables.

```python
# for running these examples in the notebook:
import asyncio

import nest_asyncio

nest_asyncio.apply()
```

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="chat-bison", max_tokens=1000, temperature=0.5)
chain = prompt | chat

asyncio.run(
    chain.ainvoke(
        {
            "input_language": "English",
            "output_language": "Sanskrit",
            "text": "I love programming",
        }
    )
)
```

```output
AIMessage(content=' अहं प्रोग्रामनं प्रेमामि')
```

## Llamadas de transmisión

También podemos transmitir salidas a través del método `stream`:

```python
import sys

prompt = ChatPromptTemplate.from_messages(
    [("human", "List out the 5 most populous countries in the world")]
)

chat = ChatVertexAI()

chain = prompt | chat

for chunk in chain.stream({}):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
 The five most populous countries in the world are:
1. China (1.4 billion)
2. India (1.3 billion)
3. United States (331 million)
4. Indonesia (273 million)
5. Pakistan (220 million)
```
