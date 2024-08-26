---
translated: true
---

# Airbyte 질문 답변

이 노트북은 `AirbyteStripeLoader`를 사용하여 구조화된 데이터에 대한 질문 답변을 수행하는 방법을 보여줍니다.

벡터 저장소는 구조화된 데이터에 대한 계산, 그룹화 및 필터링이 필요한 질문에 답변하기 어려운 경우가 많으므로, 이러한 유형의 질문에 도움이 되도록 `pandas` 데이터프레임을 사용하는 것이 핵심 아이디어입니다.

1. `record_handler` 매개변수를 사용하여 데이터 로더에서 JSON을 반환하여 Stripe에서 데이터를 로드합니다.

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

2. 데이터를 `pandas` 데이터프레임으로 전달합니다.

```python
df = pd.DataFrame(data)
```

3. 데이터프레임 `df`를 `create_pandas_dataframe_agent`에 전달하고 호출합니다.

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-4"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

4. 에이전트를 실행합니다.

```python
output = agent.run("How many rows are there?")
```
