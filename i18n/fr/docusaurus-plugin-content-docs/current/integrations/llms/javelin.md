---
translated: true
---

# Tutoriel sur la passerelle Javelin AI

Ce bloc-notes Jupyter explorera comment interagir avec la passerelle Javelin AI à l'aide du SDK Python.
La passerelle Javelin AI facilite l'utilisation de modèles de langage à grande échelle (LLM) comme OpenAI, Cohere, Anthropic et autres en
fournissant un point de terminaison sécurisé et unifié. La passerelle elle-même fournit un mécanisme centralisé pour déployer les modèles de manière systématique,
fournir une sécurité d'accès, des garde-fous en matière de politique et de coûts pour les entreprises, etc.

Pour une liste complète de toutes les fonctionnalités et avantages de Javelin, veuillez visiter www.getjavelin.io

## Étape 1 : Introduction

[La passerelle Javelin AI](https://www.getjavelin.io) est une passerelle API de niveau entreprise pour les applications d'IA. Elle intègre une sécurité d'accès robuste, assurant des interactions sécurisées avec les modèles de langage à grande échelle. En savoir plus dans la [documentation officielle](https://docs.getjavelin.io).

## Étape 2 : Installation

Avant de commencer, nous devons installer le `javelin_sdk` et configurer la clé API Javelin en tant que variable d'environnement.

```python
pip install 'javelin_sdk'
```

```output
Requirement already satisfied: javelin_sdk in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (0.1.8)
Requirement already satisfied: httpx<0.25.0,>=0.24.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (0.24.1)
Requirement already satisfied: pydantic<2.0.0,>=1.10.7 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (1.10.12)
Requirement already satisfied: certifi in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (2023.5.7)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (0.17.3)
Requirement already satisfied: idna in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (3.4)
Requirement already satisfied: sniffio in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (1.3.0)
Requirement already satisfied: typing-extensions>=4.2.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from pydantic<2.0.0,>=1.10.7->javelin_sdk) (4.7.1)
Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (3.7.1)
Note: you may need to restart the kernel to use updated packages.
```

## Étape 3 : Exemple de complétion

Cette section montrera comment interagir avec la passerelle Javelin AI pour obtenir des compléments d'un modèle de langage à grande échelle. Voici un script Python qui illustre cela :
(remarque) suppose que vous avez configuré une route dans la passerelle appelée 'eng_dept03'

```python
from langchain.chains import LLMChain
from langchain_community.llms import JavelinAIGateway
from langchain_core.prompts import PromptTemplate

route_completions = "eng_dept03"

gateway = JavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route=route_completions,
    model_name="gpt-3.5-turbo-instruct",
)

prompt = PromptTemplate("Translate the following English text to French: {text}")

llmchain = LLMChain(llm=gateway, prompt=prompt)
result = llmchain.run("podcast player")

print(result)
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[6], line 2
      1 from langchain.chains import LLMChain
----> 2 from langchain.llms import JavelinAIGateway
      3 from langchain.prompts import PromptTemplate
      5 route_completions = "eng_dept03"

ImportError: cannot import name 'JavelinAIGateway' from 'langchain.llms' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/llms/__init__.py)
```

# Étape 4 : Exemple d'embeddings

Cette section montre comment utiliser la passerelle Javelin AI pour obtenir des embeddings pour des requêtes de texte et des documents. Voici un script Python qui illustre cela :
(remarque) suppose que vous avez configuré une route dans la passerelle appelée 'embeddings'

```python
from langchain_community.embeddings import JavelinAIGatewayEmbeddings

embeddings = JavelinAIGatewayEmbeddings(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="embeddings",
)

print(embeddings.embed_query("hello"))
print(embeddings.embed_documents(["hello"]))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[9], line 1
----> 1 from langchain.embeddings import JavelinAIGatewayEmbeddings
      2 from langchain.embeddings.openai import OpenAIEmbeddings
      4 embeddings = JavelinAIGatewayEmbeddings(
      5     gateway_uri="http://localhost:8000", # replace with service URL or host/port of Javelin
      6     route="embeddings",
      7 )

ImportError: cannot import name 'JavelinAIGatewayEmbeddings' from 'langchain.embeddings' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/embeddings/__init__.py)
```

# Étape 5 : Exemple de chat

Cette section illustre comment interagir avec la passerelle Javelin AI pour faciliter un chat avec un modèle de langage à grande échelle. Voici un script Python qui illustre cela :
(remarque) suppose que vous avez configuré une route dans la passerelle appelée 'mychatbot_route'

```python
from langchain_community.chat_models import ChatJavelinAIGateway
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Artificial Intelligence has the power to transform humanity and make the world a better place"
    ),
]

chat = ChatJavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="mychatbot_route",
    model_name="gpt-3.5-turbo",
    params={"temperature": 0.1},
)

print(chat(messages))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[8], line 1
----> 1 from langchain.chat_models import ChatJavelinAIGateway
      2 from langchain.schema import HumanMessage, SystemMessage
      4 messages = [
      5     SystemMessage(
      6         content="You are a helpful assistant that translates English to French."
   (...)
     10     ),
     11 ]

ImportError: cannot import name 'ChatJavelinAIGateway' from 'langchain.chat_models' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/chat_models/__init__.py)
```

Étape 6 : Conclusion
Ce tutoriel a présenté la passerelle Javelin AI et a montré comment y interagir à l'aide du SDK Python.
N'oubliez pas de consulter le [SDK Python](https://www.github.com/getjavelin.io/javelin-python) de Javelin pour plus d'exemples et d'explorer la documentation officielle pour plus de détails.

Bon codage !
