---
translated: true
---

# LLMonitor

>[LLMonitor](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) est une plateforme d'observabilité open-source qui fournit des analyses de coûts et d'utilisation, le suivi des utilisateurs, le traçage et des outils d'évaluation.

<video controls width='100%' >
  <source src='https://llmonitor.com/videos/demo-annotated.mp4'/>
</video>

## Configuration

Créez un compte sur [llmonitor.com](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs), puis copiez l'`ID de suivi` de votre nouvelle application.

Une fois que vous l'avez, définissez-le en tant que variable d'environnement en exécutant :

```bash
export LLMONITOR_APP_ID="..."
```

Si vous préférez ne pas définir de variable d'environnement, vous pouvez transmettre la clé directement lors de l'initialisation du gestionnaire de rappel :

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler(app_id="...")
```

## Utilisation avec les modèles LLM/Chat

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "LLMonitor"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LLMonitor"}]-->
from langchain_openai import OpenAI
from langchain_openai import ChatOpenAI

handler = LLMonitorCallbackHandler()

llm = OpenAI(
    callbacks=[handler],
)

chat = ChatOpenAI(callbacks=[handler])

llm("Tell me a joke")

```

## Utilisation avec les chaînes et les agents

Assurez-vous de transmettre le gestionnaire de rappel à la méthode `run` afin que toutes les chaînes et les appels LLM associés soient correctement suivis.

Il est également recommandé de transmettre `agent_name` dans les métadonnées pour pouvoir les distinguer dans le tableau de bord.

Exemple :

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LLMonitor"}, {"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "LLMonitor"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "LLMonitor"}, {"imported": "OpenAIFunctionsAgent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_functions_agent.base.OpenAIFunctionsAgent.html", "title": "LLMonitor"}, {"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "LLMonitor"}, {"imported": "tool", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "LLMonitor"}]-->
from langchain_openai import ChatOpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.agents import OpenAIFunctionsAgent, AgentExecutor, tool

llm = ChatOpenAI(temperature=0)

handler = LLMonitorCallbackHandler()

@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)

tools = [get_word_length]

prompt = OpenAIFunctionsAgent.create_prompt(
    system_message=SystemMessage(
        content="You are very powerful assistant, but bad at calculating lengths of words."
    )
)

agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=prompt, verbose=True)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, metadata={"agent_name": "WordCount"}  # <- recommended, assign a custom name
)
agent_executor.run("how many letters in the word educa?", callbacks=[handler])
```

Autre exemple :

```python
<!--IMPORTS:[{"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "LLMonitor"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.initialize.initialize_agent.html", "title": "LLMonitor"}, {"imported": "AgentType", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent_types.AgentType.html", "title": "LLMonitor"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "LLMonitor"}, {"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}]-->
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain_openai import OpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler


handler = LLMonitorCallbackHandler()

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, metadata={ "agent_name": "GirlfriendAgeFinder" })  # <- recommended, assign a custom name

agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=[handler],
)
```

## Suivi des utilisateurs

Le suivi des utilisateurs vous permet d'identifier vos utilisateurs, de suivre leurs coûts, leurs conversations et plus encore.

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}, {"imported": "identify", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.identify.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler, identify

with identify("user-123"):
    llm.invoke("Tell me a joke")

with identify("user-456", user_props={"email": "user456@test.com"}):
    agen.run("Who is Leo DiCaprio's girlfriend?")
```

## Assistance

Pour toute question ou problème d'intégration, vous pouvez contacter l'équipe LLMonitor sur [Discord](http://discord.com/invite/8PafSG58kK) ou par [e-mail](mailto:vince@llmonitor.com).
