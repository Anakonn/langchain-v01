---
sidebar_label: vLLMチャット
translated: true
---

# vLLMチャット

vLLMはOpenAI APIプロトコルを模倣するサーバーとしてデプロイできます。これにより、vLLMをOpenAI APIを使用するアプリケーションの代替品として使用できます。このサーバーはOpenAI APIと同じ形式で照会できます。

このノートブックでは、langchainの`ChatOpenAI`を**そのまま**使用してvLLMチャットモデルの使い始め方を説明します。

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

`MessagePromptTemplate`を使用してテンプレートを活用できます。1つ以上の`MessagePromptTemplate`から`ChatPromptTemplate`を構築できます。`ChatPromptTemplate`の`format_prompt`を使用できます - これは`PromptValue`を返し、LLMまたはチャットモデルへの入力として使用する場合は文字列または`Message`オブジェクトに変換できます。

便宜上、テンプレートに`from_template`メソッドが公開されています。このテンプレートを使用する場合は次のようになります:

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
        input_language="English", output_language="Italian", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content=' I love programming too.', additional_kwargs={}, example=False)
```
