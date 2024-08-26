---
translated: true
---

# 비트센서

>[비트센서](https://bittensor.com/)는 마이너가 컴퓨팅 파워와 지식을 기여하도록 장려하는 내장형 인센티브가 있는 Bitcoin과 유사한 마이닝 네트워크입니다.

>`NIBittensorLLM`은 `Bittensor`로 구동되는 [Neural Internet](https://neuralinternet.ai/)에서 개발되었습니다.

>이 LLM은 `OpenAI`, `LLaMA2` 등 다양한 AI 모델로 구성된 `Bittensor 프로토콜`에서 최상의 응답을 제공함으로써 분산형 AI의 진정한 잠재력을 보여줍니다.

사용자는 [Validator Endpoint Frontend](https://api.neuralinternet.ai/)에서 로그, 요청 및 API 키를 볼 수 있습니다. 그러나 현재 구성 변경은 금지되어 있으며, 그렇지 않으면 사용자의 쿼리가 차단됩니다.

어려움이 있거나 질문이 있는 경우 [GitHub](https://github.com/Kunj-2206), [Discord](https://discordapp.com/users/683542109248159777) 또는 최신 업데이트 및 질문을 위한 [Neural Internet](https://discord.gg/neuralinternet) Discord 서버에 문의하시기 바랍니다.

## NIBittensorLLM에 대한 다른 매개변수 및 응답 처리

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

##  LLMChain 및 PromptTemplate을 사용한 NIBittensorLLM 사용

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

##  Conversational Agent 및 Google Search Tool을 사용한 NIBittensorLLM 사용

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
