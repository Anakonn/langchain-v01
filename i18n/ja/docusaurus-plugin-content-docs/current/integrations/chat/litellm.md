---
sidebar_label: LiteLLM
translated: true
---

# ChatLiteLLM

[LiteLLM](https://github.com/BerriAI/litellm)は、Anthropic、Azure、Huggingface、Replicate等を呼び出すのを簡単にするライブラリです。

このノートブックでは、Langchain + LiteLLM I/Oライブラリの使い始め方をカバーしています。

```python
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.messages import HumanMessage
```

```python
chat = ChatLiteLLM(model="gpt-3.5-turbo")
```

```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat(messages)
```

```output
AIMessage(content=" J'aime la programmation.", additional_kwargs={}, example=False)
```

## `ChatLiteLLM`はasyncとストリーミング機能もサポートしています:

```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
await chat.agenerate([messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" J'aime programmer.", generation_info=None, message=AIMessage(content=" J'aime programmer.", additional_kwargs={}, example=False))]], llm_output={}, run=[RunInfo(run_id=UUID('8cc8fb68-1c35-439c-96a0-695036a93652'))])
```

```python
chat = ChatLiteLLM(
    streaming=True,
    verbose=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
chat(messages)
```

```output
 J'aime la programmation.
```

```output
AIMessage(content=" J'aime la programmation.", additional_kwargs={}, example=False)
```
