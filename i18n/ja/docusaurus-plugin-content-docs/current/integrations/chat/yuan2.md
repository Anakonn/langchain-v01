---
sidebar_label: Yuan2.0
translated: true
---

# Yuan2.0

このノートブックでは、LangChainの langchain.chat_models.ChatYuan2を使用して[YUAN2 API](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md)を使用する方法を示します。

[*Yuan2.0*](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md)は、IEITシステムが開発した新世代の基本的な大規模言語モデルです。 Yuan 2.0-102B、Yuan 2.0-51B、Yuan 2.0-2Bの3つのモデルをすべて公開しており、他の開発者向けにプリトレーニング、ファインチューニング、推論サービスのための関連スクリプトを提供しています。 Yuan2.0は、Yuan1.0をベースにしており、より広範囲の高品質なプリトレーニングデータと命令ファインチューニングデータセットを利用して、モデルの意味論、数学、推論、コード、知識などの理解を強化しています。

## 始めましょう

### インストール

まず、Yuan2.0はOpenAI互換のAPIを提供しており、OpenAIクライアントを使用してChatYuan2をlangchainチャットモデルに統合しています。
したがって、Pythonの環境にopenaiパッケージがインストールされていることを確認してください。 次のコマンドを実行してください:

```python
%pip install --upgrade --quiet openai
```

### 必要なモジュールのインポート

インストールが完了したら、Pythonスクリプトに必要なモジュールをインポートします:

```python
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### APIサーバーの設定

[yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md)に従って、OpenAI互換のAPIサーバーを設定してください。
ローカルでAPIサーバーをデプロイした場合は、`yuan2_api_key="EMPTY"`または任意の値を設定できます。
`yuan2_api_base`が正しく設定されていることを確認してください。

```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### ChatYuan2モデルの初期化

チャットモデルの初期化方法は次のとおりです:

```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### 基本的な使用方法

システムメッセージとユーザーメッセージを使ってモデルを呼び出します:

```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```

```python
print(chat.invoke(messages))
```

### ストリーミングを使った基本的な使用方法

継続的なやり取りには、ストリーミング機能を使用します:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```

```python
chat.invoke(messages)
```

## 高度な機能

### 非同期呼び出しの使用

ノンブロッキングの呼び出しを行うには、次のように呼び出します:

```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```

```python
import asyncio

asyncio.run(basic_agenerate())
```

### プロンプトテンプレートの使用

ノンブロッキングの呼び出しを行い、チャットテンプレートを使用するには、次のように呼び出します:

```python
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```

```python
asyncio.run(ainvoke_with_prompt_template())
```

### ストリーミングを使った非同期呼び出し

ストリーミング出力を伴うノンブロッキングの呼び出しには、astream メソッドを使用します:

```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```

```python
import asyncio

asyncio.run(basic_astream())
```
