---
translated: true
---

# Bittensor

>[Bittensor](https://bittensor.com/) es una red de minería, similar a Bitcoin, que incluye incentivos integrados diseñados para alentar a los mineros a contribuir con cómputo + conocimiento.

>`NIBittensorLLM` es desarrollado por [Neural Internet](https://neuralinternet.ai/), impulsado por `Bittensor`.

>Este LLM muestra el verdadero potencial de la IA descentralizada al brindarle la(s) mejor(es) respuesta(s) del `protocolo Bittensor`, que consta de varios modelos de IA como `OpenAI`, `LLaMA2` etc.

Los usuarios pueden ver sus registros, solicitudes y claves API en el [Validator Endpoint Frontend](https://api.neuralinternet.ai/). Sin embargo, los cambios en la configuración están actualmente prohibidos; de lo contrario, las consultas del usuario se bloquearán.

Si encuentra alguna dificultad o tiene alguna pregunta, no dude en comunicarse con nuestro desarrollador en [GitHub](https://github.com/Kunj-2206), [Discord](https://discordapp.com/users/683542109248159777) o únase a nuestro servidor de discord para obtener las últimas actualizaciones y consultas [Neural Internet](https://discord.gg/neuralinternet).

## Diferentes parámetros y manejo de respuestas para NIBittensorLLM

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

##  Uso de NIBittensorLLM con LLMChain y PromptTemplate

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

##  Uso de NIBittensorLLM con Conversational Agent y Google Search Tool

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
