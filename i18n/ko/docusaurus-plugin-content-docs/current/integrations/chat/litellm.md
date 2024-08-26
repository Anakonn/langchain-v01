---
sidebar_label: LiteLLM
translated: true
---

# ChatLiteLLM

[LiteLLM](https://github.com/BerriAI/litellm)은 Anthropic, Azure, Huggingface, Replicate 등을 호출하는 것을 간소화하는 라이브러리입니다.

이 노트북은 Langchain과 LiteLLM I/O 라이브러리를 사용하는 방법을 다룹니다.

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

## `ChatLiteLLM`는 비동기 및 스트리밍 기능도 지원합니다:

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