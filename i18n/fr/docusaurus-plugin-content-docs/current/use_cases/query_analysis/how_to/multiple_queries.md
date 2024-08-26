---
sidebar_position: 4
translated: true
---

# Gérer plusieurs requêtes

Parfois, une technique d'analyse de requête peut permettre de générer plusieurs requêtes. Dans ces cas, nous devons nous rappeler d'exécuter toutes les requêtes, puis de combiner les résultats. Nous allons montrer un exemple simple (en utilisant des données factices) de la façon de procéder.

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

#### Définir les variables d'environnement

Nous utiliserons OpenAI dans cet exemple :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Créer un index

Nous allons créer un vectorstore sur de fausses informations.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho", "Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## Analyse des requêtes

Nous utiliserons l'appel de fonction pour structurer la sortie. Nous la laisserons retourner plusieurs requêtes.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    queries: List[str] = Field(
        ...,
        description="Distinct queries to search for",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information.

If you need to look up two distinct pieces of information, you are allowed to do that!"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

Nous pouvons voir que cela permet de créer plusieurs requêtes

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(queries=['Harrison work location'])
```

```python
query_analyzer.invoke("where did Harrison and ankush Work")
```

```output
Search(queries=['Harrison work place', 'Ankush work place'])
```

## Récupération avec analyse des requêtes

Alors, comment inclurions-nous cela dans une chaîne ? Une chose qui facilitera beaucoup les choses est si nous appelons notre récupérateur de manière asynchrone - cela nous permettra de parcourir les requêtes et de ne pas être bloqués sur le temps de réponse.

```python
from langchain_core.runnables import chain
```

```python
@chain
async def custom_chain(question):
    response = await query_analyzer.ainvoke(question)
    docs = []
    for query in response.queries:
        new_docs = await retriever.ainvoke(query)
        docs.extend(new_docs)
    # You probably want to think about reranking or deduplicating documents here
    # But that is a separate topic
    return docs
```

```python
await custom_chain.ainvoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
await custom_chain.ainvoke("where did Harrison and ankush Work")
```

```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Ankush worked at Facebook')]
```
