---
sidebar_label: Fonctions Ollama
translated: true
---

# Fonctions Ollama

Ce cahier montre comment utiliser un wrapper expérimental autour d'Ollama qui lui donne la même API que les fonctions OpenAI.

Notez que les modèles plus puissants et plus capables performeront mieux avec des schémas complexes et/ou plusieurs fonctions. Les exemples ci-dessous utilisent les modèles llama3 et phi3.
Pour une liste complète des modèles et variantes de modèles pris en charge, voir la [bibliothèque de modèles Ollama](https://ollama.ai/library).

## Configuration

Suivez [ces instructions](https://github.com/jmorganca/ollama) pour configurer et exécuter une instance locale d'Ollama.

## Utilisation

Vous pouvez initialiser OllamaFunctions de manière similaire à la façon dont vous initialiseriez une instance standard de ChatOllama :

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

Vous pouvez ensuite lier des fonctions définies avec des paramètres de schéma JSON et un paramètre `function_call` pour forcer le modèle à appeler la fonction donnée :

```python
model = model.bind_tools(
    tools=[
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, " "e.g. San Francisco, CA",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        }
    ],
    function_call={"name": "get_current_weather"},
)
```

Appeler une fonction avec ce modèle entraîne alors une sortie JSON correspondant au schéma fourni :

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## Sortie structurée

Une chose utile que vous pouvez faire avec l'appel de fonction en utilisant la fonction `with_structured_output()` est d'extraire des propriétés à partir d'une entrée donnée dans un format structuré :

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field


# Schema for structured response
class Person(BaseModel):
    name: str = Field(description="The person's name", required=True)
    height: float = Field(description="The person's height", required=True)
    hair_color: str = Field(description="The person's hair color")


# Prompt template
prompt = PromptTemplate.from_template(
    """Alex is 5 feet tall.
Claudia is 1 feet taller than Alex and jumps higher than him.
Claudia is a brunette and Alex is blonde.

Human: {question}
AI: """
)

# Chain
llm = OllamaFunctions(model="phi3", format="json", temperature=0)
structured_llm = llm.with_structured_output(Person)
chain = prompt | structured_llm
```

### Extraction de données sur Alex

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Extraction de données sur Claudia

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```
