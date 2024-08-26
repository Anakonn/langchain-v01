---
sidebar_label: LiteLLM
translated: true
---

# ChatLiteLLM

[LiteLLM](https://github.com/BerriAI/litellm) est une bibliothèque qui simplifie l'appel à Anthropic, Azure, Huggingface, Replicate, etc.

Ce notebook couvre comment se lancer avec l'utilisation de Langchain + la bibliothèque d'entrée/sortie LiteLLM.

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

## `ChatLiteLLM` prend également en charge les fonctionnalités asynchrones et de diffusion en continu :

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
