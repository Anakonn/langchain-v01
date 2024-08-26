---
sidebar_position: 2
translated: true
---

# Routage

Parfois, nous avons plusieurs index pour différents domaines, et pour différentes questions, nous voulons interroger différents sous-ensembles de ces index. Par exemple, supposons que nous ayons un index de magasin de vecteurs pour toute la documentation Python de LangChain et un autre pour toute la documentation JS de LangChain. Étant donné une question sur l'utilisation de LangChain, nous voudrions déduire à quelle langue la question fait référence et interroger la documentation appropriée. Le **routage de requête** est le processus de classification de l'index ou du sous-ensemble d'index sur lequel une requête doit être effectuée.

## Configuration

#### Installer les dépendances

```python
%pip install -qU langchain-core langchain-openai
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

## Routage avec des modèles d'appel de fonction

Avec les modèles d'appel de fonction, il est simple d'utiliser des modèles pour la classification, ce qui est ce à quoi se résume le routage :

```python
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["python_docs", "js_docs", "golang_docs"] = Field(
        ...,
        description="Given a user question choose which datasource would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)

system = """You are an expert at routing a user question to the appropriate data source.

Based on the programming language the question is referring to, route it to the relevant data source."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

router = prompt | structured_llm
```

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

```python
question = """Why doesn't the following code work:

from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(["human", "speak in {language}"])
prompt.invoke("french")
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='python_docs')
```

```python
question = """Why doesn't the following code work:


import { ChatPromptTemplate } from "@langchain/core/prompts";


const chatPrompt = ChatPromptTemplate.fromMessages([
  ["human", "speak in {language}"],
]);

const formattedChatPrompt = await chatPrompt.invoke({
  input_language: "french"
});
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='js_docs')
```

## Routage vers plusieurs index

Si nous voulons interroger plusieurs index, nous pouvons le faire en mettant à jour notre schéma pour accepter une liste de sources de données :

```python
from typing import List


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasources: List[Literal["python_docs", "js_docs", "golang_docs"]] = Field(
        ...,
        description="Given a user question choose which datasources would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)
router = prompt | structured_llm
router.invoke(
    {
        "question": "is there feature parity between the Python and JS implementations of OpenAI chat models"
    }
)
```

```output
RouteQuery(datasources=['python_docs', 'js_docs'])
```
