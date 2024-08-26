---
sidebar_label: ZHIPU AI
translated: true
---

# ZHIPU AI

Ce notebook montre comment utiliser l'[API ZHIPU AI](https://open.bigmodel.cn/dev/api) dans LangChain avec langchain.chat_models.ChatZhipuAI.

>[*GLM-4*](https://open.bigmodel.cn/) est un modèle de langage multilingue de grande taille aligné sur l'intention humaine, doté de capacités en matière de Q&R, de dialogue à plusieurs tours et de génération de code. Les performances globales du nouveau modèle de base de la génération GLM-4 ont été considérablement améliorées par rapport à la génération précédente, prenant en charge des contextes plus longs ; Une multimodalité plus forte ; Prise en charge d'une vitesse d'inférence plus rapide, d'une plus grande concurrence, réduisant considérablement les coûts d'inférence ; Pendant ce temps, GLM-4 améliore les capacités des agents intelligents.

## Démarrage

### Installation

Tout d'abord, assurez-vous que le package zhipuai est installé dans votre environnement Python. Exécutez la commande suivante :

```python
#!pip install --upgrade httpx httpx-sse PyJWT
```

### Importation des modules requis

Après l'installation, importez les modules nécessaires dans votre script Python :

```python
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### Configuration de votre clé API

Connectez-vous à [ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys) pour obtenir une clé API afin d'accéder à nos modèles.

```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### Initialisation du modèle de chat ZHIPU AI

Voici comment initialiser le modèle de chat :

```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### Utilisation de base

Invoquez le modèle avec des messages système et utilisateur comme ceci :

```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```

```python
response = chat.invoke(messages)
print(response.content)  # Displays the AI-generated poem
```

## Fonctionnalités avancées

### Prise en charge du streaming

Pour une interaction continue, utilisez la fonctionnalité de streaming :

```python
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```

```python
streaming_chat(messages)
```

### Appels asynchrones

Pour des appels non bloquants, utilisez l'approche asynchrone :

```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

```python
response = await async_chat.agenerate([messages])
print(response)
```

### Utilisation avec l'appel de fonctions

Le modèle GLM-4 peut également être utilisé avec l'appel de fonction, utilisez le code suivant pour exécuter un simple agent de chat json_chat_agent.

```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```
