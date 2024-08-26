---
sidebar_position: 2
translated: true
---

# Expansion

Les systèmes de recherche d'informations peuvent être sensibles au libellé et aux mots-clés spécifiques. Pour atténuer cela, une technique de recherche classique consiste à générer plusieurs versions paraphrasées d'une requête et à renvoyer les résultats pour toutes les versions de la requête. C'est ce qu'on appelle l'**expansion de requête**. Les LLM sont un excellent outil pour générer ces versions alternatives d'une requête.

Examinons comment nous pourrions faire l'expansion de requête pour notre chatbot Q&A sur les vidéos YouTube de LangChain, que nous avons commencé dans le [Démarrage rapide](/docs/use_cases/query_analysis/quickstart).

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-openai
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

## Génération de requêtes

Pour nous assurer d'obtenir plusieurs paraphrases, nous utiliserons l'API d'appel de fonction d'OpenAI.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class ParaphrasedQuery(BaseModel):
    """You have performed query expansion to generate a paraphrasing of a question."""

    paraphrased_query: str = Field(
        ...,
        description="A unique paraphrasing of the original question.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query expansion. If there are multiple common ways of phrasing a user question \
or common synonyms for key words in the question, make sure to return multiple versions \
of the query with the different phrasings.

If there are acronyms or words you are not familiar with, do not try to rephrase them.

Return at least 3 versions of the question."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([ParaphrasedQuery])
query_analyzer = prompt | llm_with_tools | PydanticToolsParser(tools=[ParaphrasedQuery])
```

Voyons quelles requêtes notre analyseur génère pour les questions que nous avons recherchées précédemment :

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[ParaphrasedQuery(paraphrased_query='How to utilize multi-modal models sequentially and convert the sequence into a REST API'),
 ParaphrasedQuery(paraphrased_query='Steps for using multi-modal models in a series and transforming the series into a RESTful API'),
 ParaphrasedQuery(paraphrased_query='Guide on employing multi-modal models in a chain and converting the chain into a RESTful API')]
```

```python
query_analyzer.invoke({"question": "stream events from llm agent"})
```

```output
[ParaphrasedQuery(paraphrased_query='How to stream events from LLM agent?'),
 ParaphrasedQuery(paraphrased_query='How can I receive events from LLM agent in real-time?'),
 ParaphrasedQuery(paraphrased_query='What is the process for capturing events from LLM agent?')]
```
