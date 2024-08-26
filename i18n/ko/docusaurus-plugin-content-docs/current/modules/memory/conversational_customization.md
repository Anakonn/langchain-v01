---
translated: true
---

# 대화 메모리 사용자 정의

이 노트북에서는 대화 메모리를 사용자 정의하는 몇 가지 방법을 살펴봅니다.

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
```

## AI 접두사

첫 번째 방법은 대화 요약에서 AI 접두사를 변경하는 것입니다. 기본적으로 이것은 "AI"로 설정되어 있지만, 원하는 것으로 설정할 수 있습니다. 이를 변경하는 경우 체인에 사용되는 프롬프트도 이 이름 변경을 반영하여 변경해야 합니다. 아래 예제에서 이에 대한 예를 살펴보겠습니다.

```python
# Here it is by default set to "AI"
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI:  Hi there! It's nice to meet you. How can I help you today?
Human: What's the weather?
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The current weather is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the next few days is sunny with temperatures in the mid-70s.'
```

```python
# Now we can override it and set it to "AI Assistant"
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI Assistant:"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
conversation = ConversationChain(
    prompt=PROMPT,
    llm=llm,
    verbose=True,
    memory=ConversationBufferMemory(ai_prefix="AI Assistant"),
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI Assistant:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI Assistant:  Hi there! It's nice to meet you. How can I help you today?
Human: What's the weather?
AI Assistant:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The current weather is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the rest of the day is sunny with a high of 78 degrees and a low of 65 degrees.'
```

## 사용자 접두사

다음 방법은 대화 요약에서 사용자 접두사를 변경하는 것입니다. 기본적으로 이것은 "Human"으로 설정되어 있지만, 원하는 것으로 설정할 수 있습니다. 이를 변경하는 경우 체인에 사용되는 프롬프트도 이 이름 변경을 반영하여 변경해야 합니다. 아래 예제에서 이에 대한 예를 살펴보겠습니다.

```python
# Now we can override it and set it to "Friend"
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Friend: {input}
AI:"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
conversation = ConversationChain(
    prompt=PROMPT,
    llm=llm,
    verbose=True,
    memory=ConversationBufferMemory(human_prefix="Friend"),
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Friend: Hi there!
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Friend: Hi there!
AI:  Hi there! It's nice to meet you. How can I help you today?
Friend: What's the weather?
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The weather right now is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the rest of the day is mostly sunny with a high of 82 degrees.'
```
