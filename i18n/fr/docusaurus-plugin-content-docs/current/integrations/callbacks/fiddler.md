---
translated: true
---

# Fiddler

>[Fiddler](https://www.fiddler.ai/) est le pionnier des systèmes d'exploitation générateurs et prédictifs d'entreprise, offrant une plateforme unifiée qui permet aux équipes de Data Science, MLOps, Risk, Compliance, Analytics et autres LOB de surveiller, d'expliquer, d'analyser et d'améliorer les déploiements ML à l'échelle de l'entreprise.

## 1. Installation et configuration

```python
#!pip install langchain langchain-community langchain-openai fiddler-client
```

## 2. Détails de connexion Fiddler

*Avant de pouvoir ajouter des informations sur votre modèle avec Fiddler*

1. L'URL que vous utilisez pour vous connecter à Fiddler
2. Votre ID d'organisation
3. Votre jeton d'autorisation

Ceux-ci peuvent être trouvés en naviguant sur la page *Paramètres* de votre environnement Fiddler.

```python
URL = ""  # Your Fiddler instance URL, Make sure to include the full URL (including https://). For example: https://demo.fiddler.ai
ORG_NAME = ""
AUTH_TOKEN = ""  # Your Fiddler instance auth token

# Fiddler project and model names, used for model registration
PROJECT_NAME = ""
MODEL_NAME = ""  # Model name in Fiddler
```

## 3. Créer une instance de gestionnaire de rappel Fiddler

```python
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler

fiddler_handler = FiddlerCallbackHandler(
    url=URL,
    org=ORG_NAME,
    project=PROJECT_NAME,
    model=MODEL_NAME,
    api_key=AUTH_TOKEN,
)
```

## Exemple 1 : Chaîne de base

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAI

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])
output_parser = StrOutputParser()

chain = llm | output_parser

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke("How far is moon from earth?")
```

```python
# Few more invocations
chain.invoke("What is the temperature on Mars?")
chain.invoke("How much is 2 + 200000?")
chain.invoke("Which movie won the oscars this year?")
chain.invoke("Can you write me a poem about insomnia?")
chain.invoke("How are you doing today?")
chain.invoke("What is the meaning of life?")
```

## Exemple 2 : Chaîne avec des modèles d'invite

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])

chain = final_prompt | llm

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke({"input": "What's the square of a triangle?"})
```
