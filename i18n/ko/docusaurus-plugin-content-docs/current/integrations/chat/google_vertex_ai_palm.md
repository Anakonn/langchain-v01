---
keywords:
- gemini
- vertex
- ChatVertexAI
- gemini-pro
sidebar_label: Google Cloud Vertex AI
translated: true
---

# ChatVertexAI

참고: 이것은 Google PaLM 통합과 별개입니다. Google은 GCP를 통해 PaLM의 엔터프라이즈 버전을 제공하기로 결정했으며, 이를 통해 제공되는 모델을 지원합니다.

ChatVertexAI는 Google Cloud에서 사용할 수 있는 모든 기본 모델을 제공합니다:

- Gemini (`gemini-pro` 및 `gemini-pro-vision`)
- 텍스트용 PaLM 2 (`text-bison`)
- 코드 생성용 Codey (`codechat-bison`)

사용 가능한 모델의 전체 및 최신 목록은 [VertexAI 문서](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview)를 참조하십시오.

기본적으로 Google Cloud는 Google Cloud의 AI/ML 개인 정보 보호 약속의 일환으로 고객 데이터를 기본 모델 학습에 사용하지 [않습니다](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development). Google이 데이터를 처리하는 방식에 대한 자세한 내용은 [Google의 고객 데이터 처리 추가 계약 (CDPA)](https://cloud.google.com/terms/data-processing-addendum)에서 확인할 수 있습니다.

`Google Cloud Vertex AI` PaLM을 사용하려면 `langchain-google-vertexai` Python 패키지가 설치되어 있어야 하며, 다음 중 하나가 필요합니다:

- 환경에 대한 자격 증명 구성(gcloud, 워크로드 아이덴티티 등...)
- 서비스 계정 JSON 파일 경로를 GOOGLE_APPLICATION_CREDENTIALS 환경 변수로 저장

이 코드베이스는 `google.auth` 라이브러리를 사용하여 위에서 언급한 애플리케이션 자격 증명 변수를 먼저 확인하고, 시스템 수준 인증을 확인합니다.

자세한 내용은 다음을 참조하십시오:

- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain-google-vertexai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI
```

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content="J'aime la programmation.")
```

Gemini는 현재 SystemMessage를 지원하지 않지만, 첫 번째 human 메시지에 추가할 수 있습니다. 이러한 동작을 원하면 `convert_system_message_to_human`을 `True`로 설정하십시오:

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="gemini-pro", convert_system_message_to_human=True)

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content="J'aime la programmation.")
```

사용자 지정 매개변수를 사용하는 간단한 체인을 구성하려면:

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat

chain.invoke(
    {
        "input_language": "English",
        "output_language": "Japanese",
        "text": "I love programming",
    }
)
```

```output
AIMessage(content='プログラミングが大好きです')
```

## 코드 생성 채팅 모델

이제 Vertex AI 내에서 코드 채팅을 위한 Codey API를 활용할 수 있습니다. 사용 가능한 모델은 다음과 같습니다:

- `codechat-bison`: 코드 지원용

```python
chat = ChatVertexAI(model="codechat-bison", max_tokens=1000, temperature=0.5)

message = chat.invoke("Write a Python function generating all prime numbers")
print(message.content)
```

```output
    ```python
    def is_prime(n):
      """
      Check if a number is prime.

      Args:
        n: The number to check.

      Returns:
        True if n is prime, False otherwise.
      """

      # If n is 1, it is not prime.
      if n == 1:
        return False

      # Iterate over all numbers from 2 to the square root of n.
      for i in range(2, int(n ** 0.5) + 1):
        # If n is divisible by any number from 2 to its square root, it is not prime.
        if n % i == 0:
          return False

      # If n is divisible by no number from 2 to its square root, it is prime.
      return True


    def find_prime_numbers(n):
      """
      Find all prime numbers up to a given number.

      Args:
        n: The upper bound for the prime numbers to find.

      Returns:
        A list of all prime numbers up to n.
      """

      # Create a list of all numbers from 2 to n.
      numbers = list(range(2, n + 1))

      # Iterate over the list of numbers and remove any that are not prime.
      for number in numbers:
        if not is_prime(number):
          numbers.remove(number)

      # Return the list of prime numbers.
      return numbers
    ```

```


## 전체 생성 정보

`generate` 메서드를 사용하여 채팅 완료뿐만 아니라 [안전 속성](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring)과 같은 추가 메타데이터를 반환받을 수 있습니다.

`generation_info`는 gemini 모델을 사용하는지 여부에 따라 다릅니다.

### Gemini 모델

`generation_info`에는 다음이 포함됩니다:

- `is_blocked`: 생성이 차단되었는지 여부
- `safety_ratings`: 안전 등급의 범주 및 확률 레이블

```python
from pprint import pprint

from langchain_core.messages import HumanMessage
from langchain_google_vertexai import HarmBlockThreshold, HarmCategory
```

```python
human = "Translate this sentence from English to French. I love programming."
messages = [HumanMessage(content=human)]

chat = ChatVertexAI(
    model_name="gemini-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
)

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'citation_metadata': None,
 'is_blocked': False,
 'safety_ratings': [{'blocked': False,
                     'category': 'HARM_CATEGORY_HATE_SPEECH',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_HARASSMENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                     'probability_label': 'NEGLIGIBLE'}],
 'usage_metadata': {'candidates_token_count': 6,
                    'prompt_token_count': 12,
                    'total_token_count': 18}}
```

