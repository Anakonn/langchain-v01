---
translated: true
---

# Trubrics

> [Trubrics](https://trubrics.com)은 사용자 프롬프트 및 AI 모델에 대한 피드백을 수집, 분석 및 관리할 수 있는 LLM 사용자 분석 플랫폼입니다.
>
> [Trubrics 저장소](https://github.com/trubrics/trubrics-sdk)에서 `Trubrics`에 대한 자세한 정보를 확인하세요.

이 가이드에서는 `TrubricsCallbackHandler`를 설정하는 방법을 설명합니다.

## 설치 및 설정

```python
%pip install --upgrade --quiet trubrics
```

### Trubrics 자격 증명 얻기

Trubrics 계정이 없다면 [여기](https://trubrics.streamlit.app/)에서 계정을 생성하세요. 이 튜토리얼에서는 계정 생성 시 기본적으로 생성되는 `default` 프로젝트를 사용합니다.

이제 자격 증명을 환경 변수로 설정합니다:

```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```

```python
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### 사용법

`TrubricsCallbackHandler`는 다양한 선택적 인수를 받을 수 있습니다. Trubrics 프롬프트에 전달할 수 있는 kwargs에 대한 자세한 내용은 [여기](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics)를 참조하세요.

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.

    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## 예제

여기에서는 Langchain [LLMs](/docs/modules/model_io/llms/) 또는 [Chat Models](/docs/modules/model_io/chat/)와 함께 `TrubricsCallbackHandler`를 사용하는 두 가지 예제를 보여줍니다. OpenAI 모델을 사용할 것이므로, `OPENAI_API_KEY`를 설정합니다:

```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. LLM과 함께 사용

```python
from langchain_openai import OpenAI
```

```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```

```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```

```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```

```output
--> GPT's joke:

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```

### 2. 채팅 모델과 함께 사용

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```

```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```

```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```

```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```