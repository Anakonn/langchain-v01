---
translated: true
---

# Inspectez vos exécutables

Une fois que vous avez créé un exécutable avec LCEL, vous voudrez souvent l'inspecter pour mieux comprendre ce qui se passe. Ce notebook couvre quelques méthodes pour le faire.

Tout d'abord, créons un exemple de LCEL. Nous en créerons un qui fait de la récupération.

```python
%pip install --upgrade --quiet  langchain langchain-openai faiss-cpu tiktoken
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
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
```

```python
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## Obtenir un graphique

Vous pouvez obtenir un graphique de l'exécutable.

```python
chain.get_graph()
```

## Imprimer un graphique

Bien que cela ne soit pas très lisible, vous pouvez l'imprimer pour obtenir un affichage plus facile à comprendre.

```python
chain.get_graph().print_ascii()
```

```output
           +---------------------------------+
           | Parallel<context,question>Input |
           +---------------------------------+
                    **               **
                 ***                   ***
               **                         **
+----------------------+              +-------------+
| VectorStoreRetriever |              | Passthrough |
+----------------------+              +-------------+
                    **               **
                      ***         ***
                         **     **
           +----------------------------------+
           | Parallel<context,question>Output |
           +----------------------------------+
                             *
                             *
                             *
                  +--------------------+
                  | ChatPromptTemplate |
                  +--------------------+
                             *
                             *
                             *
                      +------------+
                      | ChatOpenAI |
                      +------------+
                             *
                             *
                             *
                   +-----------------+
                   | StrOutputParser |
                   +-----------------+
                             *
                             *
                             *
                +-----------------------+
                | StrOutputParserOutput |
                +-----------------------+
```

## Obtenir les invites

Une partie importante de chaque chaîne est les invites qui sont utilisées. Vous pouvez obtenir les invites présentes dans la chaîne :

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```
