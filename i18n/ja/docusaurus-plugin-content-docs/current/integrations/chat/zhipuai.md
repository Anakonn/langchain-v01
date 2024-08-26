---
sidebar_label: ZHIPU AI
translated: true
---

# ZHIPU AI

このノートブックでは、LangChainを使ってZHIPU AI APIを[ZHIPU AI API](https://open.bigmodel.cn/dev/api)のように使う方法を示します。

>[*GLM-4*](https://open.bigmodel.cn/)は、質問応答、マルチターンダイアログ、コード生成などの機能を備えた、人間の意図に合わせて調整された多言語の大規模言語モデルです。新世代のベースモデルであるGLM-4の全体的なパフォーマンスは前世代に比べて大幅に向上しており、より長いコンテキストをサポート、マルチモーダリティが強化され、高速な推論速度、より高い並行性をサポートし、推論コストを大幅に削減しています。同時に、GLM-4は知的エージェントの機能を強化しています。

## はじめに

### インストール

まず、Python環境にzhipuaiパッケージがインストールされていることを確認してください。次のコマンドを実行してください:

```python
#!pip install --upgrade httpx httpx-sse PyJWT
```

### 必要なモジュールのインポート

インストールが完了したら、Pythonスクリプトに必要なモジュールをインポートします:

```python
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### APIキーの設定

[ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys)にサインインして、モデルにアクセするためのAPIキーを取得してください。

```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### ZHIPU AIチャットモデルの初期化

チャットモデルの初期化方法は以下の通りです:

```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### 基本的な使い方

システムメッセージとユーザーメッセージを使ってモデルを呼び出すには以下のようにします:

```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```

```python
response = chat.invoke(messages)
print(response.content)  # Displays the AI-generated poem
```

## 高度な機能

### ストリーミングサポート

継続的なやり取りを行う場合は、ストリーミング機能を使用します:

```python
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```

```python
streaming_chat(messages)
```

### 非同期呼び出し

ノンブロッキングの呼び出しには、非同期アプローチを使用します:

```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

```python
response = await async_chat.agenerate([messages])
print(response)
```

### 関数呼び出しの使用

GLM-4モデルは関数呼び出しとともに使用することもできます。以下のコードを使って、簡単なLangChain json_chat_agentを実行することができます。

```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```
