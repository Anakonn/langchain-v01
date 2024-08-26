---
sidebar_position: 1
translated: true
---

# 메모리 관리

챗봇의 핵심 기능 중 하나는 이전 대화 턴의 내용을 컨텍스트로 사용할 수 있는 능력입니다. 이러한 상태 관리는 여러 형태를 취할 수 있으며, 다음과 같은 방법이 포함됩니다:

- 이전 메시지를 단순히 채팅 모델 프롬프트에 추가하기
- 위 방법에서 오래된 메시지를 잘라내어 모델이 처리해야 할 분산된 정보를 줄이기
- 긴 대화의 경우 요약을 생성하는 등 더 복잡한 수정

아래에서 몇 가지 기술에 대해 자세히 설명하겠습니다!

## 설정

몇 가지 패키지를 설치하고 OpenAI API 키를 `OPENAI_API_KEY`라는 환경 변수로 설정해야 합니다:

```python
%pip install --upgrade --quiet langchain langchain-openai

# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드:

import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

아래 예제에서 사용할 채팅 모델도 설정해 보겠습니다.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
```

## 메시지 전달

가장 간단한 형태의 메모리는 채팅 기록 메시지를 체인에 전달하는 것입니다. 다음은 예제입니다:

```python
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

이전 대화를 체인에 전달하여 컨텍스트로 사용할 수 있음을 알 수 있습니다. 이것이 챗봇 메모리의 기본 개념입니다. 나머지 가이드에서는 메시지를 전달하거나 재포맷하는 편리한 기술을 설명합니다.

## 채팅 기록

메시지를 배열로 직접 저장하고 전달하는 것은 전혀 문제 없지만, LangChain의 내장된 [메시지 기록 클래스](/docs/modules/memory/chat_messages/)를 사용하여 메시지를 저장하고 로드할 수도 있습니다. 이 클래스의 인스턴스는 지속적인 저장소에서 채팅 메시지를 저장하고 로드하는 역할을 합니다. LangChain은 많은 제공자와 통합됩니다 - [여기에서 통합 목록을 확인할 수 있습니다](/docs/integrations/memory) - 하지만 이 데모에서는 임시 데모 클래스를 사용합니다.

다음은 API 예제입니다:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```

이를 사용하여 대화 턴을 체인에 직접 저장할 수 있습니다:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```

```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.')
```

## 자동 기록 관리

이전 예제에서는 메시지를 체인에 명시적으로 전달했습니다. 이것은 전혀 문제 없는 접근 방식이지만, 새 메시지의 외부 관리를 요구합니다. LangChain에는 이 과정을 자동으로 처리할 수 있는 `RunnableWithMessageHistory`라는 LCEL 체인을 위한 래퍼도 포함되어 있습니다.

작동 방식을 보여주기 위해, 위의 프롬프트를 약간 수정하여 마지막 `input` 변수를 대화 기록 후에 `HumanMessage` 템플릿을 채우도록 설정하겠습니다. 이는 현재 메시지 이전의 모든 메시지를 포함하는 `chat_history` 매개변수를 예상한다는 것을 의미합니다:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

여기서는 대화의 최신 입력을 전달하고 `RunnableWithMessageHistory` 클래스가 우리의 체인을 감싸고 그 `input` 변수를 대화 기록에 추가하는 작업을 처리하도록 하겠습니다.

다음으로 래핑된 체인을 선언하겠습니다:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

이 클래스는 우리가 래핑하고자 하는 체인 외에도 몇 가지 매개변수를 필요로 합니다:

- 주어진 세션 ID에 대한 메시지 기록을 반환하는 팩토리 함수. 이를 통해 여러 사용자를 한 번에 처리하고 서로 다른 대화에 대한 메시지를 로드할 수 있습니다.
- 추적하고 저장할 입력 메시지를 지정하는 `input_messages_key`. 이 예제에서는 `input`으로 전달된 문자열을 추적하고자 합니다.
- 이전 메시지를 프롬프트에 삽입할 위치를 지정하는 `history_messages_key`. 우리의 프롬프트에는 `MessagesPlaceholder`가 `chat_history`라는 이름으로 있으므로 이 속성을 일치시키기 위해 지정합니다.
- (여러 출력이 있는 체인의 경우) 기록으로 저장할 출력을 지정하는 `output_messages_key`. 이는 `input_messages_key`의 반대입니다.

이 새로운 체인을 추가 `configurable` 필드와 함께 정상적으로 호출할 수 있으며, 이는 팩토리 함수에 전달할 특정 `session_id`를 지정합니다. 이 데모에서는 사용되지 않지만 실제 체인에서는 전달된 세션에 해당하는 채팅 기록을 반환하고자 할 것입니다:

```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```

```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.')
```

## 채팅 기록 수정

저장된 채팅 메시지를 수정하면 챗봇이 다양한 상황을 처리하는 데 도움이 될 수 있습니다. 다음은 몇 가지 예입니다:

### 메시지 자르기

LLM 및 채팅 모델에는 제한된 컨텍스트 창이 있으며, 제한에 직접 도달하지 않더라도 모델이 처리해야 할 분산된 정보를 줄이고자 할 수 있습니다. 한 가지 해결책은 가장 최근의 `n`개의 메시지만 로드하고 저장하는 것입니다. 사전 로드된 메시지가 있는 예제 기록을 사용해 보겠습니다:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

위에서 선언한 `RunnableWithMessageHistory` 체인과 이 메시지 기록을 사용해 보겠습니다:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='Your name is Nemo.')
```

