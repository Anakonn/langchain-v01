---
translated: true
---

# Polygon IO Toolkit

このノートブックでは、[Polygon IO](https://polygon.io/)ツールキットを使用してエージェントと対話する方法を示します。このツールキットは、Polygonの株式市場データAPIにアクセスできます。

## 使用例

### セットアップ

```python
%pip install --upgrade --quiet langchain-community > /dev/null
```

Polygon IO APIキーを[こちら](https://polygon.io/)で取得し、以下に設定してください。
このサンプルで使用するツールには「Stocks Advanced」サブスクリプションが必要です。

```python
import getpass
import os

os.environ["POLYGON_API_KEY"] = getpass.getpass()
```

```output
········
```

[LangSmith](https://smith.langchain.com/)を設定すると、最高のオブザーバビリティが得られます(必須ではありません)。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### エージェントの初期化

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
polygon = PolygonAPIWrapper()
toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon)
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
```

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=True,
)
```

### 株式の最新価格を取得する

```python
agent_executor.invoke({"input": "What is the latest stock price for AAPL?"})
```
