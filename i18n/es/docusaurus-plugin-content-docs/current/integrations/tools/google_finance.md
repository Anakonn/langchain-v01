---
translated: true
---

# Google Finance

Este cuaderno explica cómo usar la herramienta Google Finance para obtener información de la página de Google Finance.

Para obtener una clave SerpApi, regístrese en: https://serpapi.com/users/sign_up.

Luego instale google-search-results con el comando:

pip install google-search-results

Luego establezca la variable de entorno SERPAPI_API_KEY en su clave SerpApi

O pase la clave como un argumento al wrapper serp_api_key="su clave secreta"

Usar la herramienta

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

Usándolo con Langchain

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
