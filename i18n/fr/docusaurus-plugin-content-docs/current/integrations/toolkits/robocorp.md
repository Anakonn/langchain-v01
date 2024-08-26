---
translated: true
---

# Robocorp

Ce cahier couvre comment bien démarrer avec le [Robocorp Action Server](https://github.com/robocorp/robocorp) et la boîte à outils d'action LangChain.

Robocorp est le moyen le plus simple d'étendre les capacités des agents IA, des assistants et des copilotes avec des actions personnalisées.

## Installation

Tout d'abord, consultez le [Robocorp Quickstart](https://github.com/robocorp/robocorp#quickstart) pour savoir comment configurer `Action Server` et créer vos Actions.

Dans votre application LangChain, installez le package `langchain-robocorp` :

```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

Lorsque vous créez le nouveau `Action Server` en suivant le quickstart ci-dessus.

Il créera un répertoire avec des fichiers, y compris `action.py`.

Nous pouvons ajouter des fonctions Python en tant qu'actions comme indiqué [ici](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action).

Ajoutons une fonction factice à `action.py`.

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

Nous lançons ensuite le serveur :

```bash
action-server start
```

Et nous pouvons voir :

```text
Found new action: get_weather_forecast

```

Testez localement en allant sur le serveur en cours d'exécution à `http://localhost:8080` et utilisez l'interface utilisateur pour exécuter la fonction.

## Configuration de l'environnement

Vous pouvez éventuellement définir les variables d'environnement suivantes :

- `LANGCHAIN_TRACING_V2=true` : Pour activer la journalisation des traces d'exécution LangSmith qui peuvent également être liées aux journaux d'exécution d'actions du Action Server respectif. Voir la [documentation LangSmith](https://docs.smith.langchain.com/tracing#log-runs) pour plus d'informations.

## Utilisation

Nous avons démarré le serveur d'actions local, ci-dessus, en cours d'exécution sur `http://localhost:8080`.

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```

### Outils à entrée unique

Par défaut, `toolkit.get_tools()` renverra les actions en tant qu'outils structurés.

Pour renvoyer des outils à entrée unique, passez un modèle de conversation à utiliser pour le traitement des entrées.

```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```
