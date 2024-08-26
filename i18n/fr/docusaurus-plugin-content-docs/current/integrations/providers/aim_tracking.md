---
translated: true
---

# Objectif

Aim facilite grandement la visualisation et le débogage des exécutions LangChain. Aim suit les entrées et les sorties des LLM et des outils, ainsi que les actions des agents.

Avec Aim, vous pouvez facilement déboguer et examiner une exécution individuelle :

![](https://user-images.githubusercontent.com/13848158/227784778-06b806c7-74a1-4d15-ab85-9ece09b458aa.png)

De plus, vous avez la possibilité de comparer plusieurs exécutions côte à côte :

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)

Aim est entièrement open source, [en savoir plus](https://github.com/aimhubio/aim) sur Aim sur GitHub.

Avançons et voyons comment activer et configurer le rappel Aim.

<h3>Suivi des exécutions LangChain avec Aim</h3>

Dans ce notebook, nous explorerons trois scénarios d'utilisation. Pour commencer, nous installerons les packages nécessaires et importerons certains modules. Ensuite, nous configurerons deux variables d'environnement qui peuvent être établies soit dans le script Python, soit via le terminal.

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

Nos exemples utilisent un modèle GPT comme LLM, et OpenAI offre une API à cette fin. Vous pouvez obtenir la clé à partir du lien suivant : https://platform.openai.com/account/api-keys .

Nous utiliserons SerpApi pour récupérer les résultats de recherche de Google. Pour obtenir la clé SerpApi, veuillez vous rendre sur https://serpapi.com/manage-api-key .

```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

Les méthodes d'événement de `AimCallbackHandler` acceptent le module LangChain ou l'agent en entrée et enregistrent au moins les invites et les résultats générés, ainsi que la version sérialisée du module LangChain, dans l'exécution Aim désignée.

```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

callbacks = [StdOutCallbackHandler(), aim_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

La fonction `flush_tracker` est utilisée pour enregistrer les actifs LangChain sur Aim. Par défaut, la session est réinitialisée plutôt que terminée.

<h3>Scénario 1</h3> Dans le premier scénario, nous utiliserons le LLM OpenAI.

```python
# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)
```

<h3>Scénario 2</h3> Le deuxième scénario implique l'enchaînement avec plusieurs sous-chaînes sur plusieurs générations.

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

<h3>Scénario 3</h3> Le troisième scénario implique un agent avec des outils.

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
