---
sidebar_position: 3
translated: true
---

# 구조화된 출력

LLM(Large Language Model)이 구조화된 출력을 반환하는 것은 종종 매우 중요합니다. 이는 LLM의 출력이 종종 하위 애플리케이션에서 사용되며, 특정 인수가 필요하기 때문입니다. LLM이 안정적으로 구조화된 출력을 반환하는 것이 필수적입니다.

이를 달성하기 위해 사용되는 몇 가지 고수준 전략이 있습니다:

- 프롬프팅: LLM에게 (매우 정중하게) 원하는 형식(JSON, XML)으로 출력을 반환하도록 요청하는 것입니다. 이는 모든 LLM에서 작동하므로 좋습니다. 그러나 LLM이 올바른 형식으로 출력을 반환할 것이라는 보장이 없다는 단점이 있습니다.
- 함수 호출: LLM이 단순한 완성만 생성하는 것이 아니라 함수 호출도 생성할 수 있도록 미세 조정되는 것입니다. LLM이 호출할 수 있는 함수는 일반적으로 모델 API에 대한 추가 매개변수로 전달됩니다. 함수 이름과 설명은 프롬프트의 일부로 취급되어야 합니다(토큰 수에 영향을 미치며, LLM이 무엇을 해야 할지 결정하는 데 사용됨).
- 도구 호출: 함수 호출과 유사한 기술이지만 LLM이 여러 함수를 동시에 호출할 수 있습니다.
- JSON 모드: LLM이 JSON을 반환하도록 보장되는 경우입니다.

다양한 모델은 약간 다른 매개변수로 이러한 변형을 지원할 수 있습니다. LLM이 구조화된 출력을 반환하기 쉽게 하기 위해 LangChain 모델에 공통 인터페이스 `.with_structured_output`을 추가했습니다.

이 메서드를 호출하고(JSON 스키마 또는 Pydantic 모델 전달) 모델에 필요한 모델 매개변수와 출력 파서를 추가하면 구조화된 출력을 받을 수 있습니다. 이를 수행하는 방법이 여러 가지(예: 함수 호출 vs JSON 모드)일 수 있으므로 해당 메서드에 전달하여 사용할 방법을 구성할 수 있습니다.

실제 예제를 살펴보겠습니다!

Pydantic을 사용하여 응답 스키마를 쉽게 구조화합니다.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class Joke(BaseModel):
    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
```

## OpenAI

OpenAI는 구조화된 출력을 얻는 몇 가지 방법을 제공합니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)

```python
from langchain_openai import ChatOpenAI
```

#### 도구/함수 호출

기본적으로 `function_calling`을 사용합니다.

```python
model = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='To keep an eye on the mouse!')
```

#### JSON 모드

JSON 모드도 지원합니다. 프롬프트에서 응답 형식을 지정해야 합니다.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!')
```

## Fireworks

[Fireworks](https://fireworks.ai/)는 선택한 모델에 대해 함수 호출과 JSON 모드를 지원합니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_fireworks.chat_models.ChatFireworks.html#langchain_fireworks.chat_models.ChatFireworks.with_structured_output)

```python
from langchain_fireworks import ChatFireworks
```

#### 도구/함수 호출

기본적으로 `function_calling`을 사용합니다.

```python
model = ChatFireworks(model="accounts/fireworks/models/firefunction-v1")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSON 모드

JSON 모드도 지원합니다. 프롬프트에서 응답 형식을 지정해야 합니다.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about dogs, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why did the dog sit in the shade?', punchline='To avoid getting burned.')
```

## Mistral

Mistral 모델과도 구조화된 출력을 지원하지만 함수 호출만 지원합니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html#langchain_mistralai.chat_models.ChatMistralAI.with_structured_output)

```python
from langchain_mistralai import ChatMistralAI
```

```python
model = ChatMistralAI(model="mistral-large-latest")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Together

[TogetherAI](https://www.together.ai/)는 OpenAI의 드롭인 대체이므로 OpenAI 통합을 사용할 수 있습니다.

```python
import os

from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the cat sit on the computer?', punchline='To keep an eye on the mouse!')
```

## Groq

Groq는 OpenAI 호환 함수 호출 API를 제공합니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_groq.chat_models.ChatGroq.html#langchain_groq.chat_models.ChatGroq.with_structured_output)

```python
from langchain_groq import ChatGroq
```

#### 도구/함수 호출

기본적으로 `function_calling`을 사용합니다.

```python
model = ChatGroq()
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSON 모드

JSON 모드도 지원합니다. 프롬프트에서 응답 형식을 지정해야 합니다.

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Anthropic

Anthropic의 도구 호출 API를 구조화된 출력에 사용할 수 있습니다. API를 통해 도구 호출을 강제할 방법이 현재 없으므로 모델을 올바르게 프롬프팅하는 것이 여전히 중요합니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html#langchain_anthropic.chat_models.ChatAnthropic.with_structured_output)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-opus-20240229", temperature=0)
structured_llm = model.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats. Make sure to call the Joke function.")
```

```output
Joke(setup='What do you call a cat that loves to bowl?', punchline='An alley cat!')
```

## Google Vertex AI

Google의 Gemini 모델은 [function-calling](https://ai.google.dev/docs/function_calling)을 지원하며, 이를 Vertex AI를 통해 접근하여 출력 구조화에 사용할 수 있습니다.

[API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html#langchain_google_vertexai.chat_models.ChatVertexAI.with_structured_output)

```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-pro", temperature=0)
structured_llm = llm.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the scarecrow win an award?', punchline='Why did the scarecrow win an award? Because he was outstanding in his field.')
```
