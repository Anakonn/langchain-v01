---
sidebar_class_name: hidden
sidebar_position: 4
translated: true
---

# Outils

Les outils sont des interfaces qu'un agent, une chaîne ou un LLM peuvent utiliser pour interagir avec le monde.
Ils combinent plusieurs éléments :

1. Le nom de l'outil
2. Une description de ce qu'est l'outil
3. Le schéma JSON des entrées de l'outil
4. La fonction à appeler
5. Si le résultat d'un outil doit être retourné directement à l'utilisateur

Il est utile d'avoir toutes ces informations car elles peuvent être utilisées pour construire des systèmes d'action ! Le nom, la description et le schéma JSON peuvent être utilisés pour inciter le LLM à savoir quelle action effectuer, puis la fonction à appeler est équivalente à exécuter cette action.

Plus l'entrée d'un outil est simple, plus il est facile pour un LLM de l'utiliser.
De nombreux agents ne fonctionneront qu'avec des outils ayant une seule entrée de type chaîne.
Pour une liste des types d'agents et de ceux qui fonctionnent avec des entrées plus compliquées, veuillez consulter [cette documentation](../agents/agent_types)

Il est important que le nom, la description et le schéma JSON (s'il est utilisé) soient tous utilisés dans l'invite. Par conséquent, il est très important qu'ils soient clairs et décrivent exactement comment l'outil doit être utilisé. Vous devrez peut-être changer le nom, la description ou le schéma JSON par défaut si le LLM ne comprend pas comment utiliser l'outil.

## Outils par Défaut

Voyons comment travailler avec les outils. Pour ce faire, nous allons utiliser un outil intégré.

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```

Maintenant, nous initialisons l'outil. C'est ici que nous pouvons le configurer à notre guise

```python
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
```

Ceci est le nom par défaut

```python
tool.name
```

```output
'Wikipedia'
```

Ceci est la description par défaut

```python
tool.description
```

```output
'A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.'
```

Ceci est le schéma JSON par défaut des entrées

```python
tool.args
```

```output
{'query': {'title': 'Query', 'type': 'string'}}
```

Nous pouvons voir si l'outil doit retourner directement à l'utilisateur

```python
tool.return_direct
```

```output
False
```

Nous pouvons appeler cet outil avec une entrée de type dictionnaire

```python
tool.run({"query": "langchain"})
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

Nous pouvons également appeler cet outil avec une seule entrée de type chaîne.
Nous pouvons le faire car cet outil n'attend qu'une seule entrée.
S'il nécessitait plusieurs entrées, nous ne pourrions pas le faire.

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## Personnaliser les Outils par Défaut

Nous pouvons également modifier le nom, la description et le schéma JSON des arguments intégrés.

Lors de la définition du schéma JSON des arguments, il est important que les entrées restent les mêmes que la fonction, donc vous ne devriez pas changer cela. Mais vous pouvez facilement définir des descriptions personnalisées pour chaque entrée.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
```

```python
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
```

```python
tool.name
```

```output
'wiki-tool'
```

```python
tool.description
```

```output
'look up things in wikipedia'
```

```python
tool.args
```

```output
{'query': {'title': 'Query',
  'description': 'query to look up in Wikipedia, should be 3 or less words',
  'type': 'string'}}
```

```python
tool.return_direct
```

```output
True
```

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## Plus de Sujets

Ceci était une brève introduction aux outils dans LangChain, mais il y a beaucoup plus à apprendre

**[Outils Intégrés](/docs/integrations/tools/)** : Pour une liste de tous les outils intégrés, consultez [cette page](/docs/integrations/tools/)

**[Outils Personnalisés](./custom_tools)** : Bien que les outils intégrés soient utiles, il est très probable que vous deviez définir vos propres outils. Consultez [ce guide](./custom_tools) pour des instructions sur comment le faire.

**[Trousses d'Outils](./toolkits)** : Les trousses d'outils sont des collections d'outils qui fonctionnent bien ensemble. Pour une description plus approfondie ainsi qu'une liste de toutes les trousses d'outils intégrées, consultez [cette page](./toolkits)

**[Outils en tant que Fonctions OpenAI](./tools_as_openai_functions)** : Les outils sont très similaires aux Fonctions OpenAI, et peuvent facilement être convertis dans ce format. Consultez [ce notebook](./tools_as_openai_functions) pour des instructions sur comment le faire.
