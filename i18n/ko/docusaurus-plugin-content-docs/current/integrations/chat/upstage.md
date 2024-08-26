---
sidebar_label: Upstage
translated: true
---

# ChatUpstage

이 노트북은 Upstage 채팅 모델을 시작하는 방법을 다룹니다.

## 설치

`langchain-upstage` 패키지를 설치합니다.

```bash
pip install -U langchain-upstage
```

## 환경 설정

다음 환경 변수를 설정하십시오:

- `UPSTAGE_API_KEY`: [Upstage 콘솔](https://console.upstage.ai/)에서 받은 Upstage API 키.

## 사용법

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
```

```python
# 채팅 호출 사용

chat.invoke("Hello, how are you?")
```

```python
# 채팅 스트림 사용

for m in chat.stream("Hello, how are you?"):
    print(m)
```

## 체이닝

```python
# 체이닝 사용

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant that translates English to French."),
        ("human", "Translate this sentence from English to French. {english_text}."),
    ]
)
chain = prompt | chat

chain.invoke({"english_text": "Hello, how are you?"})
```