체인이 미리 로드된 이름을 기억하고 있음을 알 수 있습니다.

하지만 매우 작은 컨텍스트 창이 있으며 체인에 전달할 메시지 수를 가장 최근의 2개로 줄이고자 한다고 가정해 보겠습니다. `clear` 메서드를 사용하여 메시지를 제거하고 기록에 다시 추가할 수 있습니다. 이를 항상 호출하도록 체인의 앞부분에 이 메서드를 넣겠습니다:

```python
from langchain_core.runnables import RunnablePassthrough


def trim_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) <= 2:
        return False

    demo_ephemeral_chat_history.clear()

    for message in stored_messages[-2:]:
        demo_ephemeral_chat_history.add_message(message)

    return True


chain_with_trimming = (
    RunnablePassthrough.assign(messages_trimmed=trim_messages)
    | chain_with_message_history
)
```

이 새로운 체인을 호출하고 이후의 메시지를 확인해 보겠습니다:

```python
chain_with_trimming.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.'),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")]
```

가장 오래된 두 개의 메시지를 제거하고 가장 최근의 대화를 끝에 추가했음을 알 수 있습니다. 체인이 다시 호출되면 `trim_messages`가 다시 호출되며 가장 최근의 두 개의 메시지만 모델에 전달됩니다. 이 경우 다음에 체인을 호출할 때 모델이 우리가 알려준 이름을 잊게 됩니다:

```python
chain_with_trimming.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="I'm sorry, I don't have access to your personal information.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney."),
 HumanMessage(content='What is my name?'),
 AIMessage(content="I'm sorry, I don't have access to your personal information.")]
```

### 요약 메모리

이 동일한 패턴을 다른 방식으로도 사용할 수 있습니다. 예를 들어, 체인을 호출하기 전에 이전 상호작용을 요약으로 생성하기 위해 추가 LLM 호출을 사용할 수 있습니다. 채팅 기록과 챗봇 체인을 다시 생성해 보겠습니다:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

LLM이 요약된 기록을 대신 수신하게 될 것임을 인식하도록 프롬프트를 약간 수정하겠습니다:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

이제 이전 상호작용을 요약으로 정제하는 함수를 만들어 보겠습니다. 이 함수를 체인의 앞부분에 추가하겠습니다:

```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

우리가 준 이름을 기억하는지 확인해 보겠습니다:

```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```

```python
demo_ephemeral_chat_history.messages
```

```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```

체인을 다시 호출하면 초기 요약 메시지와 새 메시지에서 생성된 또 다른 요약이 생성됩니다. 또한 일부 메시지는 대화 기록에 남겨두고 다른 메시지를 요약하는 하이브리드 접근 방식도 설계할 수 있습니다.