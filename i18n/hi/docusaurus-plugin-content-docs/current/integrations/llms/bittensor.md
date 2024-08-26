---
translated: true
---

# बिटसेंसर

>[बिटसेंसर](https://bittensor.com/) एक माइनिंग नेटवर्क है, जो बिटकॉइन के समान है, जिसमें बिल्ट-इन प्रोत्साहन शामिल हैं जो माइनर्स को कंप्यूट + ज्ञान योगदान करने के लिए प्रोत्साहित करते हैं।

>`NIBittensorLLM` [न्यूरल इंटरनेट](https://neuralinternet.ai/) द्वारा विकसित किया गया है, जो `बिटसेंसर` द्वारा संचालित है।

>यह एलएलएम `बिटसेंसर प्रोटोकॉल` से सर्वश्रेष्ठ प्रतिक्रिया(ओं) प्रदान करके विकेंद्रीकृत एआई के वास्तविक क्षमता का प्रदर्शन करता है, जिसमें `OpenAI`, `LLaMA2` आदि जैसे विभिन्न एआई मॉडल शामिल हैं।

उपयोगकर्ता [वैलिडेटर एंडपॉइंट फ्रंटएंड](https://api.neuralinternet.ai/) पर अपने लॉग, अनुरोध और API कुंजियों को देख सकते हैं। हालांकि, कॉन्फ़िगरेशन में परिवर्तन वर्तमान में प्रतिबंधित हैं; अन्यथा, उपयोगकर्ता के क्वेरी अवरुद्ध कर दिए जाएंगे।

यदि आप किसी भी कठिनाई का सामना करते हैं या किसी भी प्रश्न हैं, तो कृपया [GitHub](https://github.com/Kunj-2206), [Discord](https://discordapp.com/users/683542109248159777) पर हमारे डेवलपर से संपर्क करें या नवीनतम अपडेट और प्रश्नों के लिए हमारे Discord सर्वर [न्यूरल इंटरनेट](https://discord.gg/neuralinternet) में शामिल हों।

## NIBittensorLLM के लिए विभिन्न पैरामीटर और प्रतिक्रिया हैंडलिंग

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

##  LLMChain और PromptTemplate के साथ NIBittensorLLM का उपयोग करना

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

##  कन्वर्सेशनल एजेंट और Google Search Tool के साथ NIBittensorLLM का उपयोग करना

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
