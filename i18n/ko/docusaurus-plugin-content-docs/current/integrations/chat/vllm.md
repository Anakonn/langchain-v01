---
sidebar_label: vLLM Chat
translated: true
---

# vLLM Chat

vLLM은 OpenAI API 프로토콜을 모방한 서버로 배포될 수 있습니다. 이를 통해 vLLM은 OpenAI API를 사용하는 애플리케이션에 대체제로 사용될 수 있습니다. 이 서버는 OpenAI API와 동일한 형식으로 쿼리할 수 있습니다.

이 노트북은 langchain의 `ChatOpenAI`를 사용하여 vLLM 채팅 모델을 시작하는 방법을 다룹니다.

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
```

```python
inference_server_url = "http://localhost:8000/v1"

chat = ChatOpenAI(
    model="mosaicml/mpt-7b",
    openai_api_key="EMPTY",
    openai_api_base=inference_server_url,
    max_tokens=5,
    temperature=0,
)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to Italian."
    ),
    HumanMessage(
        content="Translate the following sentence from English to Italian: I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content=' Io amo programmare', additional_kwargs={}, example=False)
```

`MessagePromptTemplate`를 사용하여 템플릿을 만들 수 있습니다. 여러 개의 `MessagePromptTemplate`을 사용하여 `ChatPromptTemplate`을 구성할 수 있습니다. ChatPromptTemplate의 `format_prompt`를 사용하여 포맷된 값을 반환받을 수 있으며, 이를 문자열이나 `Message` 객체로 변환할 수 있습니다.

편의를 위해 템플릿에는 `from_template` 메서드가 제공됩니다. 이 템플릿을 사용하는 예시는 다음과 같습니다:

```python
template = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
```

```python
chat_prompt = ChatPromptTemplate.from_messages(
    [system_message_prompt, human_message_prompt]
)

# 포맷된 메시지로부터 채팅 완성을 얻습니다.

chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="Italian", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content=' Io amo programmare anch’io.', additional_kwargs={}, example=False)
```