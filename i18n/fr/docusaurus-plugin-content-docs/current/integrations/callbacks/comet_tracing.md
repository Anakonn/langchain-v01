---
translated: true
---

# Suivi des comètes

Il existe deux façons de suivre vos exécutions LangChains avec Comet :

1. Définir la variable d'environnement `LANGCHAIN_COMET_TRACING` sur "true". C'est la méthode recommandée.
2. Importer manuellement le `CometTracer` et le passer explicitement.

```python
import os

import comet_llm

os.environ["LANGCHAIN_COMET_TRACING"] = "true"

# Connect to Comet if no API Key is set
comet_llm.init()

# comet documentation to configure comet using env variables
# https://www.comet.com/docs/v2/api-and-sdk/llm-sdk/configuration/
# here we are configuring the comet project
os.environ["COMET_PROJECT_NAME"] = "comet-example-langchain-tracing"

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.llms import OpenAI
```

```python
# Agent run with tracing. Ensure that OPENAI_API_KEY is set appropriately to run this example.

llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
```

```python
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("What is 2 raised to .123243 power?")  # this should be traced
# An url for the chain like the following should print in your console:
# https://www.comet.com/<workspace>/<project_name>
# The url can be used to view the LLM chain in Comet.
```

```python
# Now, we unset the environment variable and use a context manager.
if "LANGCHAIN_COMET_TRACING" in os.environ:
    del os.environ["LANGCHAIN_COMET_TRACING"]

from langchain_community.callbacks.tracers.comet import CometTracer

tracer = CometTracer()

# Recreate the LLM, tools and agent and passing the callback to each of them
llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run(
    "What is 2 raised to .123243 power?", callbacks=[tracer]
)  # this should be traced
```
