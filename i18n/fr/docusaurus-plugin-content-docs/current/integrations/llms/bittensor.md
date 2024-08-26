---
translated: true
---

# Bittensor

>[Bittensor](https://bittensor.com/) est un réseau minier, similaire à Bitcoin, qui inclut des incitations intégrées conçues pour encourager les mineurs à contribuer avec du calcul et des connaissances.

>`NIBittensorLLM` est développé par [Neural Internet](https://neuralinternet.ai/), alimenté par `Bittensor`.

>Ce LLM montre le véritable potentiel de l'IA décentralisée en vous donnant la/les meilleure(s) réponse(s) du `protocole Bittensor`, qui se compose de divers modèles d'IA tels que `OpenAI`, `LLaMA2` etc.

Les utilisateurs peuvent consulter leurs journaux, leurs requêtes et leurs clés API sur le [Validator Endpoint Frontend](https://api.neuralinternet.ai/). Cependant, les modifications de la configuration sont actuellement interdites ; sinon, les requêtes de l'utilisateur seront bloquées.

Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à contacter notre développeur sur [GitHub](https://github.com/Kunj-2206), [Discord](https://discordapp.com/users/683542109248159777) ou rejoignez notre serveur Discord pour les dernières mises à jour et questions [Neural Internet](https://discord.gg/neuralinternet).

## Différents paramètres et gestion des réponses pour NIBittensorLLM

```python
import json
from pprint import pprint

from langchain.globals import set_debug
from langchain_community.llms import NIBittensorLLM

set_debug(True)

# System parameter in NIBittensorLLM is optional but you can set whatever you want to perform with model
llm_sys = NIBittensorLLM(
    system_prompt="Your task is to determine response based on user prompt.Explain me like I am technical lead of a project"
)
sys_resp = llm_sys(
    "What is bittensor and What are the potential benefits of decentralized AI?"
)
print(f"Response provided by LLM with system prompt set is : {sys_resp}")

# The top_responses parameter can give multiple responses based on its parameter value
# This below code retrive top 10 miner's response all the response are in format of json

# Json response structure is
""" {
    "choices":  [
                    {"index": Bittensor's Metagraph index number,
                    "uid": Unique Identifier of a miner,
                    "responder_hotkey": Hotkey of a miner,
                    "message":{"role":"assistant","content": Contains actual response},
                    "response_ms": Time in millisecond required to fetch response from a miner}
                ]
    } """

multi_response_llm = NIBittensorLLM(top_responses=10)
multi_resp = multi_response_llm.invoke("What is Neural Network Feeding Mechanism?")
json_multi_resp = json.loads(multi_resp)
pprint(json_multi_resp)
```

##  Utilisation de NIBittensorLLM avec LLMChain et PromptTemplate

```python
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import NIBittensorLLM
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)

# System parameter in NIBittensorLLM is optional but you can set whatever you want to perform with model
llm = NIBittensorLLM(
    system_prompt="Your task is to determine response based on user prompt."
)

llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What is bittensor?"

llm_chain.run(question)
```

##  Utilisation de NIBittensorLLM avec un agent conversationnel et un outil de recherche Google

```python
from langchain.tools import Tool
from langchain_community.utilities import GoogleSearchAPIWrapper

search = GoogleSearchAPIWrapper()

tool = Tool(
    name="Google Search",
    description="Search Google for recent results.",
    func=search.run,
)
```

```python
from langchain import hub
from langchain.agents import (
    AgentExecutor,
    create_react_agent,
)
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import NIBittensorLLM

tools = [tool]

prompt = hub.pull("hwchase17/react")


llm = NIBittensorLLM(
    system_prompt="Your task is to determine a response based on user prompt"
)

memory = ConversationBufferMemory(memory_key="chat_history")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory)

response = agent_executor.invoke({"input": prompt})
```
