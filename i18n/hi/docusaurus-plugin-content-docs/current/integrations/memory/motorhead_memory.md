---
translated: true
---

# मोटरहेड

>[मोटरहेड](https://github.com/getmetal/motorhead) एक रस्ट में कार्यान्वित मेमोरी सर्वर है। यह पृष्ठभूमि में स्वचालित रूप से क्रमिक सारांशीकरण को संभालता है और स्थिरता रहित अनुप्रयोगों की अनुमति देता है।

## सेटअप

स्थानीय रूप से सर्वर चलाने के लिए [मोटरहेड](https://github.com/getmetal/motorhead) पर दिए गए निर्देशों का अनुसरण करें।

```python
from langchain.memory.motorhead_memory import MotorheadMemory
```

## उदाहरण

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

template = """You are a chatbot having a conversation with a human.

{chat_history}
Human: {human_input}
AI:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "human_input"], template=template
)
memory = MotorheadMemory(
    session_id="testing-1", url="http://localhost:8080", memory_key="chat_history"
)

await memory.init()
# loads previous state from Motörhead 🤘

llm_chain = LLMChain(
    llm=OpenAI(),
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
llm_chain.run("hi im bob")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.


Human: hi im bob
AI:[0m

[1m> Finished chain.[0m
```

```output
' Hi Bob, nice to meet you! How are you doing today?'
```

```python
llm_chain.run("whats my name?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: hi im bob
AI:  Hi Bob, nice to meet you! How are you doing today?
Human: whats my name?
AI:[0m

[1m> Finished chain.[0m
```

```output
' You said your name is Bob. Is that correct?'
```

```python
llm_chain.run("whats for dinner?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: hi im bob
AI:  Hi Bob, nice to meet you! How are you doing today?
Human: whats my name?
AI:  You said your name is Bob. Is that correct?
Human: whats for dinner?
AI:[0m

[1m> Finished chain.[0m
```

```output
"  I'm sorry, I'm not sure what you're asking. Could you please rephrase your question?"
```
