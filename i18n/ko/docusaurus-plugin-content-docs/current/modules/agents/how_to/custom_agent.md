---
sidebar_position: 0
translated: true
---

# 사용자 정의 에이전트

이 노트북에서는 사용자 정의 에이전트를 만드는 방법을 살펴봅니다.

이 예에서는 OpenAI Tool Calling을 사용하여 이 에이전트를 만들 것입니다.
**이것은 일반적으로 에이전트를 만드는 가장 안정적인 방법입니다.**

먼저 메모리 없이 만들 것이지만, 그 다음에는 메모리를 추가하는 방법을 보여줄 것입니다.
대화를 가능하게 하려면 메모리가 필요합니다.

## LLM 로드하기

먼저 에이전트를 제어할 언어 모델을 로드해 보겠습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

## 도구 정의하기

다음으로 사용할 도구를 정의해 보겠습니다.
전달된 단어의 길이를 계산하는 매우 간단한 Python 함수를 작성해 보겠습니다.

여기서 사용하는 함수 문서 문자열이 매우 중요하다는 점에 유의하세요. 이 이유에 대해 자세히 알아보려면 [여기](/docs/modules/tools/custom_tools)를 참조하세요.

```python
from langchain.agents import tool


@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)


get_word_length.invoke("abc")
```

```output
3
```

```python
tools = [get_word_length]
```

## 프롬프트 만들기

이제 프롬프트를 만들어 보겠습니다.
OpenAI Function Calling은 도구 사용을 위해 미세 조정되었기 때문에, 추론 방법이나 출력 형식에 대한 지침이 거의 필요하지 않습니다.
우리는 `input`과 `agent_scratchpad`라는 두 개의 입력 변수만 가질 것입니다. `input`은 사용자 목적을 포함하는 문자열이어야 합니다. `agent_scratchpad`는 이전 에이전트 도구 호출과 해당 도구 출력을 포함하는 메시지 시퀀스여야 합니다.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but don't know current events",
        ),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

## LLM에 도구 바인딩하기

에이전트는 어떻게 사용할 수 있는 도구를 알 수 있습니까?

이 경우 우리는 OpenAI tool calling LLM을 사용하고 있으며, 이 LLM은 도구를 별도의 인수로 받고 언제 그러한 도구를 호출해야 하는지 특별히 훈련되었습니다.

에이전트에 우리의 도구를 전달하려면 [OpenAI tool format](https://platform.openai.com/docs/api-reference/chat/create)에 맞게 형식을 지정하고 모델에 전달하면 됩니다. (함수를 `bind`하여 모델이 호출될 때마다 전달되도록 합니다.)

```python
llm_with_tools = llm.bind_tools(tools)
```

## 에이전트 만들기

이러한 구성 요소를 모아서 이제 에이전트를 만들 수 있습니다.
마지막으로 두 가지 유틸리티 함수를 가져올 것입니다: 중간 단계(에이전트 작업, 도구 출력 쌍)를 모델에 보낼 수 있는 입력 메시지로 형식화하는 구성 요소와 출력 메시지를 에이전트 작업/에이전트 완료로 변환하는 구성 요소입니다.

```python
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser

agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
```

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
list(agent_executor.stream({"input": "How many letters in the word eudca"}))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'eudca'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "eudca".[0m

[1m> Finished chain.[0m
```

```output
[{'actions': [OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg')],
  'messages': [AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})]},
 {'steps': [AgentStep(action=OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg'), observation=5)],
  'messages': [FunctionMessage(content='5', name='get_word_length')]},
 {'output': 'There are 5 letters in the word "eudca".',
  'messages': [AIMessage(content='There are 5 letters in the word "eudca".')]}]
```

기본 LLM과 비교하면 LLM만으로는 어려움을 겪습니다.

```python
llm.invoke("How many letters in the word educa")
```

```output
AIMessage(content='There are 6 letters in the word "educa".')
```

## 메모리 추가하기

이것은 훌륭합니다 - 우리에게 에이전트가 있습니다!
그러나 이 에이전트는 상태가 없습니다 - 이전 상호 작용에 대해 기억하지 않습니다.
이는 후속 질문을 쉽게 할 수 없다는 의미입니다.
메모리를 추가하여 이를 수정해 보겠습니다.

메모리를 추가하려면 두 가지를 해야 합니다:

1. 프롬프트에 메모리 변수를 넣을 공간 추가
2. 채팅 기록 추적

먼저 프롬프트에 메모리 공간을 추가해 보겠습니다.
`"chat_history"`라는 키로 메시지 자리 표시자를 추가합니다.
새 사용자 입력 앞에 이를 배치하는 것에 유의하세요(대화 흐름을 따르기 위해).

```python
from langchain_core.prompts import MessagesPlaceholder

MEMORY_KEY = "chat_history"
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but bad at calculating lengths of words.",
        ),
        MessagesPlaceholder(variable_name=MEMORY_KEY),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

그런 다음 채팅 기록을 추적할 목록을 설정할 수 있습니다.

```python
from langchain_core.messages import AIMessage, HumanMessage

chat_history = []
```

이제 모든 것을 함께 넣어 보겠습니다!

```python
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
        "chat_history": lambda x: x["chat_history"],
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

실행할 때 이제 입력과 출력을 채팅 기록으로 추적해야 합니다.

```python
input1 = "how many letters in the word educa?"
result = agent_executor.invoke({"input": input1, "chat_history": chat_history})
chat_history.extend(
    [
        HumanMessage(content=input1),
        AIMessage(content=result["output"]),
    ]
)
agent_executor.invoke({"input": "is that a real word?", "chat_history": chat_history})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'educa'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "educa".[0m

[1m> Finished chain.[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mNo, "educa" is not a real word in English.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'is that a real word?',
 'chat_history': [HumanMessage(content='how many letters in the word educa?'),
  AIMessage(content='There are 5 letters in the word "educa".')],
 'output': 'No, "educa" is not a real word in English.'}
```
