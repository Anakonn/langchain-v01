---
sidebar_position: 0
title: Prompt + LLM
translated: true
---

La composition la plus courante et la plus précieuse consiste à prendre :

``PromptTemplate`` / ``ChatPromptTemplate`` -> ``LLM`` / ``ChatModel`` -> ``OutputParser``

Presque toutes les autres chaînes que vous construirez utiliseront ce bloc de construction.

## PromptTemplate + LLM

La composition la plus simple consiste simplement à combiner un prompt et un modèle pour créer une chaîne qui prend l'entrée de l'utilisateur, l'ajoute à un prompt, la transmet à un modèle et renvoie la sortie brute du modèle.

Remarque, vous pouvez mélanger et assortir PromptTemplate/ChatPromptTemplates et LLMs/ChatModels comme bon vous semble ici.
%pip install --upgrade --quiet  langchain langchain-openai

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a joke about {foo}")
model = ChatOpenAI()
chain = prompt | model
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", additional_kwargs={}, example=False)
```

Souvent, nous voulons attacher des kwargs qui seront transmis à chaque appel de modèle. Voici quelques exemples de cela :

### Attacher des séquences d'arrêt

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content='Why did the bear never wear shoes?', additional_kwargs={}, example=False)
```

### Attacher les informations d'appel de fonction

```python
functions = [
    {
        "name": "joke",
        "description": "A joke",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "The setup for the joke"},
                "punchline": {
                    "type": "string",
                    "description": "The punchline for the joke",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "bears"}, config={})
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'joke', 'arguments': '{\n  "setup": "Why don\'t bears wear shoes?",\n  "punchline": "Because they have bear feet!"\n}'}}, example=False)
```

## PromptTemplate + LLM + OutputParser

Nous pouvons également ajouter un analyseur de sortie pour transformer facilement la sortie brute LLM/ChatModel en un format plus exploitable

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

Notez que cela renvoie maintenant une chaîne - un format beaucoup plus exploitable pour les tâches en aval

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?\n\nBecause they have bear feet!"
```

### Analyseur de sortie de fonctions

Lorsque vous spécifiez la fonction à renvoyer, vous voudrez peut-être l'analyser directement

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
{'setup': "Why don't bears like fast food?",
 'punchline': "Because they can't catch it!"}
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?"
```

## Simplifier l'entrée

Pour rendre l'invocation encore plus simple, nous pouvons ajouter un `RunnableParallel` pour nous occuper de la création du dictionnaire d'entrée du prompt :

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

map_ = RunnableParallel(foo=RunnablePassthrough())
chain = (
    map_
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears wear shoes?"
```

Puisque nous composons notre map avec un autre Runnable, nous pouvons même utiliser un peu de sucre syntaxique et utiliser simplement un dictionnaire :

```python
chain = (
    {"foo": RunnablePassthrough()}
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears like fast food?"
```
