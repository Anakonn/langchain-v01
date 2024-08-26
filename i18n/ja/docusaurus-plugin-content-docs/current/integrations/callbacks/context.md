---
translated: true
---

# コンテキスト

>[Context](https://context.ai/) は、LLM搭載製品および機能のユーザー分析を提供します。

`Context` を使用すると、30分以内にユーザーを理解し、体験を向上させることができます。

このガイドでは、Context との統合方法を紹介します。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  langchain langchain-openai context-python
```

### API資格情報の取得

Context APIトークンを取得するには：

1. Contextアカウントの設定ページ (https://with.context.ai/settings) に移動します。
2. 新しいAPIトークンを生成します。
3. このトークンを安全な場所に保存します。

### Contextのセットアップ

`ContextCallbackHandler` を使用するには、Langchainからハンドラーをインポートし、Context APIトークンでインスタンス化します。

ハンドラーを使用する前に `context-python` パッケージをインストールしていることを確認してください。

```python
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```

```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## 使用方法

### チャットモデル内のContextコールバック

Contextコールバックハンドラーを使用して、ユーザーとAIアシスタント間のトランスクリプトを直接記録することができます。

```python
import os

from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### チェーン内のContextコールバック

Contextコールバックハンドラーは、チェーンの入力と出力を記録するためにも使用できます。チェーンの中間ステップは記録されず、開始の入力と最終出力のみが記録されることに注意してください。

__注意:__ 同じコンテキストオブジェクトをチャットモデルとチェーンに渡すことを確認してください。

間違い:
> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

正しい:
>```python
>handler = ContextCallbackHandler(token)
>chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
>chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
>```

```python
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```
