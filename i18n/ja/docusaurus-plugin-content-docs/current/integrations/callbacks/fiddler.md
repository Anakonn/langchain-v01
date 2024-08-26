---
translated: true
---

# Fiddler

>[Fiddler](https://www.fiddler.ai/)は、データサイエンス、MLOps、リスク、コンプライアンス、アナリティクス、およびその他のLOBチームが、エンタープライズスケールでML展開を監視、説明、分析、改善できる統一プラットフォームを提供する、エンタープライズ向けGenerativeおよびPredictiveシステムオペレーションのパイオニアです。

## 1. インストールとセットアップ

```python
#!pip install langchain langchain-community langchain-openai fiddler-client
```

## 2. Fiddlerの接続詳細

*Fiddlerにモデルに関する情報を追加する前に*

1. Fiddlerに接続するためのURL
2. 組織ID
3. 認証トークン

これらは、Fiddler環境の*設定*ページから見つけることができます。

```python
URL = ""  # Your Fiddler instance URL, Make sure to include the full URL (including https://). For example: https://demo.fiddler.ai
ORG_NAME = ""
AUTH_TOKEN = ""  # Your Fiddler instance auth token

# Fiddler project and model names, used for model registration
PROJECT_NAME = ""
MODEL_NAME = ""  # Model name in Fiddler
```

## 3. Fiddlerコールバックハンドラーインスタンスの作成

```python
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler

fiddler_handler = FiddlerCallbackHandler(
    url=URL,
    org=ORG_NAME,
    project=PROJECT_NAME,
    model=MODEL_NAME,
    api_key=AUTH_TOKEN,
)
```

## 例1: 基本的なチェーン

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAI

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])
output_parser = StrOutputParser()

chain = llm | output_parser

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke("How far is moon from earth?")
```

```python
# Few more invocations
chain.invoke("What is the temperature on Mars?")
chain.invoke("How much is 2 + 200000?")
chain.invoke("Which movie won the oscars this year?")
chain.invoke("Can you write me a poem about insomnia?")
chain.invoke("How are you doing today?")
chain.invoke("What is the meaning of life?")
```

## 例2: プロンプトテンプレートを使ったチェーン

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])

chain = final_prompt | llm

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke({"input": "What's the square of a triangle?"})
```
