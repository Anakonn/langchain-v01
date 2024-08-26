---
translated: true
---

# Objetivo

Aim facilita enormemente la visualización y depuración de las ejecuciones de LangChain. Aim realiza un seguimiento de las entradas y salidas de los LLM y las herramientas, así como de las acciones de los agentes.

Con Aim, puede depurar y examinar fácilmente una ejecución individual:

![](https://user-images.githubusercontent.com/13848158/227784778-06b806c7-74a1-4d15-ab85-9ece09b458aa.png)

Además, tiene la opción de comparar varias ejecuciones lado a lado:

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)

Aim es totalmente de código abierto, [más información](https://github.com/aimhubio/aim) sobre Aim en GitHub.

Sigamos adelante y veamos cómo habilitar y configurar el callback de Aim.

<h3>Seguimiento de las ejecuciones de LangChain con Aim</h3>

En este cuaderno exploraremos tres escenarios de uso. Para comenzar, instalaremos los paquetes necesarios e importaremos ciertos módulos. Posteriormente, configuraremos dos variables de entorno que se pueden establecer dentro del script de Python o a través de la terminal.

```python
%pip install --upgrade --quiet  aim
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

```python
import os
from datetime import datetime

from langchain.callbacks import AimCallbackHandler, StdOutCallbackHandler
from langchain_openai import OpenAI
```

Nuestros ejemplos utilizan un modelo GPT como LLM, y OpenAI ofrece una API para este propósito. Puede obtener la clave a través del siguiente enlace: https://platform.openai.com/account/api-keys .

Utilizaremos SerpApi para recuperar los resultados de búsqueda de Google. Para obtener la clave de SerpApi, vaya a https://serpapi.com/manage-api-key .

```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

Los métodos de eventos de `AimCallbackHandler` aceptan el módulo o agente de LangChain como entrada y registran al menos los mensajes y los resultados generados, así como la versión serializada del módulo de LangChain, en la ejecución de Aim designada.

```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

callbacks = [StdOutCallbackHandler(), aim_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

La función `flush_tracker` se utiliza para registrar los activos de LangChain en Aim. De forma predeterminada, la sesión se restablece en lugar de terminar por completo.

<h3>Escenario 1</h3> En el primer escenario, utilizaremos el LLM de OpenAI.

```python
# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)
```

<h3>Escenario 2</h3> El segundo escenario implica encadenar con múltiples SubChains a lo largo de varias generaciones.

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# scenario 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "the phenomenon behind the remarkable speed of cheetahs"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
aim_callback.flush_tracker(
    langchain_asset=synopsis_chain, experiment_name="scenario 3: Agent with Tools"
)
```

<h3>Escenario 3</h3> El tercer escenario implica un agente con herramientas.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# scenario 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
aim_callback.flush_tracker(langchain_asset=agent, reset=False, finish=True)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mLeonardo DiCaprio seemed to prove a long-held theory about his love life right after splitting from girlfriend Camila Morrone just months ...[0m
Thought:[32;1m[1;3m I need to find out Camila Morrone's age
Action: Search
Action Input: "Camila Morrone age"[0m
Observation: [36;1m[1;3m25 years[0m
Thought:[32;1m[1;3m I need to calculate 25 raised to the 0.43 power
Action: Calculator
Action Input: 25^0.43[0m
Observation: [33;1m[1;3mAnswer: 3.991298452658078
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Camila Morrone is Leo DiCaprio's girlfriend and her current age raised to the 0.43 power is 3.991298452658078.[0m

[1m> Finished chain.[0m
```
