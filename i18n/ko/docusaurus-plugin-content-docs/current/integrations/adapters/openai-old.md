---
translated: true
---

# OpenAI 어댑터(구 버전)

**OpenAI 라이브러리가 1.0.0 미만인지 확인하세요. 그렇지 않으면, 최신 문서 [OpenAI 어댑터](/docs/integrations/adapters/openai/)를 참조하세요.**

많은 사람들이 OpenAI로 시작하지만 다른 모델을 탐색하고 싶어합니다. LangChain의 많은 모델 제공자와의 통합 덕분에 이를 쉽게 할 수 있습니다. LangChain은 자체 메시지 및 모델 API를 가지고 있지만, LangChain 모델을 OpenAI API에 맞추기 위해 어댑터를 제공하여 다른 모델을 쉽게 탐색할 수 있도록 했습니다.

현재 이 어댑터는 출력만 처리하며 토큰 수, 중지 이유 등의 다른 정보를 반환하지 않습니다.

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## ChatCompletion.create

```python
messages = [{"role": "user", "content": "hi"}]
```

원래 OpenAI 호출

```python
result = openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result["choices"][0]["message"].to_dict_recursive()
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

LangChain OpenAI 래퍼 호출

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

모델 제공자 변경

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': ' Hello!'}
```

## ChatCompletion.stream

원래 OpenAI 호출

```python
for c in openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c["choices"][0]["delta"].to_dict_recursive())
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```

LangChain OpenAI 래퍼 호출

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```

모델 제공자 변경

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ' Hello'}
{'content': '!'}
{}
```