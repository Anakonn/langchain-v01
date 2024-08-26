---
translated: true
---

# カスタムコールバックハンドラ

カスタムコールバックハンドラを作成するには、コールバックハンドラが処理したいイベントを[決定](/docs/modules/callbacks/)し、そのイベントがトリガーされたときにコールバックハンドラが何をするかを決める必要があります。その後、コンストラクタコールバックまたはリクエストコールバック(「[コールバックの種類](/docs/modules/callbacks/)」を参照)としてオブジェクトにコールバックハンドラを接続するだけです。

以下の例では、カスタムハンドラを使ってストリーミングを実装します。

カスタムコールバックハンドラ `MyCustomHandler` では、受け取ったトークンを出力する `on_llm_new_token` を実装しています。そして、カスタムハンドラをモデルオブジェクトのコンストラクタコールバックとして接続しています。

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
