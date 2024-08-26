---
sidebar_position: 3
title: Démarrage rapide
translated: true
---

Les modèles de langage produisent du texte. Mais bien souvent, vous voudrez obtenir des informations plus structurées que du simple texte. C'est là qu'interviennent les analyseurs de sortie.

Les analyseurs de sortie sont des classes qui permettent de structurer les réponses des modèles de langage. Il existe deux méthodes principales qu'un analyseur de sortie doit implémenter :

- "Obtenir les instructions de format" : Une méthode qui renvoie une chaîne de caractères contenant les instructions sur la façon dont la sortie d'un modèle de langage doit être formatée.
- "Analyser" : Une méthode qui prend en entrée une chaîne de caractères (supposée être la réponse d'un modèle de langage) et l'analyse pour la transformer en une structure.

Et une autre optionnelle :

- "Analyser avec l'invite" : Une méthode qui prend en entrée une chaîne de caractères (supposée être la réponse d'un modèle de langage) et une invite (supposée être l'invite qui a généré cette réponse) et l'analyse pour la transformer en une structure. L'invite est principalement fournie au cas où l'OutputParser voudrait réessayer ou corriger la sortie d'une certaine manière, et aurait besoin d'informations provenant de l'invite pour le faire.

## Démarrer

Ci-dessous, nous passons en revue le principal type d'analyseur de sortie, le `PydanticOutputParser`.

```python
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

## LCEL

Les analyseurs de sortie implémentent l'[interface Runnable](/docs/expression_language/interface), le bloc de construction de base du [LangChain Expression Language (LCEL)](/docs/expression_language/). Cela signifie qu'ils prennent en charge les appels `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

Les analyseurs de sortie acceptent une chaîne de caractères ou un `BaseMessage` en entrée et peuvent renvoyer un type arbitraire.

```python
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

Au lieu d'invoquer manuellement l'analyseur, nous aurions également pu l'ajouter à notre séquence `Runnable` :

```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

Bien que tous les analyseurs prennent en charge l'interface de diffusion en continu, seuls certains analyseurs peuvent diffuser des objets partiellement analysés, car cela dépend fortement du type de sortie. Les analyseurs qui ne peuvent pas construire d'objets partiels se contenteront de renvoyer la sortie entièrement analysée.

Le `SimpleJsonOutputParser` par exemple peut diffuser des sorties partielles :

```python
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```

```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```

```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```

Tandis que le PydanticOutputParser ne le peut pas :

```python
list(chain.stream({"query": "Tell me a joke."}))
```

```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```
