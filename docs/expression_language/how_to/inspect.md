---
canonical: https://python.langchain.com/v0.1/docs/expression_language/how_to/inspect
translated: false
---

# Inspect your runnables

Once you create a runnable with LCEL, you may often want to inspect it to get a better sense for what is going on. This notebook covers some methods for doing so.

First, let's create an example LCEL. We will create one that does retrieval

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

## Get a graph

You can get a graph of the runnable

```python
chain.get_graph()
```

## Print a graph

While that is not super legible, you can print it to get a display that's easier to understand

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

## Get the prompts

An important part of every chain is the prompts that are used. You can get the prompts present in the chain:

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```