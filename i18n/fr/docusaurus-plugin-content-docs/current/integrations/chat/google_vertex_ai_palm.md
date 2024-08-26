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

Note: Ceci est séparé de l'intégration Google PaLM. Google a choisi d'offrir une version entreprise de PaLM via GCP, et cela prend en charge les modèles disponibles via ce biais.

ChatVertexAI expose tous les modèles fondamentaux disponibles dans Google Cloud :

- Gemini (`gemini-pro` et `gemini-pro-vision`)
- PaLM 2 pour le Texte (`text-bison`)
- Codey pour la génération de code (`codechat-bison`)

Pour une liste complète et mise à jour des modèles disponibles, visitez [la documentation VertexAI](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview).

Par défaut, Google Cloud [n'utilise pas](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) les données des clients pour entraîner ses modèles fondamentaux dans le cadre de l'engagement de confidentialité AI/ML de Google Cloud. Plus de détails sur la façon dont Google traite les données se trouvent également dans [l'Addendum sur le traitement des données des clients de Google (CDPA)](https://cloud.google.com/terms/data-processing-addendum).

Pour utiliser `Google Cloud Vertex AI` PaLM, vous devez avoir le paquet Python `langchain-google-vertexai` installé et soit :
- Avoir des identifiants configurés pour votre environnement (gcloud, identité de la charge de travail, etc.)
- Stocker le chemin vers un fichier JSON de compte de service en tant que variable d'environnement GOOGLE_APPLICATION_CREDENTIALS

Cette base de code utilise la bibliothèque `google.auth` qui recherche d'abord la variable des identifiants de l'application mentionnée ci-dessus, puis recherche l'authentification au niveau du système.

Pour plus d'informations, voir :
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

Gemini ne prend pas en charge SystemMessage pour le moment, mais il peut être ajouté au premier message humain de la ligne. Si vous souhaitez ce comportement, il suffit de définir `convert_system_message_to_human` à `True` :

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

Si nous voulons construire une chaîne simple qui prend des paramètres spécifiés par l'utilisateur :

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

## Modèles de chat pour la génération de code

Vous pouvez maintenant exploiter l'API Codey pour le chat de code au sein de Vertex AI. Le modèle disponible est :
- `codechat-bison` : pour l'assistance au code

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

## Informations complètes sur la génération

Nous pouvons utiliser la méthode `generate` pour obtenir des métadonnées supplémentaires comme les [attributs de sécurité](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring) et pas seulement des complétions de chat.

Notez que `generation_info` sera différent selon que vous utilisez un modèle gemini ou non.

### Modèle Gemini

`generation_info` inclura :

- `is_blocked` : si la génération a été bloquée ou non
- `safety_ratings` : catégories des évaluations de sécurité et étiquettes de probabilité

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

### Modèle non-gemini

`generation_info` inclura :

- `is_blocked` : si la génération a été bloquée ou non
- `safety_attributes` : un dictionnaire associant les attributs de sécurité à leurs scores

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

## Appel d'outils (a.k.a. appel de fonction) avec Gemini

Nous pouvons passer des définitions d'outils aux modèles Gemini pour que le modèle invoque ces outils lorsque c'est approprié. Cela est utile non seulement pour l'utilisation des outils alimentés par LLM, mais aussi pour obtenir des sorties structurées des modèles de manière plus générale.

Avec `ChatVertexAI.bind_tools()`, nous pouvons facilement passer des classes Pydantic, des schémas dict, des outils LangChain, ou même des fonctions en tant qu'outils au modèle. En interne, ceux-ci sont convertis en un schéma d'outil Gemini, qui ressemble à :

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

Les appels d'outils peuvent être accessibles via l'attribut `AIMessage.tool_calls`, où ils sont extraits dans un format indépendant du modèle :

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

Pour un guide complet sur l'appel d'outils [allez ici](/docs/modules/model_io/chat/function_calling/).

## Sorties structurées

De nombreuses applications nécessitent des sorties structurées de modèles. L'appel d'outils facilite grandement cette tâche de manière fiable. Le constructeur [with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) fournit une interface simple construite sur l'appel d'outils pour obtenir des sorties structurées d'un modèle. Pour un guide complet sur les sorties structurées [allez ici](/docs/modules/model_io/chat/structured_output/).

###  ChatVertexAI.with_structured_outputs()

Pour obtenir des sorties structurées de notre modèle Gemini, il nous suffit de spécifier un schéma souhaité, soit comme une classe Pydantic ou comme un schéma JSON,

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

### [Héritage] Utilisation de `create_structured_runnable()`

La méthode héritée pour obtenir des sorties structurées est d'utiliser le constructeur `create_structured_runnable` :

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("My name is Erick and I'm 27 years old")
```

## Appels asynchrones

Nous pouvons faire des appels asynchrones via les Runnables [Interface Async](/docs/expression_language/interface).

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

## Appels en streaming

Nous pouvons également diffuser des sorties via la méthode `stream` :

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
