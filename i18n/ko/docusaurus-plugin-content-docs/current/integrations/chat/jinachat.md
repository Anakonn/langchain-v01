---
translated: true
---

# JinaChat

이 노트북에서는 JinaChat 채팅 모델을 시작하는 방법을 다룹니다.

```python
from langchain_community.chat_models import JinaChat
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

```python
chat = JinaChat(temperature=0)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```

`MessagePromptTemplate`을 사용하여 템플릿을 사용할 수 있습니다. 하나 이상의 `MessagePromptTemplates`에서 `ChatPromptTemplate`을 만들 수 있습니다. `ChatPromptTemplate`의 `format_prompt`를 사용할 수 있으며, 이는 `PromptValue`를 반환합니다. 이를 문자열이나 Message 객체로 변환할 수 있으며, 형식화된 값을 llm이나 채팅 모델의 입력으로 사용할지 여부에 따라 다릅니다.

편의를 위해 템플릿에 노출된 `from_template` 메서드가 있습니다. 이 템플릿을 사용하면 다음과 같이 보일 것입니다:

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

# 형식화된 메시지에서 채팅 완료를 가져옵니다

chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="French", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```