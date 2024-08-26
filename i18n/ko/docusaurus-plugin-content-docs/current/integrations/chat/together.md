---
translated: true
---

# Together AI

[Together AI](https://www.together.ai/)는 몇 줄의 코드로 [50개 이상의 선도적인 오픈 소스 모델](https://docs.together.ai/docs/inference-models)을 쿼리할 수 있는 API를 제공합니다.

이 예제는 LangChain을 사용하여 Together AI 모델과 상호 작용하는 방법을 다룹니다.

## 설치

```python
%pip install --upgrade langchain-together
```

## 환경 설정

Together AI를 사용하려면 [API 키](https://api.together.ai/settings/api-keys)가 필요합니다. 이 키는 `together_api_key` 초기화 매개변수로 전달하거나 환경 변수 `TOGETHER_API_KEY`로 설정할 수 있습니다.

## 예제

```python
# Together AI를 사용하여 채팅 모델 쿼리

from langchain_together import ChatTogether

# 50개 이상의 모델 중에서 선택할 수 있습니다: https://docs.together.ai/docs/inference-models

chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# 모델로부터의 응답을 스트리밍

for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# 스트리밍을 원하지 않는 경우 invoke 메서드를 사용할 수 있습니다

# chat.invoke("Tell me fun things to do in NYC")

```

```python
# Together AI를 사용하여 코드 및 언어 모델 쿼리

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```