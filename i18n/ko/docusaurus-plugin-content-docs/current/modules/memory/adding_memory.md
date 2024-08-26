---
translated: true
---

# LLMChain의 메모리

이 노트북에서는 `LLMChain`에서 Memory 클래스를 사용하는 방법을 살펴봅니다.

[ConversationBufferMemory](https://api.python.langchain.com/en/latest/memory/langchain.memory.buffer.ConversationBufferMemory.html#langchain.memory.buffer.ConversationBufferMemory) 클래스를 추가할 것이지만, 이는 어떤 메모리 클래스라도 가능합니다.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

가장 중요한 단계는 프롬프트를 올바르게 설정하는 것입니다. 아래 프롬프트에서 우리는 두 개의 입력 키를 가지고 있습니다: 하나는 실제 입력을, 다른 하나는 Memory 클래스의 입력을 위한 것입니다. 중요한 것은 `PromptTemplate`와 `ConversationBufferMemory`의 키가 일치(`chat_history`)하도록 하는 것입니다.

```python
template = """You are a chatbot having a conversation with a human.

{chat_history}
Human: {human_input}
Chatbot:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "human_input"], template=template
)
memory = ConversationBufferMemory(memory_key="chat_history")
```

```python
llm = OpenAI()
llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.


Human: Hi there my friend
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
' Hi there! How can I help you today?'
```

```python
llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: Hi there my friend
AI:  Hi there! How can I help you today?
Human: Not too bad - how are you?
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
" I'm doing great, thanks for asking! How are you doing?"
```

## 채팅 모델 기반 `LLMChain`에 메모리 추가하기

위의 내용은 완성 스타일 `LLM`에 적용되지만, 채팅 모델을 사용하는 경우 구조화된 채팅 메시지를 사용하면 성능이 더 좋을 것입니다. 아래는 그 예시입니다.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
```

[ChatPromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate) 클래스를 사용하여 채팅 프롬프트를 설정할 것입니다.

[from_messages](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html#langchain_core.prompts.chat.ChatPromptTemplate.from_messages) 메서드는 메시지 목록(예: `SystemMessage`, `HumanMessage`, `AIMessage`, `ChatMessage` 등) 또는 메시지 템플릿(예: 아래의 [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html#langchain_core.prompts.chat.MessagesPlaceholder))에서 `ChatPromptTemplate`를 생성합니다.

아래 구성에서는 메모리가 채팅 프롬프트의 중간에 `chat_history` 키로 삽입되고, 사용자의 입력은 채팅 프롬프트의 끝에 사용자/인간 메시지로 추가됩니다.

```python
prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content="You are a chatbot having a conversation with a human."
        ),  # The persistent system prompt
        MessagesPlaceholder(
            variable_name="chat_history"
        ),  # Where the memory will be stored.
        HumanMessagePromptTemplate.from_template(
            "{human_input}"
        ),  # Where the human input will injected
    ]
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

```python
llm = ChatOpenAI()

chat_llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
chat_llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend[0m

[1m> Finished chain.[0m
```

```output
'Hello! How can I assist you today, my friend?'
```

```python
chat_llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend
AI: Hello! How can I assist you today, my friend?
Human: Not too bad - how are you?[0m

[1m> Finished chain.[0m
```

```output
"I'm an AI chatbot, so I don't have feelings, but I'm here to help and chat with you! Is there something specific you would like to talk about or any questions I can assist you with?"
```
