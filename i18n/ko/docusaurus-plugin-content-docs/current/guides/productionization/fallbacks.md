---
translated: true
---

# 폴백(Fallbacks)

언어 모델을 사용할 때, API의 레이트 리미팅(rate limiting) 또는 다운타임과 같은 문제를 자주 경험할 수 있습니다. 따라서 LLM 애플리케이션을 프로덕션으로 이동할 때 이러한 문제를 방지하는 것이 점점 더 중요해집니다. 이를 위해 폴백(Fallbacks) 개념을 도입했습니다.

**폴백**은 비상시에 사용할 수 있는 대체 계획입니다.

폴백은 LLM 수준뿐만 아니라 전체 실행 가능 수준에서도 적용될 수 있습니다. 이는 종종 다른 모델이 다른 프롬프트를 필요로 하기 때문에 중요합니다. 예를 들어, OpenAI 호출이 실패하면 동일한 프롬프트를 Anthropic에 보내는 대신 다른 프롬프트 템플릿을 사용하여 다른 버전을 보내고 싶을 것입니다.

## LLM API 오류에 대한 폴백

이것이 폴백의 가장 일반적인 사용 사례일 것입니다. LLM API 요청은 다양한 이유로 실패할 수 있습니다. API가 다운되었거나, 레이트 리미트를 초과했거나, 여러 가지 문제가 발생할 수 있습니다. 따라서 폴백을 사용하면 이러한 문제를 방지하는 데 도움이 됩니다.

중요: 기본적으로 많은 LLM 래퍼는 오류를 포착하고 다시 시도합니다. 폴백을 사용할 때는 이를 비활성화하는 것이 좋습니다. 그렇지 않으면 첫 번째 래퍼가 계속 다시 시도하고 실패하지 않습니다.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain_community.chat_models import ChatAnthropic
from langchain_openai import ChatOpenAI
```

먼저, OpenAI의 RateLimitError를 만났을 때의 상황을 모의 실험합니다.

```python
from unittest.mock import patch

import httpx
from openai import RateLimitError

request = httpx.Request("GET", "/")
response = httpx.Response(200, request=request)
error = RateLimitError("rate limit", response=response, body="")
```

```python
# RateLimit 시 재시도하지 않도록 max_retries를 0으로 설정합니다.

openai_llm = ChatOpenAI(max_retries=0)
anthropic_llm = ChatAnthropic()
llm = openai_llm.with_fallbacks([anthropic_llm])
```

```python
# 먼저 OpenAI LLM만 사용하여 오류를 만나는지 확인합니다.

