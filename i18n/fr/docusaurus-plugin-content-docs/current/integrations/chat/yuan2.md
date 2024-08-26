---
sidebar_label: Yuan2.0
translated: true
---

# Yuan2.0

Ce cahier montre comment utiliser l'[API YUAN2](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md) dans LangChain avec langchain.chat_models.ChatYuan2.

[*Yuan2.0*](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md) est un modèle de langage fondamental de nouvelle génération développé par IEIT System. Nous avons publié les trois modèles Yuan 2.0-102B, Yuan 2.0-51B et Yuan 2.0-2B. Et nous fournissons des scripts pertinents pour le pré-entraînement, l'affinage et les services d'inférence pour d'autres développeurs. Yuan2.0 est basé sur Yuan1.0, utilisant une gamme plus large de données de pré-entraînement de haute qualité et de jeux de données d'affinage par instruction pour améliorer la compréhension du modèle de la sémantique, des mathématiques, du raisonnement, du code, des connaissances et d'autres aspects.

## Démarrage

### Installation

Tout d'abord, Yuan2.0 a fourni une API compatible avec OpenAI, et nous intégrons ChatYuan2 dans le modèle de chat langchain en utilisant le client OpenAI.
Par conséquent, assurez-vous que le package openai est installé dans votre environnement Python. Exécutez la commande suivante :

```python
%pip install --upgrade --quiet openai
```

### Importation des modules requis

Après l'installation, importez les modules nécessaires dans votre script Python :

```python
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### Configuration de votre serveur API

Configurez votre serveur API compatible avec OpenAI en suivant [yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md).
Si vous avez déployé le serveur api localement, vous pouvez simplement définir `yuan2_api_key="EMPTY"` ou tout ce que vous voulez.
Assurez-vous simplement que `yuan2_api_base` est correctement défini.

```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### Initialisation du modèle ChatYuan2

Voici comment initialiser le modèle de chat :

```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### Utilisation de base

Invoquez le modèle avec des messages système et humains comme ceci :

```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```

```python
print(chat.invoke(messages))
```

### Utilisation de base avec diffusion en continu

Pour une interaction continue, utilisez la fonctionnalité de diffusion en continu :

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```

```python
chat.invoke(messages)
```

## Fonctionnalités avancées

### Utilisation avec des appels asynchrones

Invoquez le modèle avec des appels non bloquants, comme ceci :

```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```

```python
import asyncio

asyncio.run(basic_agenerate())
```

### Utilisation avec un modèle d'invite

Invoquez le modèle avec des appels non bloquants et utilisez un modèle de chat comme ceci :

```python
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```

```python
asyncio.run(ainvoke_with_prompt_template())
```

### Utilisation avec des appels asynchrones en diffusion en continu

Pour des appels non bloquants avec une sortie en diffusion continue, utilisez la méthode astream :

```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```

```python
import asyncio

asyncio.run(basic_astream())
```
