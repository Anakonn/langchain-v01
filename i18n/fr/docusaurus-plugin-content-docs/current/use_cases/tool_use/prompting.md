---
sidebar_position: 3
translated: true
---

# Utilisation de modèles qui ne prennent pas en charge l'appel d'outils

Dans ce guide, nous allons construire une chaîne qui ne s'appuie sur aucune API de modèle spéciale (comme l'appel d'outils, que nous avons montré dans le [Démarrage rapide](/docs/use_cases/tool_use/quickstart)) et qui se contente d'inviter directement le modèle à invoquer des outils.

## Configuration

Nous devrons installer les packages suivants :

```python
%pip install --upgrade --quiet langchain langchain-openai
```

Et définir ces variables d'environnement :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Créer un outil

Tout d'abord, nous devons créer un outil à appeler. Pour cet exemple, nous créerons un outil personnalisé à partir d'une fonction. Pour plus d'informations sur tous les détails liés à la création d'outils personnalisés, veuillez consulter [ce guide](/docs/modules/tools/).

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(first_int: int, second_int: int) -> int - Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```

```output
20
```

## Création de notre invite

Nous voudrons écrire une invite qui spécifie les outils auxquels le modèle a accès, les arguments de ces outils et le format de sortie souhaité du modèle. Dans ce cas, nous lui demanderons de produire un blob JSON de la forme `{"name": "...", "arguments": {...}}`.

```python
from langchain.tools.render import render_text_description

rendered_tools = render_text_description([multiply])
rendered_tools
```

```output
'multiply: multiply(first_int: int, second_int: int) -> int - Multiply two integers together.'
```

```python
from langchain_core.prompts import ChatPromptTemplate

system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```

## Ajout d'un analyseur de sortie

Nous utiliserons le `JsonOutputParser` pour analyser la sortie de nos modèles en JSON.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "what's thirteen times 4"})
```

```output
{'name': 'multiply', 'arguments': {'first_int': 13, 'second_int': 4}}
```

## Invoquer l'outil

Nous pouvons invoquer l'outil dans le cadre de la chaîne en transmettant les "arguments" générés par le modèle :

```python
from operator import itemgetter

chain = prompt | model | JsonOutputParser() | itemgetter("arguments") | multiply
chain.invoke({"input": "what's thirteen times 4"})
```

```output
52
```

## Choisir parmi plusieurs outils

Supposons que nous ayons plusieurs outils parmi lesquels la chaîne doit pouvoir choisir :

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent
```

Avec l'appel de fonction, nous pouvons faire cela comme suit :

Si nous voulons exécuter l'outil sélectionné par le modèle, nous pouvons le faire en utilisant une fonction qui renvoie l'outil en fonction de la sortie du modèle. Plus précisément, notre fonction renverra sa propre sous-chaîne qui récupérera la partie "arguments" de la sortie du modèle et la transmettra à l'outil choisi :

```python
tools = [add, exponentiate, multiply]


def tool_chain(model_output):
    tool_map = {tool.name: tool for tool in tools}
    chosen_tool = tool_map[model_output["name"]]
    return itemgetter("arguments") | chosen_tool
```

```python
rendered_tools = render_text_description(tools)
system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)

chain = prompt | model | JsonOutputParser() | tool_chain
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
1135
```

## Retourner les entrées des outils

Il peut être utile de renvoyer non seulement les sorties des outils, mais aussi leurs entrées. Nous pouvons facilement le faire avec LCEL en `RunnablePassthrough.assign`-ant la sortie de l'outil. Cela prendra tout ce qui est l'entrée des composants RunnablePassrthrough (supposé être un dictionnaire) et y ajoutera une clé tout en transmettant tout ce qui se trouve actuellement dans l'entrée :

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=tool_chain)
)
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
{'name': 'add',
 'arguments': {'first_int': 3, 'second_int': 1132},
 'output': 1135}
```
