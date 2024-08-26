---
translated: true
---

# JinaChat

このノートブックでは、JinaChatチャットモデルの使い始め方について説明します。

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

テンプレートを使用するには、`MessagePromptTemplate`を使用できます。1つ以上の`MessagePromptTemplate`から`ChatPromptTemplate`を構築できます。`ChatPromptTemplate`の`format_prompt`を使用すると、LLMまたはチャットモデルへの入力として使用できる`PromptValue`が返されます。

便宜上、テンプレートに`from_template`メソッドが公開されています。このテンプレートを使用する場合は、次のようになります:

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

# get a chat completion from the formatted messages
chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="French", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```