### Non-gemini 모델

`generation_info`에는 다음이 포함됩니다:

- `is_blocked`: 생성이 차단되었는지 여부
- `safety_attributes`: 안전 속성을 점수와 매핑한 딕셔너리

```python
chat = ChatVertexAI()  # 기본값은 `chat-bison`

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'errors': (),
 'grounding_metadata': {'citations': [], 'search_queries': []},
 'is_blocked': False,
 'safety_attributes': [{'Derogatory': 0.1, 'Insult': 0.1, 'Sexual': 0.2}],
 'usage_metadata': {'candidates_billable_characters': 88.0,
                    'candidates_token_count': 24.0,
                    'prompt_billable_characters': 58.0,
                    'prompt_token_count': 12.0}}
```

## Gemini를 사용한 도구 호출(즉, 함수 호출)

우리는 Gemini 모델에 도구 정의를 전달하여 적절할 때 이러한 도구를 호출하도록 모델을 설정할 수 있습니다. 이는 LLM 기반 도구 사용뿐만 아니라 일반적으로 구조화된 출력을 얻는 데 유용합니다.

`ChatVertexAI.bind_tools()`를 사용하면 Pydantic 클래스, dict 스키마, LangChain 도구 또는 함수와 같은 도구를 모델에 쉽게 전달할 수 있습니다. 내부적으로 이러한 도구는 다음과 같은 Gemini 도구 스키마로 변환됩니다:

```python
{
    "name": "...",  # 도구 이름
    "description": "...",  # 도구 설명
    "parameters": {...}  # JSONSchema로 된 도구 입력 스키마
}
```

```python
from langchain.pydantic_v1 import BaseModel, Field

class GetWeather(BaseModel):
    """특정 위치의 현재 날씨를 가져옵니다"""

    location: str = Field(..., description="도시 및 주, 예: 샌프란시스코, CA")

llm = ChatVertexAI(model="gemini-pro", temperature=0)
llm_with_tools = llm.bind_tools([GetWeather])
ai_msg = llm_with_tools.invoke(
    "샌프란시스코의 날씨는 어떻습니까?",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'GetWeather', 'arguments': '{"location": "San Francisco, CA"}'}}, response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'citation_metadata': None, 'usage_metadata': {'prompt_token_count': 41, 'candidates_token_count': 7, 'total_token_count': 48}}, id='run-05e760dc-0682-4286-88e1-5b23df69b083-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}])
```

도구 호출은 모델에 구애받지 않는 형식으로 `AIMessage.tool_calls` 속성을 통해 접근할 수 있습니다:

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

도구 호출에 대한 전체 가이드는 [여기](https://docs/modules/model_io/chat/function_calling/)에서 확인하십시오.

## 구조화된 출력

많은 애플리케이션에서 구조화된 모델 출력이 필요합니다. 도구 호출을 사용하면 이를 신뢰할 수 있게 하는 것이 훨씬 쉬워집니다. [with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) 생성자는 모델에서 구조화된 출력을 얻기 위한 간단한 인터페이스를 제공합니다. 구조화된 출력에 대한 전체 가이드는 [여기](https://docs/modules/model_io/chat/structured_output/)에서 확인하십시오.

### ChatVertexAI.with_structured_outputs()

Gemini 모델에서 구조화된 출력을 얻으려면 원하는 스키마를 Pydantic 클래스 또는 JSON 스키마로 지정하기만 하면 됩니다:

```python
class Person(BaseModel):
    """사람에 대한 정보를 저장합니다."""

    name: str = Field(..., description="사람의 이름.")
    age: int = Field(..., description="사람의 나이.")

structured_llm = llm.with_structured_output(Person)
structured_llm.invoke("Stefan은 이미 13살입니다")
```

```output
Person(name='Stefan', age=13)
```

### [Legacy] `create_structured_runnable()` 사용

구조화된 출력을 얻는 기존 방법은 `create_structured_runnable` 생성자를 사용하는 것입니다:

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("내 이름은 Erick이고 27살입니다")
```

## 비동기 호출

Runnables [Async Interface](https://docs/expression_language/interface)를 통해 비동기 호출을 할 수 있습니다:

```python
# 이 예제를 노트북에서 실행하려면:

import asyncio

import nest_asyncio

nest_asyncio.apply()
```

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="chat-bison", max_tokens=1000, temperature=0.5)
chain = prompt | chat

asyncio.run(
    chain.ainvoke(
        {
            "input_language": "English",
            "output_language": "Sanskrit",
            "text": "I love programming",
        }
    )
)
```

```output
AIMessage(content='अहं प्रोग्रामनं प्रेमामि')
```

## 스트리밍 호출

`stream` 메서드를 통해 출력을 스트리밍할 수도 있습니다:

```python
import sys

prompt = ChatPromptTemplate.from_messages(
    [("human", "List out the 5 most populous countries in the world")]
)

chat = ChatVertexAI()

chain = prompt | chat

for chunk in chain.stream({}):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
 세계에서 가장 인구가 많은 5개 국가는 다음과 같습니다:
1. 중국 (14억)
2. 인도 (13억)
3. 미국 (3억 3100만)
4. 인도네시아 (2억 7300만)
5. 파키스탄 (2억 2000만)
```