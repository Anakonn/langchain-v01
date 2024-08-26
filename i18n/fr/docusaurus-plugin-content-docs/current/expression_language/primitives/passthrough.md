---
keywords:
- RunnablePassthrough
- LCEL
sidebar_position: 5
title: 'Passthrough: Transmettre les entrées'
translated: true
---

# Transmettre les données

RunnablePassthrough permet de transmettre les entrées telles quelles. Cela est généralement utilisé conjointement avec RunnableParallel pour transmettre des données à une nouvelle clé dans la map.

Voir l'exemple ci-dessous :

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'passed': {'num': 1}, 'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

Comme on le voit ci-dessus, la clé `passed` a été appelée avec `RunnablePassthrough()` et a donc simplement transmis `{'num': 1}`.

Nous avons également défini une deuxième clé dans la map avec `modified`. Cela utilise une lambda pour définir une seule valeur en ajoutant 1 au num, ce qui a donné la clé `modified` avec la valeur `2`.

## Exemple de récupération

Dans l'exemple ci-dessous, nous voyons un cas d'utilisation où nous utilisons `RunnablePassthrough` avec `RunnableParallel`.

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

Ici, l'entrée pour l'invite est censée être une map avec les clés "context" et "question". L'entrée de l'utilisateur est juste la question. Nous devons donc récupérer le contexte à l'aide de notre récupérateur et transmettre l'entrée de l'utilisateur sous la clé "question". Dans ce cas, le RunnablePassthrough nous permet de transmettre la question de l'utilisateur à l'invite et au modèle.
