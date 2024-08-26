---
translated: true
---

# Google Finance

Ce cahier passe en revue comment utiliser l'outil Google Finance pour obtenir des informations à partir de la page Google Finance

Pour obtenir une clé SerpApi, inscrivez-vous sur : https://serpapi.com/users/sign_up.

Installez ensuite google-search-results avec la commande :

pip install google-search-results

Définissez ensuite la variable d'environnement SERPAPI_API_KEY avec votre clé SerpApi

Ou transmettez la clé en tant qu'argument au wrapper serp_api_key="your secret key"

Utiliser l'outil

```python
%pip install --upgrade --quiet  google-search-results
```

```python
import os

from langchain_community.tools.google_finance import GoogleFinanceQueryRun
from langchain_community.utilities.google_finance import GoogleFinanceAPIWrapper

os.environ["SERPAPI_API_KEY"] = ""
tool = GoogleFinanceQueryRun(api_wrapper=GoogleFinanceAPIWrapper())
```

```python
tool.run("Google")
```

L'utiliser avec Langchain

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["SERP_API_KEY"] = ""
llm = OpenAI()
tools = load_tools(["google-scholar", "google-finance"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("what is google's stock")
```
