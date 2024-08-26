---
translated: true
---

# Motörhead

>[Motörhead](https://github.com/getmetal/motorhead)는 Rust로 구현된 메모리 서버입니다. 자동으로 백그라운드에서 증분 요약을 처리하며 상태 없는 애플리케이션을 허용합니다.

## 설정

[Motörhead](https://github.com/getmetal/motorhead)에서 로컬 서버 실행 지침을 참조하세요.

```python
from langchain.memory.motorhead_memory import MotorheadMemory
```

## 예시

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
