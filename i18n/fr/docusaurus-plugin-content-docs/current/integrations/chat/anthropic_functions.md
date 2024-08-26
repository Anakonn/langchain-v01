---
sidebar_class_name: hidden
translated: true
---

# [Déprécié] Wrapper expérimental des outils Anthropic

::: {.callout-warning}

L'API Anthropic prend officiellement en charge l'appel d'outils, donc ce contournement n'est plus nécessaire. Veuillez utiliser [ChatAnthropic](/docs/integrations/chat/anthropic) avec `langchain-anthropic>=0.1.5`.

:::

Ce notebook montre comment utiliser un wrapper expérimental autour d'Anthropic qui lui donne des capacités d'appel d'outils et de sortie structurée. Il suit le guide d'Anthropic [ici](https://docs.anthropic.com/claude/docs/functions-external-tools)

Le wrapper est disponible à partir du package `langchain-anthropic`, et il nécessite également la dépendance optionnelle `defusedxml` pour analyser la sortie XML du llm.

Remarque : il s'agit d'une fonctionnalité bêta qui sera remplacée par la mise en œuvre officielle d'Anthropic de l'appel d'outils, mais elle est utile pour les tests et l'expérimentation en attendant.

```python
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## Liaison d'outils

`ChatAnthropicTools` expose une méthode `bind_tools` qui vous permet de passer des modèles Pydantic ou des BaseTools à l'llm.

```python
from langchain_core.pydantic_v1 import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("I am a 27 year old named Erick")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```

## Sortie structurée

`ChatAnthropicTools` implémente également la spécification [`with_structured_output`](/docs/modules/model_io/chat/structured_output) pour extraire les valeurs. Remarque : cela peut ne pas être aussi stable que les modèles qui offrent explicitement l'appel d'outils.

```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("I am a 27 year old named Erick")
```

```output
Person(name='Erick', age=27)
```
