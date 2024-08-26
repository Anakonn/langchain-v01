---
translated: true
---

# 사용자 정의 콜백 핸들러

사용자 정의 콜백 핸들러를 만들려면 우리의 콜백 핸들러가 처리하고자 하는 [이벤트(들)](/docs/modules/callbacks/)을 결정하고, 이벤트가 트리거될 때 우리의 콜백 핸들러가 수행할 작업을 결정해야 합니다. 그런 다음 생성자 콜백 또는 요청 콜백으로 객체에 콜백 핸들러를 연결하면 됩니다 ([콜백 유형](/docs/modules/callbacks/) 참조).

아래 예제에서는 사용자 정의 핸들러를 사용하여 스트리밍을 구현할 것입니다.

우리의 사용자 정의 콜백 핸들러 `MyCustomHandler`에서는 `on_llm_new_token`을 구현하여 방금 받은 토큰을 출력합니다. 그런 다음 우리의 사용자 정의 핸들러를 모델 객체에 생성자 콜백으로 연결합니다.

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"My custom handler, token: {token}")


prompt = ChatPromptTemplate.from_messages(["Tell me a joke about {animal}"])

# To enable streaming, we pass in `streaming=True` to the ChatModel constructor
# Additionally, we pass in our custom handler as a list to the callbacks parameter
model = ChatOpenAI(streaming=True, callbacks=[MyCustomHandler()])

chain = prompt | model

response = chain.invoke({"animal": "bears"})
```

```output
My custom handler, token:
My custom handler, token: Why
My custom handler, token:  do
My custom handler, token:  bears
My custom handler, token:  have
My custom handler, token:  hairy
My custom handler, token:  coats
My custom handler, token: ?


My custom handler, token: F
My custom handler, token: ur
My custom handler, token:  protection
My custom handler, token: !
My custom handler, token:
```
