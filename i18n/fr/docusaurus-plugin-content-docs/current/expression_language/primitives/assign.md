---
keywords:
- RunnablePassthrough
- assign
- LCEL
sidebar_position: 6
title: 'Assign: Add values to state'
translated: true
---

# Ajouter des valeurs à l'état de la chaîne

La méthode statique `RunnablePassthrough.assign(...)` prend une valeur d'entrée et ajoute les arguments supplémentaires passés à la fonction d'assignation.

Cela est utile lorsque vous créez de manière additive un dictionnaire à utiliser comme entrée pour une étape ultérieure, ce qui est un modèle LCEL courant.

Voici un exemple :

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

Examinons ce qui se passe ici.

- L'entrée de la chaîne est `{"num": 1}`. Cela est transmis à un `RunnableParallel`, qui invoque les runnables qui lui sont passés en parallèle avec cette entrée.
- La valeur sous la clé `extra` est invoquée. `RunnablePassthrough.assign()` conserve les clés d'origine dans le dictionnaire d'entrée (`{"num": 1}`), et attribue une nouvelle clé appelée `mult`. La valeur est `lambda x: x["num"] * 3)`, ce qui donne `3`. Ainsi, le résultat est `{"num": 1, "mult": 3}`.
- `{"num": 1, "mult": 3}` est renvoyé à l'appel `RunnableParallel` et est défini comme valeur de la clé `extra`.
- En même temps, la clé `modified` est appelée. Le résultat est `2`, car le lambda extrait une clé appelée `"num"` de son entrée et ajoute un.

Ainsi, le résultat est `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}`.

## Streaming

Une belle fonctionnalité de cette méthode est qu'elle permet aux valeurs de passer dès qu'elles sont disponibles. Pour le montrer, nous utiliserons `RunnablePassthrough.assign()` pour renvoyer immédiatement les documents source dans une chaîne de récupération :

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

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("where did harrison work?")

for chunk in stream:
    print(chunk)
```

```output
{'question': 'where did harrison work?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```

Nous pouvons voir que le premier bloc contient le `"question"` d'origine, car il est immédiatement disponible. Le deuxième bloc contient `"context"` car le récupérateur termine en deuxième. Enfin, la sortie de la `generation_chain` arrive en flux au fur et à mesure qu'elle est disponible.
