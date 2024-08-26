---
translated: true
---

# 대화 요약 버퍼

`ConversationSummaryBufferMemory`는 두 가지 아이디어를 결합합니다. 최근 상호 작용의 버퍼를 메모리에 유지하지만, 오래된 상호 작용을 완전히 삭제하는 대신 요약을 작성하고 둘 다 사용합니다.
토큰 길이를 사용하여 상호 작용을 플러시할 시기를 결정합니다.

먼저 유틸리티 사용 방법을 살펴보겠습니다.

## LLM으로 메모리 사용하기

```python
from langchain.memory import ConversationSummaryBufferMemory
from langchain_openai import OpenAI

llm = OpenAI()
```

```python
memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=10)
memory.save_context({"input": "hi"}, {"output": "whats up"})
memory.save_context({"input": "not much you"}, {"output": "not much"})
```

```python
memory.load_memory_variables({})
```

```output
{'history': 'System: \nThe human says "hi", and the AI responds with "whats up".\nHuman: not much you\nAI: not much'}
```

메시지 목록으로 기록을 가져올 수도 있습니다(채팅 모델과 함께 사용하는 데 유용).

```python
memory = ConversationSummaryBufferMemory(
    llm=llm, max_token_limit=10, return_messages=True
)
memory.save_context({"input": "hi"}, {"output": "whats up"})
memory.save_context({"input": "not much you"}, {"output": "not much"})
```

`predict_new_summary` 메서드를 직접 사용할 수도 있습니다.

```python
messages = memory.chat_memory.messages
previous_summary = ""
memory.predict_new_summary(messages, previous_summary)
```

```output
'\nThe human and AI state that they are not doing much.'
```

## 체인에서 사용하기

다시 한 번 `verbose=True`로 설정하여 프롬프트를 볼 수 있도록 하겠습니다.

```python
from langchain.chains import ConversationChain

conversation_with_summary = ConversationChain(
    llm=llm,
    # We set a very low max_token_limit for the purposes of testing.
    memory=ConversationSummaryBufferMemory(llm=OpenAI(), max_token_limit=40),
    verbose=True,
)
conversation_with_summary.predict(input="Hi, what's up?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi, what's up?
AI:[0m

[1m> Finished chain.[0m
```

```output
" Hi there! I'm doing great. I'm learning about the latest advances in artificial intelligence. What about you?"
```

```python
conversation_with_summary.predict(input="Just working on writing some documentation!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
Human: Hi, what's up?
AI:  Hi there! I'm doing great. I'm spending some time learning about the latest developments in AI technology. How about you?
Human: Just working on writing some documentation!
AI:[0m

[1m> Finished chain.[0m
```

```output
' That sounds like a great use of your time. Do you have experience with writing documentation?'
```

```python
# We can see here that there is a summary of the conversation and then some previous interactions
conversation_with_summary.predict(input="For LangChain! Have you heard of it?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
System:
The human asked the AI what it was up to and the AI responded that it was learning about the latest developments in AI technology.
Human: Just working on writing some documentation!
AI:  That sounds like a great use of your time. Do you have experience with writing documentation?
Human: For LangChain! Have you heard of it?
AI:[0m

[1m> Finished chain.[0m
```

```output
" No, I haven't heard of LangChain. Can you tell me more about it?"
```

```python
# We can see here that the summary and the buffer are updated
conversation_with_summary.predict(
    input="Haha nope, although a lot of people confuse it for that"
)
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
System:
The human asked the AI what it was up to and the AI responded that it was learning about the latest developments in AI technology. The human then mentioned they were writing documentation, to which the AI responded that it sounded like a great use of their time and asked if they had experience with writing documentation.
Human: For LangChain! Have you heard of it?
AI:  No, I haven't heard of LangChain. Can you tell me more about it?
Human: Haha nope, although a lot of people confuse it for that
AI:[0m

[1m> Finished chain.[0m
```

```output
' Oh, okay. What is LangChain?'
```
