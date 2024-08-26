---
translated: true
---

# याद करना

अनुपयुक्त सीखने का उपयोग करके जानकारी को याद करने के लिए खुद को LLM को फाइन-ट्यून करना।

इस उपकरण के लिए फाइन-ट्यूनिंग का समर्थन करने वाले LLM की आवश्यकता होती है। वर्तमान में, केवल `langchain.llms import GradientLLM` का समर्थन किया जाता है।

## आयात

```python
import os

from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import GradientLLM
```

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप Gradient AI से अपनी API कुंजी प्राप्त करें। आपको विभिन्न मॉडल को परीक्षण और फाइन-ट्यून करने के लिए $10 का मुक्त क्रेडिट दिया जाता है।

```python
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
if not os.environ.get("GRADIENT_MODEL_ADAPTER_ID", None):
    # `ID` listed in `$ gradient model list --workspace-id "$GRADIENT_WORKSPACE_ID"`
    os.environ["GRADIENT_MODEL_ID"] = getpass("gradient.ai model id:")
```

वैकल्पिक: वर्तमान में तैनात मॉडल प्राप्त करने के लिए अपने वातावरण चर `GRADIENT_ACCESS_TOKEN` और `GRADIENT_WORKSPACE_ID` को सत्यापित करें।

## `GradientLLM` उदाहरण बनाएं

आप मॉडल का नाम, अधिकतम टोकन उत्पन्न, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं।

```python
llm = GradientLLM(
    model_id=os.environ["GRADIENT_MODEL_ID"],
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
)
```

## उपकरण लोड करें

```python
tools = load_tools(["memorize"], llm=llm)
```

## एजेंट प्रारंभ करें

```python
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    # memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
)
```

## एजेंट चलाएं

एजेंट से एक टुकड़ा पाठ्य को याद करने के लिए कहें।

```python
agent.run(
    "Please remember the fact in detail:\nWith astonishing dexterity, Zara Tubikova set a world record by solving a 4x4 Rubik's Cube variation blindfolded in under 20 seconds, employing only their feet."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should memorize this fact.
Action: Memorize
Action Input: Zara T[0m
Observation: [36;1m[1;3mTrain complete. Loss: 1.6853971333333335[0m
Thought:[32;1m[1;3mI now know the final answer.
Final Answer: Zara Tubikova set a world[0m

[1m> Finished chain.[0m
```

```output
'Zara Tubikova set a world'
```
