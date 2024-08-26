---
sidebar_position: 3
translated: true
---

# Gérer les cas où aucune requête n'est générée

Parfois, une technique d'analyse de requête peut permettre de générer un nombre quelconque de requêtes - y compris aucune ! Dans ce cas, notre chaîne globale devra inspecter le résultat de l'analyse de la requête avant de décider s'il faut appeler le récupérateur ou non.

Nous utiliserons des données factices pour cet exemple.

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

### Créer l'index

Nous allons créer un magasin vectoriel sur de fausses informations.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## Analyse de la requête

Nous utiliserons l'appel de fonction pour structurer la sortie. Cependant, nous configurerons le LLM de manière à ce qu'il n'ait PAS besoin d'appeler la fonction représentant une requête de recherche (au cas où il déciderait de ne pas le faire). Nous utiliserons ensuite une invite pour faire une analyse de requête qui précise explicitement quand il faut et ne faut pas faire une recherche.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    query: str = Field(
        ...,
        description="Similarity search query applied to job record.",
    )
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You have the ability to issue search queries to get information to help answer user information.

You do not NEED to look things up. If you don't need to, then just respond normally."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

Nous pouvons voir qu'en invoquant cela, nous obtenons un message qui renvoie parfois - mais pas toujours - un appel d'outil.

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_ZnoVX4j9Mn8wgChaORyd1cvq', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}]})
```

```python
query_analyzer.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## Récupération avec analyse de requête

Alors, comment inclurions-nous cela dans une chaîne ? Examinons un exemple ci-dessous.

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # Could add more logic - like another LLM call - here
        return docs
    else:
        return response
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```
