---
keywords:
- RunnableParallel
- RunnableMap
- LCEL
sidebar_position: 1
title: 'Parallèle : Formater les données'
translated: true
---

# Formater les entrées et la sortie

Le primitif `RunnableParallel` est essentiellement un dictionnaire dont les valeurs sont des runnables (ou des choses qui peuvent être converties en runnables, comme des fonctions). Il exécute toutes ses valeurs en parallèle, et chaque valeur est appelée avec l'entrée globale du `RunnableParallel`. La valeur de retour finale est un dictionnaire avec les résultats de chaque valeur sous sa clé appropriée.

Il est utile pour paralléliser les opérations, mais peut également être utile pour manipuler la sortie d'un Runnable afin qu'elle corresponde au format d'entrée du Runnable suivant dans une séquence.

Ici, l'entrée de l'invite est censée être une carte avec les clés "context" et "question". L'entrée de l'utilisateur est juste la question. Nous devons donc récupérer le contexte à l'aide de notre récupérateur et transmettre l'entrée de l'utilisateur sous la clé "question".

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("where did harrison work?")
```

```output
'Harrison worked at Kensho.'
```

::: {.callout-tip}
Notez que lors de la composition d'un RunnableParallel avec un autre Runnable, nous n'avons même pas besoin d'envelopper notre dictionnaire dans la classe RunnableParallel - la conversion de type est gérée pour nous. Dans le contexte d'une chaîne, ces deux éléments sont équivalents :
:::

```python
{"context": retriever, "question": RunnablePassthrough()}
```

```python
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```python
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

## Utiliser itemgetter comme raccourci

Notez que vous pouvez utiliser `itemgetter` de Python comme raccourci pour extraire des données de la carte lors de la combinaison avec `RunnableParallel`. Vous pouvez trouver plus d'informations sur itemgetter dans la [documentation Python](https://docs.python.org/3/library/operator.html#operator.itemgetter).

Dans l'exemple ci-dessous, nous utilisons itemgetter pour extraire des clés spécifiques de la carte :

```python
from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}

Answer in the following language: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "where did harrison work", "language": "italian"})
```

```output
'Harrison ha lavorato a Kensho.'
```

## Paralléliser les étapes

RunnableParallel (alias RunnableMap) facilite l'exécution de plusieurs Runnables en parallèle et le retour de la sortie de ces Runnables sous forme de carte.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
poem_chain = (
    ChatPromptTemplate.from_template("write a 2-line poem about {topic}") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "bear"})
```

```output
{'joke': AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 'poem': AIMessage(content="In the wild's embrace, bear roams free,\nStrength and grace, a majestic decree.")}
```

## Parallélisme

RunnableParallel est également utile pour exécuter des processus indépendants en parallèle, car chaque Runnable de la carte est exécuté en parallèle. Par exemple, nous pouvons voir que nos chaînes `joke_chain`, `poem_chain` et `map_chain` ont à peu près le même temps d'exécution, même si `map_chain` exécute les deux autres.

```python
%%timeit

joke_chain.invoke({"topic": "bear"})
```

```output
958 ms ± 402 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "bear"})
```

```output
1.22 s ± 508 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "bear"})
```

```output
1.15 s ± 119 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
