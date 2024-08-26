---
sidebar_label: MistralAI
translated: true
---

# MistralAI

이 노트북은 [API](https://docs.mistral.ai/api/)를 통해 MistralAI 채팅 모델을 사용하는 방법을 다룹니다.

API와 통신하려면 유효한 [API 키](https://console.mistral.ai/users/api-keys/)가 필요합니다.

모든 속성과 메서드에 대한 자세한 문서는 [API 참조](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html)를 참조하세요.

## 설정

API를 사용하려면 `langchain-core` 및 `langchain-mistralai` 패키지가 필요합니다. 다음 명령어를 사용하여 설치할 수 있습니다:

```bash
pip install -U langchain-core langchain-mistralai
```

[Mistral API 키](https://console.mistral.ai/users/api-keys/)도 필요합니다.

```python
import getpass

api_key = getpass.getpass()
```

## 사용법

```python
from langchain_core.messages import HumanMessage
from langchain_mistralai.chat_models import ChatMistralAI
```

```python
# api_key를 전달하지 않으면 기본 동작은 `MISTRAL_API_KEY` 환경 변수를 사용하는 것입니다.

chat = ChatMistralAI(api_key=api_key)
```

```python
messages = [HumanMessage(content="knock knock")]
chat.invoke(messages)
```

```output
AIMessage(content="Who's there? I was just about to ask the same thing! How can I assist you today?")
```

### 비동기

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Who\'s there?\n\n(You can then continue the "knock knock" joke by saying the name of the person or character who should be responding. For example, if I say "Banana," you could respond with "Banana who?" and I would say "Banana bunch! Get it? Because a group of bananas is called a \'bunch\'!" and then we would both laugh and have a great time. But really, you can put anything you want in the spot where I put "Banana" and it will still technically be a "knock knock" joke. The possibilities are endless!)')
```

### 스트리밍

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="")
```

```output
Who's there?

(After this, the conversation can continue as a call and response "who's there" joke. Here is an example of how it could go:

You say: Orange.
I say: Orange who?
You say: Orange you glad I didn't say banana!?)

But since you asked for a knock knock joke specifically, here's one for you:

Knock knock.

Me: Who's there?

You: Lettuce.

Me: Lettuce who?

You: Lettuce in, it's too cold out here!

I hope this brings a smile to your face! Do you have a favorite knock knock joke you'd like to share? I'd love to hear it.
```

### 배치

```python
chat.batch([messages])
```

```output
[AIMessage(content="Who's there? I was just about to ask the same thing! Go ahead and tell me who's there. I love a good knock-knock joke.")]
```

## 체이닝

프롬프트 템플릿과 쉽게 결합하여 사용자 입력을 구조화할 수 있습니다. [LCEL](/docs/expression_language)을 사용하여 이를 수행할 수 있습니다.

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat
```

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content='Why do bears hate shoes so much? They like to run around in their bear feet.')
```