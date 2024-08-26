---
translated: true
---

# Outils OpenAI

Ces analyseurs de sortie extraient les appels d'outils des réponses de l'API d'appel de fonction d'OpenAI. Cela signifie qu'ils ne sont utilisables qu'avec les modèles qui prennent en charge l'appel de fonction, et plus précisément les derniers paramètres `tools` et `tool_choice`. Nous vous recommandons de vous familiariser avec [l'appel de fonction](/docs/modules/model_io/chat/function_calling) avant de lire ce guide.

Il existe plusieurs variantes d'analyseurs de sortie :

- [JsonOutputToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputToolsParser) : Renvoie les arguments de l'appel de fonction sous forme de JSON
- [JsonOutputKeyToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser) : Renvoie la valeur d'une clé spécifique dans l'appel de fonction sous forme de JSON
- [PydanticToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html#langchain_core.output_parsers.openai_tools.PydanticToolsParser) : Renvoie les arguments de l'appel de fonction sous forme de modèle Pydantic

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
```

```python
model.kwargs["tools"]
```

```output
[{'type': 'function',
  'function': {'name': 'Joke',
   'description': 'Joke to tell user.',
   'parameters': {'type': 'object',
    'properties': {'setup': {'description': 'question to set up a joke',
      'type': 'string'},
     'punchline': {'description': 'answer to resolve the joke',
      'type': 'string'}},
    'required': ['setup', 'punchline']}}}]
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputToolsParser

```python
from langchain.output_parsers.openai_tools import JsonOutputToolsParser
```

```python
parser = JsonOutputToolsParser()
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'}}]
```

Pour inclure l'identifiant de l'appel d'outil, nous pouvons spécifier `return_id=True` :

```python
parser = JsonOutputToolsParser(return_id=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'},
  'id': 'call_Isuoh0RTeQzzOKGg5QlQ7UqI'}]
```

## JsonOutputKeyToolsParser

Cela extrait simplement une seule clé de la réponse renvoyée. Cela est utile lorsque vous passez un seul outil et que vous voulez juste ses arguments.

```python
from typing import List

from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser
```

```python
parser = JsonOutputKeyToolsParser(key_name="Joke")
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'}]
```

Certains modèles peuvent renvoyer plusieurs invocations d'outils à chaque appel, donc par défaut la sortie est une liste. Si nous voulons juste renvoyer la première invocation d'outil, nous pouvons spécifier `first_tool_only=True`

```python
parser = JsonOutputKeyToolsParser(key_name="Joke", first_tool_only=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## PydanticToolsParser

Cela s'appuie sur `JsonOutputToolsParser` mais passe les résultats à un modèle Pydantic. Cela permet une validation supplémentaire si vous le souhaitez.

```python
from langchain.output_parsers.openai_tools import PydanticToolsParser
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


parser = PydanticToolsParser(tools=[Joke])
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')]
```