with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(openai_llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
Hit error
```

```python
# 이제 Anthropic으로 폴백을 시도합니다.

with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
content=' I don\'t actually know why the chicken crossed the road, but here are some possible humorous answers:\n\n- To get to the other side!\n\n- It was too chicken to just stand there. \n\n- It wanted a change of scenery.\n\n- It wanted to show the possum it could be done.\n\n- It was on its way to a poultry farmers\' convention.\n\nThe joke plays on the double meaning of "the other side" - literally crossing the road to the other side, or the "other side" meaning the afterlife. So it\'s an anti-joke, with a silly or unexpected pun as the answer.' additional_kwargs={} example=False
```

폴백이 있는 "LLM"을 일반적인 LLM처럼 사용할 수 있습니다.

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
chain = prompt | llm
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(chain.invoke({"animal": "kangaroo"}))
    except RateLimitError:
        print("Hit error")
```

```output
content=" I don't actually know why the kangaroo crossed the road, but I can take a guess! Here are some possible reasons:\n\n- To get to the other side (the classic joke answer!)\n\n- It was trying to find some food or water \n\n- It was trying to find a mate during mating season\n\n- It was fleeing from a predator or perceived threat\n\n- It was disoriented and crossed accidentally \n\n- It was following a herd of other kangaroos who were crossing\n\n- It wanted a change of scenery or environment \n\n- It was trying to reach a new habitat or territory\n\nThe real reason is unknown without more context, but hopefully one of those potential explanations does the joke justice! Let me know if you have any other animal jokes I can try to decipher." additional_kwargs={} example=False
```

## 시퀀스에 대한 폴백

시퀀스 자체가 폴백이 될 수 있는 시퀀스를 생성할 수도 있습니다. 여기에서는 두 가지 다른 모델: ChatOpenAI와 일반 OpenAI(챗 모델을 사용하지 않음)를 사용하여 이를 수행합니다. OpenAI는 챗 모델이 아니므로 다른 프롬프트를 원할 가능성이 높습니다.

```python
# 먼저 ChatModel을 사용하여 체인을 생성합니다.

# 출력이 동일한 유형이 되도록 문자열 출력 파서를 추가합니다.

from langchain_core.output_parsers import StrOutputParser

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
# 오류가 쉽게 발생하도록 잘못된 모델 이름을 사용하여 체인을 만듭니다.

chat_model = ChatOpenAI(model="gpt-fake")
bad_chain = chat_prompt | chat_model | StrOutputParser()
```

```python
# 이제 일반 OpenAI 모델을 사용하여 체인을 생성합니다.

from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

prompt_template = """Instructions: You should always include a compliment in your response.

Question: Why did the {animal} cross the road?"""
prompt = PromptTemplate.from_template(prompt_template)
llm = OpenAI()
good_chain = prompt | llm
```

```python
# 이제 두 체인을 결합한 최종 체인을 생성할 수 있습니다.

chain = bad_chain.with_fallbacks([good_chain])
chain.invoke({"animal": "turtle"})
```

```output
'\n\nAnswer: The turtle crossed the road to get to the other side, and I have to say he had some impressive determination.'
```

## 긴 입력에 대한 폴백

LLM의 큰 제한 요소 중 하나는 컨텍스트 윈도우입니다. 일반적으로 LLM에 프롬프트를 보내기 전에 프롬프트의 길이를 계산하고 추적할 수 있지만, 복잡한 상황에서는 더 긴 컨텍스트 길이를 가진 모델로 폴백할 수 있습니다.

```python
short_llm = ChatOpenAI()
long_llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
llm = short_llm.with_fallbacks([long_llm])
```

```python
inputs = "What is the next number: " + ", ".join(["one", "two"] * 3000)
```

```python
try:
    print(short_llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
This model's maximum context length is 4097 tokens. However, your messages resulted in 12012 tokens. Please reduce the length of the messages.
```

```python
try:
    print(llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
content='The next number in the sequence is two.' additional_kwargs={} example=False
```

## 더 나은 모델로 폴백

종종 특정 형식(예: JSON)으로 출력을 요청합니다. GPT-3.5와 같은 모델은 이를 어느 정도 수행할 수 있지만 때로는 어려움을 겪습니다. 이는 자연스럽게 폴백을 가리킵니다. 우리는 GPT-3.5(더 빠르고 저렴함)로 시도한 후, 파싱이 실패하면 GPT-4를 사용할 수 있습니다.

```python
from langchain.output_parsers import DatetimeOutputParser
```

```python
prompt = ChatPromptTemplate.from_template(
    "what time was {event} (in %Y-%m-%dT%H:%M:%S.%fZ format - only return this value)"
)
```

```python
# 이 경우 우리는 LLM + 출력 파서 수준에서 폴백을 수행할 것입니다.

# 오류는 OutputParser에서 발생할 것입니다.

openai_35 = ChatOpenAI() | DatetimeOutputParser()
openai_4 = ChatOpenAI(model="gpt-4") | DatetimeOutputParser()
```

```python
only_35 = prompt | openai_35
fallback_4 = prompt | openai_35.with_fallbacks([openai_4])
```

```python
try:
    print(only_35.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
Error: Could not parse datetime string: The Super Bowl in 1994 took place on January 30th at 3:30 PM local time. Converting this to the specified format (%Y-%m-%dT%H:%M:%S.%fZ) results in: 1994-01-30T15:30:00.000Z
```

```python
try:
    print(fallback_4.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
1994-01-30 15:30:00
```