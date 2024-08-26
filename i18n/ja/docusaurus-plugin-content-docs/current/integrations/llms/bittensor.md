---
translated: true
---

# Bittensor

>[Bittensor](https://bittensor.com/)は、マイナーに計算能力と知識への貢献を奨励するための組み込みインセンティブを含む、Bitcoinに似たマイニングネットワークです。
>
>`NIBittensorLLM`は[Neural Internet](https://neuralinternet.ai/)によって開発され、`Bittensor`によって動作しています。

>このLLMは、`Bittensor protocol`から最良の応答を提供することで、分散型AIの真の可能性を示しています。`Bittensor protocol`には`OpenAI`、`LLaMA2`などの様々なAIモデルが含まれています。

ユーザーは[Validator Endpoint Frontend](https://api.neuralinternet.ai/)でログ、リクエスト、APIキーを表示できますが、現在設定の変更は禁止されており、そうしないとユーザーのクエリがブロックされます。

困難が生じたり質問がある場合は、[GitHub](https://github.com/Kunj-2206)、[Discord](https://discordapp.com/users/683542109248159777)、または[Neural Internet](https://discord.gg/neuralinternet)のDiscordサーバーにご連絡ください。

## NIBittensorLLMの異なるパラメータと応答の処理

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

##  LLMChainとPromptTemplateを使ったNIBittensorLLMの使用

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

##  会話エージェントとGoogle検索ツールを使ったNIBittensorLLMの使用

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
