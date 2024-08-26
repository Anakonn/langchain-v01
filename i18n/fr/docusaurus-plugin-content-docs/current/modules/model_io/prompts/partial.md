---
sidebar_position: 4
translated: true
---

# Modèles de prompts partiels

Comme d'autres méthodes, il peut être judicieux de "partialiser" un modèle de prompt - par exemple, passer un sous-ensemble des valeurs requises, afin de créer un nouveau modèle de prompt qui n'attend que le sous-ensemble restant des valeurs.

LangChain prend en charge cela de deux manières :
1. Formatage partiel avec des valeurs de chaîne de caractères.
2. Formatage partiel avec des fonctions qui renvoient des valeurs de chaîne de caractères.

Ces deux manières différentes prennent en charge différents cas d'utilisation. Dans les exemples ci-dessous, nous passons en revue les motivations pour les deux cas d'utilisation ainsi que la manière de le faire dans LangChain.

## Partiel avec des chaînes de caractères

Un cas d'utilisation courant pour vouloir partialiser un modèle de prompt est si vous obtenez certaines des variables avant d'autres. Par exemple, supposons que vous avez un modèle de prompt qui nécessite deux variables, `foo` et `baz`. Si vous obtenez la valeur de `foo` tôt dans la chaîne, mais la valeur de `baz` plus tard, il peut être ennuyeux d'attendre d'avoir les deux variables au même endroit pour les passer au modèle de prompt. Au lieu de cela, vous pouvez partialiser le modèle de prompt avec la valeur de `foo`, puis passer le modèle de prompt partialisé et juste l'utiliser. Voici un exemple de ce processus :

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```

```output
foobaz
```

Vous pouvez également initialiser directement le prompt avec les variables partialisées.

```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```

```output
foobaz
```

## Partiel avec des fonctions

L'autre utilisation courante est de partialiser avec une fonction. Le cas d'utilisation pour cela est lorsque vous avez une variable que vous savez que vous voulez toujours récupérer de manière commune. Un exemple parfait de cela est avec la date ou l'heure. Imaginez que vous avez un prompt pour lequel vous voulez toujours avoir la date actuelle. Vous ne pouvez pas la coder en dur dans le prompt, et la passer avec les autres variables d'entrée est un peu ennuyeux. Dans ce cas, il est très pratique de pouvoir partialiser le prompt avec une fonction qui renvoie toujours la date actuelle.

```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")
```

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:22
```

Vous pouvez également initialiser directement le prompt avec les variables partialisées, ce qui a souvent plus de sens dans ce flux de travail.

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:36
```
