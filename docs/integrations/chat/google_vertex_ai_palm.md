---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/google_vertex_ai_palm
keywords:
- gemini
- vertex
- ChatVertexAI
- gemini-pro
sidebar_label: Google Cloud Vertex AI
translated: false
---

# ChatVertexAI

Note: This is separate from the Google PaLM integration. Google has chosen to offer an enterprise version of PaLM through GCP, and this supports the models made available through there.

ChatVertexAI exposes all foundational models available in Google Cloud:

- Gemini (`gemini-pro` and `gemini-pro-vision`)
- PaLM 2 for Text (`text-bison`)
- Codey for Code Generation (`codechat-bison`)

For a full and updated list of available models visit [VertexAI documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview).

By default, Google Cloud [does not use](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) customer data to train its foundation models as part of Google Cloud`s AI/ML Privacy Commitment. More details about how Google processes data can also be found in [Google's Customer Data Processing Addendum (CDPA)](https://cloud.google.com/terms/data-processing-addendum).

To use `Google Cloud Vertex AI` PaLM you must have the `langchain-google-vertexai` Python package installed and either:
- Have credentials configured for your environment (gcloud, workload identity, etc...)
- Store the path to a service account JSON file as the GOOGLE_APPLICATION_CREDENTIALS environment variable

This codebase uses the `google.auth` library which first looks for the application credentials variable mentioned above, and then looks for system-level auth.

For more information, see:
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

Gemini doesn't support SystemMessage at the moment, but it can be added to the first human message in the row. If you want such behavior, just set the `convert_system_message_to_human` to `True`:

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

If we want to construct a simple chain that takes user specified parameters:

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

## Code generation chat models

You can now leverage the Codey API for code chat within Vertex AI. The model available is:
- `codechat-bison`: for code assistance

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

## Full generation info

We can use the `generate` method to get back extra metadata like [safety attributes](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring) and not just chat completions

Note that the `generation_info` will be different depending if you're using a gemini model or not.

### Gemini model

`generation_info` will include:

- `is_blocked`: whether generation was blocked or not
- `safety_ratings`: safety ratings' categories and probability labels

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

### Non-gemini model

`generation_info` will include:

- `is_blocked`: whether generation was blocked or not
- `safety_attributes`: a dictionary mapping safety attributes to their scores

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

## Tool calling (a.k.a. function calling) with Gemini

We can pass tool definitions to Gemini models to get the model to invoke those tools when appropriate. This is useful not only for LLM-powered tool use but also for getting structured outputs out of models more generally.

With `ChatVertexAI.bind_tools()`, we can easily pass in Pydantic classes, dict schemas, LangChain tools, or even functions as tools to the model. Under the hood these are converted to a Gemini tool schema, which looks like:

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

The tool calls can be access via the `AIMessage.tool_calls` attribute, where they are extracted in a model-agnostic format:

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

For a complete guide on tool calling [head here](/docs/modules/model_io/chat/function_calling/).

## Structured outputs

Many applications require structured model outputs. Tool calling makes it much easier to do this reliably. The [with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) constructor provides a simple interface built on top of tool calling for getting structured outputs out of a model. For a complete guide on structured outputs [head here](/docs/modules/model_io/chat/structured_output/).

###  ChatVertexAI.with_structured_outputs()

To get structured outputs from our Gemini model all we need to do is to specify a desired schema, either as a Pydantic class or as a JSON schema,

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

### [Legacy] Using `create_structured_runnable()`

The legacy wasy to get structured outputs is using the `create_structured_runnable` constructor:

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("My name is Erick and I'm 27 years old")
```

## Asynchronous calls

We can make asynchronous calls via the Runnables [Async Interface](/docs/expression_language/interface).

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

## Streaming calls

We can also stream outputs via the `stream` method:

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