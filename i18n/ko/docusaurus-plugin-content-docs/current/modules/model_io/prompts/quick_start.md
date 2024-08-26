---
sidebar_position: 0
title: 빠른 참조
translated: true
---

# 빠른 참조

프롬프트 템플릿은 언어 모델에 대한 프롬프트를 생성하기 위한 사전 정의된 레시피입니다.

템플릿에는 지침, 몇 가지 예제, 그리고 특정 작업에 적합한 특정 컨텍스트와 질문이 포함될 수 있습니다.

LangChain은 다양한 언어 모델에서 기존 템플릿을 재사용할 수 있도록 모델 독립적인 템플릿을 만드는 도구를 제공합니다.

일반적으로 언어 모델은 프롬프트를 문자열 또는 채팅 메시지 목록으로 받습니다.

## `PromptTemplate`

`PromptTemplate`를 사용하여 문자열 프롬프트에 대한 템플릿을 만듭니다.

기본적으로 `PromptTemplate`는 [Python의 str.format](https://docs.python.org/3/library/stdtypes.html#str.format) 구문을 사용하여 템플릿을 작성합니다.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)
prompt_template.format(adjective="funny", content="chickens")
```

```output
'Tell me a funny joke about chickens.'
```

템플릿은 변수가 없는 경우를 포함하여 어떤 수의 변수도 지원합니다:

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template("Tell me a joke")
prompt_template.format()
```

```output
'Tell me a joke'
```

원하는 방식으로 프롬프트를 형식화하는 사용자 정의 프롬프트 템플릿을 만들 수 있습니다. 자세한 내용은 [Prompt Template Composition](/docs/modules/model_io/prompts/composition/)을 참조하세요.

## `ChatPromptTemplate`

[채팅 모델](/docs/modules/model_io/chat)에 대한 프롬프트는 [채팅 메시지](/docs/modules/model_io/chat/message_types/)의 목록입니다.

각 채팅 메시지는 내용과 `role`이라는 추가 매개변수와 연결됩니다. 예를 들어, OpenAI [Chat Completions API](https://platform.openai.com/docs/guides/chat/introduction)에서 채팅 메시지는 AI 어시스턴트, 사용자 또는 시스템 역할과 연결될 수 있습니다.

다음과 같이 채팅 프롬프트 템플릿을 만듭니다:

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot. Your name is {name}."),
        ("human", "Hello, how are you doing?"),
        ("ai", "I'm doing well, thanks!"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
```

이러한 형식화된 메시지를 LangChain의 `ChatOpenAI` 채팅 모델 클래스에 전달하는 것은 OpenAI 클라이언트를 직접 사용하는 것과 대략 동등합니다:

```python
%pip install openai
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful AI bot. Your name is Bob."},
        {"role": "user", "content": "Hello, how are you doing?"},
        {"role": "assistant", "content": "I'm doing well, thanks!"},
        {"role": "user", "content": "What is your name?"},
    ],
)
```

`ChatPromptTemplate.from_messages` 정적 메서드는 다양한 메시지 표현을 허용하며, 원하는 메시지로 채팅 모델에 입력을 형식화하는 편리한 방법입니다.

예를 들어, 위에서 사용한 (type, content) 2-튜플 표현 외에도 `MessagePromptTemplate` 또는 `BaseMessage` 인스턴스를 전달할 수 있습니다.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)
messages = chat_template.format_messages(text="I don't like eating tasty things")
print(messages)
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."), HumanMessage(content="I don't like eating tasty things")]
```

이를 통해 채팅 프롬프트를 구성하는 방법에 많은 유연성을 제공합니다.

## 메시지 프롬프트

LangChain은 다양한 유형의 `MessagePromptTemplate`를 제공합니다. 가장 일반적으로 사용되는 것은 `AIMessagePromptTemplate`, `SystemMessagePromptTemplate` 및 `HumanMessagePromptTemplate`로, 각각 AI 메시지, 시스템 메시지 및 사용자 메시지를 생성합니다. [다양한 유형의 메시지에 대해 자세히 알아보세요](/docs/modules/model_io/chat/message_types).

채팅 모델이 임의의 역할을 가진 채팅 메시지를 받을 수 있는 경우, `ChatMessagePromptTemplate`를 사용할 수 있습니다. 이를 통해 사용자가 역할 이름을 지정할 수 있습니다.

```python
from langchain_core.prompts import ChatMessagePromptTemplate

prompt = "May the {subject} be with you"

chat_message_prompt = ChatMessagePromptTemplate.from_template(
    role="Jedi", template=prompt
)
chat_message_prompt.format(subject="force")
```

```output
ChatMessage(content='May the force be with you', role='Jedi')
```

## `MessagesPlaceholder`

LangChain은 또한 `MessagesPlaceholder`를 제공하여 형식화 중에 렌더링할 메시지를 완전히 제어할 수 있습니다. 메시지 프롬프트 템플릿에 어떤 역할을 사용해야 할지 확실하지 않거나 목록의 메시지를 삽입하고 싶을 때 유용할 수 있습니다.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

human_prompt = "Summarize our conversation so far in {word_count} words."
human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

chat_prompt = ChatPromptTemplate.from_messages(
    [MessagesPlaceholder(variable_name="conversation"), human_message_template]
)
```

```python
from langchain_core.messages import AIMessage, HumanMessage

human_message = HumanMessage(content="What is the best way to learn programming?")
ai_message = AIMessage(
    content="""\
1. Choose a programming language: Decide on a programming language that you want to learn.

2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.

3. Practice, practice, practice: The best way to learn programming is through hands-on experience\
"""
)

chat_prompt.format_prompt(
    conversation=[human_message, ai_message], word_count="10"
).to_messages()
```

```output
[HumanMessage(content='What is the best way to learn programming?'),
 AIMessage(content='1. Choose a programming language: Decide on a programming language that you want to learn.\n\n2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.\n\n3. Practice, practice, practice: The best way to learn programming is through hands-on experience'),
 HumanMessage(content='Summarize our conversation so far in 10 words.')]
```

메시지 프롬프트 템플릿 유형의 전체 목록은 다음과 같습니다:

* [AIMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.AIMessagePromptTemplate.html), AI 어시스턴트 메시지용;
* [SystemMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html), 시스템 메시지용;
* [HumanMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html), 사용자 메시지용;
* [ChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatMessagePromptTemplate.html), 임의의 역할을 가진 메시지용;
* [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html), 메시지 목록을 수용합니다.

## LCEL

`PromptTemplate`와 `ChatPromptTemplate`는 [Runnable 인터페이스](/docs/expression_language/interface)를 구현하며, [LangChain Expression Language (LCEL)](/docs/expression_language/)의 기본 구성 요소입니다. 이는 `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` 호출을 지원함을 의미합니다.

`PromptTemplate`는 프롬프트 변수의 사전을 받아 `StringPromptValue`를 반환합니다. `ChatPromptTemplate`는 사전을 받아 `ChatPromptValue`를 반환합니다.

```python
prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)

prompt_val = prompt_template.invoke({"adjective": "funny", "content": "chickens"})
prompt_val
```

```output
StringPromptValue(text='Tell me a funny joke about chickens.')
```

```python
prompt_val.to_string()
```

```output
'Tell me a funny joke about chickens.'
```

```python
prompt_val.to_messages()
```

```output
[HumanMessage(content='Tell me a funny joke about chickens.')]
```

```python
chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

chat_val = chat_template.invoke({"text": "i dont like eating tasty things."})
```

```python
chat_val.to_messages()
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."),
 HumanMessage(content='i dont like eating tasty things.')]
```

```python
chat_val.to_string()
```

```output
"System: You are a helpful assistant that re-writes the user's text to sound more upbeat.\nHuman: i dont like eating tasty things."
```
