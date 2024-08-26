---
translated: true
---

# Réponse aux questions Airbyte

Ce notebook montre comment faire de la réponse aux questions sur des données structurées, dans ce cas en utilisant le `AirbyteStripeLoader`.

Les magasins de vecteurs ont souvent du mal à répondre aux questions qui nécessitent des calculs, des regroupements et des filtres de données structurées, donc l'idée générale est d'utiliser un dataframe `pandas` pour aider avec ce type de questions.

1. Chargez les données de Stripe à l'aide d'Airbyte. Utilisez le paramètre `record_handler` pour renvoyer un JSON à partir du chargeur de données.

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

2. Transmettez les données au dataframe `pandas`.

```python
df = pd.DataFrame(data)
```

3. Transmettez le dataframe `df` à l'`create_pandas_dataframe_agent` et invoquez-le.

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-4"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

4. Exécutez l'agent

```python
output = agent.run("How many rows are there?")
```
