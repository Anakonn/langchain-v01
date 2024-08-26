---
translated: true
---

# Inspeccionar tus ejecutables

Una vez que creas un ejecutable con LCEL, a menudo querrás inspeccionarlo para tener una mejor idea de lo que está sucediendo. Este cuaderno cubre algunos métodos para hacerlo.

Primero, creemos un ejemplo de LCEL. Crearemos uno que realice una recuperación.

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

## Obtener un gráfico

Puedes obtener un gráfico del ejecutable.

```python
chain.get_graph()
```

## Imprimir un gráfico

Si bien eso no es muy legible, puedes imprimirlo para obtener una visualización más fácil de entender.

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

## Obtener los mensajes

Una parte importante de cada cadena son los mensajes que se utilizan. Puedes obtener los mensajes presentes en la cadena:

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```
