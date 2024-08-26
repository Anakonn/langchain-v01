---
translated: true
---

# 함께하는 AI

[Together AI](https://www.together.ai/)는 몇 줄의 코드로 [50개 이상의 주요 오픈 소스 모델](https://docs.together.ai/docs/inference-models)을 쿼리할 수 있는 API를 제공합니다.

이 예제에서는 LangChain을 사용하여 Together AI 모델과 상호 작용하는 방법을 살펴봅니다.

## 설치

```python
%pip install --upgrade langchain-together
```

## 환경

Together AI를 사용하려면 API 키가 필요합니다. API 키는 https://api.together.ai/settings/api-keys에서 찾을 수 있습니다. 이 키는 ``together_api_key`` 초기화 매개변수로 전달하거나 ``TOGETHER_API_KEY`` 환경 변수로 설정할 수 있습니다.

## 예제

```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```

```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
