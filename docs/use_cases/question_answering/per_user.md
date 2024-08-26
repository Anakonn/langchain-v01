---
canonical: https://python.langchain.com/v0.1/docs/use_cases/question_answering/per_user
sidebar_position: 4
translated: false
---

# Per-User Retrieval

When building a retrieval app, you often have to build it with multiple users in mind. This means that you may be storing data not just for one user, but for many different users, and they should not be able to see eachother's data. This means that you need to be able to configure your retrieval chain to only retrieve certain information. This generally involves two steps.

**Step 1: Make sure the retriever you are using supports multiple users**

At the moment, there is no unified flag or filter for this in LangChain. Rather, each vectorstore and retriever may have their own, and may be called different things (namespaces, multi-tenancy, etc). For vectorstores, this is generally exposed as a keyword argument that is passed in during `similarity_search`. By reading the documentation or source code, figure out whether the retriever you are using supports multiple users, and, if so, how to use it.

Note: adding documentation and/or support for multiple users for retrievers that do not support it (or document it) is a GREAT way to contribute to LangChain

**Step 2: Add that parameter as a configurable field for the chain**

This will let you easily call the chain and configure any relevant flags at runtime. See [this documentation](/docs/expression_language/primitives/configure) for more information on configuration.

**Step 3: Call the chain with that configurable field**

Now, at runtime you can call this chain with configurable field.

## Code Example

Let's see a concrete example of what this looks like in code. We will use Pinecone for this example.

To configure Pinecone, set the following environment variable:

- `PINECONE_API_KEY`: Your Pinecone API key

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

The pinecone kwarg for `namespace` can be used to separate documents

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

We can now create the chain that we will use to do question-answering over

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

This is basic question-answering chain set up.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

Here we mark the retriever as having a configurable field. All vectorstore retrievers have `search_kwargs` as a field. This is just a dictionary, with vectorstore specific fields

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

We can now create the chain using our configurable retriever

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

We can now invoke the chain with configurable options. `search_kwargs` is the id of the configurable field. The value is the search kwargs to use for Pinecone

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

For more vectorstore implementations for multi-user, please refer to specific pages, such as [Milvus](/docs/integrations/vectorstores/milvus).