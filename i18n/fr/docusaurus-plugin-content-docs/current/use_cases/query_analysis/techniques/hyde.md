---
sidebar_position: 2
translated: true
---

# Hypothetical Document Embeddings

Si nous travaillons avec un index basé sur la recherche de similarité, comme un magasin de vecteurs, alors la recherche sur des questions brutes peut ne pas bien fonctionner car leurs intégrations peuvent ne pas être très similaires à celles des documents pertinents. Au lieu de cela, il pourrait être utile de faire générer par le modèle un document pertinent hypothétique, puis d'utiliser celui-ci pour effectuer une recherche de similarité. C'est l'idée clé derrière [Hypothetical Document Embedding, ou HyDE](https://arxiv.org/pdf/2212.10496.pdf).

Examinons comment nous pourrions effectuer une recherche via des documents hypothétiques pour notre chatbot Q&A sur les vidéos YouTube de LangChain.

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

## Génération de documents hypothétiques

En fin de compte, la génération d'un document hypothétique pertinent se résume à essayer de répondre à la question de l'utilisateur. Comme nous concevons un chatbot Q&A pour les vidéos YouTube de LangChain, nous fournirons quelques informations de base sur LangChain et demanderons au modèle d'utiliser un style plus pédantesque afin d'obtenir des documents hypothétiques plus réalistes :

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert about a set of software for building LLM-powered applications called LangChain, LangGraph, LangServe, and LangSmith.

LangChain is a Python framework that provides a large set of integrations that can easily be composed to build LLM applications.
LangGraph is a Python package built on top of LangChain that makes it easy to build stateful, multi-actor LLM applications.
LangServe is a Python package built on top of LangChain that makes it easy to deploy a LangChain application as a REST API.
LangSmith is a platform that makes it easy to trace and test LLM applications.

Answer the user question as best you can. Answer as though you were writing a tutorial that addressed the user question."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
qa_no_context = prompt | llm | StrOutputParser()
```

```python
answer = qa_no_context.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
print(answer)
```

```output
To use multi-modal models in a chain and turn the chain into a REST API, you can leverage the capabilities of LangChain, LangGraph, and LangServe. Here's a step-by-step guide on how to achieve this:

1. **Building a Multi-Modal Model with LangChain**:
   - Start by defining your multi-modal model using LangChain. LangChain provides integrations with various deep learning frameworks like TensorFlow, PyTorch, and Hugging Face Transformers, making it easy to incorporate different modalities such as text, images, and audio.
   - You can create separate components for each modality and then combine them in a chain to build a multi-modal model.

2. **Building a Stateful, Multi-Actor Application with LangGraph**:
   - Once you have your multi-modal model defined in LangChain, you can use LangGraph to build a stateful, multi-actor application around it.
   - LangGraph allows you to define actors that interact with each other and maintain state, which is useful for handling multi-modal inputs and outputs in a chain.

3. **Deploying the Chain as a REST API with LangServe**:
   - After building your multi-modal model and application using LangChain and LangGraph, you can deploy the chain as a REST API using LangServe.
   - LangServe simplifies the process of exposing your LangChain application as a REST API, allowing you to easily interact with your multi-modal model through HTTP requests.

4. **Testing and Tracing with LangSmith**:
   - To ensure the reliability and performance of your multi-modal model and REST API, you can use LangSmith for testing and tracing.
   - LangSmith provides tools for tracing the execution of your LLM applications and running tests to validate their functionality.

By following these steps and leveraging the capabilities of LangChain, LangGraph, LangServe, and LangSmith, you can effectively use multi-modal models in a chain and turn the chain into a REST API.
```

## Renvoyer le document hypothétique et la question d'origine

Pour augmenter notre rappel, nous pouvons vouloir récupérer des documents en fonction à la fois du document hypothétique et de la question d'origine. Nous pouvons facilement renvoyer les deux comme suit :

```python
from langchain_core.runnables import RunnablePassthrough

hyde_chain = RunnablePassthrough.assign(hypothetical_document=qa_no_context)

hyde_chain.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
{'question': 'how to use multi-modal models in a chain and turn chain into a rest api',
 'hypothetical_document': "To use multi-modal models in a chain and turn the chain into a REST API, you can leverage the capabilities of LangChain, LangGraph, and LangServe. Here's a step-by-step guide on how to achieve this:\n\n1. **Set up your multi-modal models**: First, you need to create or import your multi-modal models. These models can include text, image, audio, or any other type of data that you want to process in your LLM application.\n\n2. **Build your LangGraph application**: Use LangGraph to build a stateful, multi-actor LLM application that incorporates your multi-modal models. LangGraph allows you to define the flow of data and interactions between different components of your application.\n\n3. **Integrate your models in LangChain**: LangChain provides integrations for various types of models and data sources. You can easily integrate your multi-modal models into your LangGraph application using LangChain's capabilities.\n\n4. **Deploy your LangChain application as a REST API using LangServe**: Once you have built your multi-modal LLM application using LangGraph and LangChain, you can deploy it as a REST API using LangServe. LangServe simplifies the process of exposing your LangChain application as a web service, making it accessible to other applications and users.\n\n5. **Test and trace your application using LangSmith**: Finally, you can use LangSmith to trace and test your multi-modal LLM application. LangSmith provides tools for monitoring the performance of your application, debugging any issues, and ensuring that it functions as expected.\n\nBy following these steps and leveraging the capabilities of LangChain, LangGraph, LangServe, and LangSmith, you can effectively use multi-modal models in a chain and turn the chain into a REST API."}
```

## Utilisation de l'appel de fonction pour obtenir une sortie structurée

Si nous composions cette technique avec d'autres techniques d'analyse de requête, nous utiliserions probablement l'appel de fonction pour obtenir des objets de requête structurés. Nous pouvons utiliser l'appel de fonction pour HyDE comme suit :

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.pydantic_v1 import BaseModel, Field


class Query(BaseModel):
    answer: str = Field(
        ...,
        description="Answer the user question as best you can. Answer as though you were writing a tutorial that addressed the user question.",
    )


system = """You are an expert about a set of software for building LLM-powered applications called LangChain, LangGraph, LangServe, and LangSmith.

LangChain is a Python framework that provides a large set of integrations that can easily be composed to build LLM applications.
LangGraph is a Python package built on top of LangChain that makes it easy to build stateful, multi-actor LLM applications.
LangServe is a Python package built on top of LangChain that makes it easy to deploy a LangChain application as a REST API.
LangSmith is a platform that makes it easy to trace and test LLM applications."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm_with_tools = llm.bind_tools([Query])
hyde_chain = prompt | llm_with_tools | PydanticToolsParser(tools=[Query])
hyde_chain.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[Query(answer='To use multi-modal models in a chain and turn the chain into a REST API, you can follow these steps:\n\n1. Use LangChain to build your multi-modal model by integrating different modalities such as text, image, and audio.\n2. Utilize LangGraph, a Python package built on top of LangChain, to create a stateful, multi-actor LLM application that can handle interactions between different modalities.\n3. Once your multi-modal model is built using LangChain and LangGraph, you can deploy it as a REST API using LangServe, another Python package that simplifies the process of creating REST APIs from LangChain applications.\n4. Use LangSmith to trace and test your multi-modal model to ensure its functionality and performance.\n\nBy following these steps, you can effectively use multi-modal models in a chain and turn the chain into a REST API.')]
```
