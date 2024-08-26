---
translated: true
---

# Context

> [Context](https://context.ai/)는 LLM 기반 제품과 기능을 위한 사용자 분석을 제공합니다.

`Context`를 사용하면 30분 이내에 사용자를 이해하고 그들의 경험을 개선할 수 있습니다.

이 가이드에서는 Context와 통합하는 방법을 보여줍니다.

## 설치 및 설정

```python
%pip install --upgrade --quiet langchain langchain-openai context-python
```

### API 자격 증명 얻기

Context API 토큰을 얻으려면 다음 단계를 따르세요:

1. Context 계정의 설정 페이지(https://with.context.ai/settings)로 이동합니다.
2. 새 API 토큰을 생성합니다.
3. 이 토큰을 안전한 곳에 저장합니다.

### Context 설정

`ContextCallbackHandler`를 사용하려면 Langchain에서 핸들러를 가져와 Context API 토큰으로 인스턴스화하세요.

핸들러를 사용하기 전에 `context-python` 패키지가 설치되어 있는지 확인하세요.

```python
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```

```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## 사용법

### 대화 모델 내에서 Context 콜백

Context 콜백 핸들러는 사용자와 AI 어시스턴트 간의 대화를 직접 기록하는 데 사용할 수 있습니다.

```python
import os

from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### 체인 내에서 Context 콜백

Context 콜백 핸들러는 체인의 입력과 출력을 기록하는 데도 사용할 수 있습니다. 체인의 중간 단계는 기록되지 않으며, 시작 입력과 최종 출력만 기록됩니다.

**참고:** 동일한 context 객체를 대화 모델과 체인에 전달해야 합니다.

잘못된 예:

> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

올바른 예:

> ```python
> handler = ContextCallbackHandler(token)
> chat = ChatOpenAI(temperature=0.9, callbacks=[handler])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[handler])
> ```

```python
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```