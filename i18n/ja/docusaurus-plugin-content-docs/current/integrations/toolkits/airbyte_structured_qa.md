---
translated: true
---

# Airbyte Question Answering

このノートブックでは、この場合 `AirbyteStripeLoader` を使用して、構造化データに対する質問応答を行う方法を示します。

ベクトルストアは、構造化データの計算、グループ化、フィルタリングを必要とする質問に答えるのが難しいため、高レベルのアイデアは `pandas` データフレームを使用してこれらのタイプの質問に対処することです。

1. Airbyte を使用して Stripe からデータを読み込みます。 `record_handler` パラメーターを使用して、データローダーから JSON を返します。

```python
import os

import pandas as pd
from langchain.agents import AgentType
from langchain_community.document_loaders.airbyte import AirbyteStripeLoader
from langchain_experimental.agents import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI

stream_name = "customers"
config = {
    "client_secret": os.getenv("STRIPE_CLIENT_SECRET"),
    "account_id": os.getenv("STRIPE_ACCOUNT_D"),
    "start_date": "2023-01-20T00:00:00Z",
}


def handle_record(record: dict, _id: str):
    return record.data


loader = AirbyteStripeLoader(
    config=config,
    record_handler=handle_record,
    stream_name=stream_name,
)
data = loader.load()
```

2. データを `pandas` データフレームに渡します。

```python
df = pd.DataFrame(data)
```

3. データフレーム `df` を `create_pandas_dataframe_agent` に渡し、呼び出します。

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-4"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

4. エージェントを実行します。

```python
output = agent.run("How many rows are there?")
```
