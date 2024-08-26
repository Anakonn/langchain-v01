---
translated: true
---

# Respuesta a preguntas de Airbyte

Este cuaderno muestra cómo realizar respuestas a preguntas sobre datos estructurados, en este caso utilizando el `AirbyteStripeLoader`.

Los almacenes de vectores a menudo tienen dificultades para responder a preguntas que requieren cálculos, agrupación y filtrado de datos estructurados, por lo que la idea general es utilizar un dataframe `pandas` para ayudar con este tipo de preguntas.

1. Cargar datos de Stripe utilizando Airbyte. Usar el parámetro `record_handler` para devolver un JSON del cargador de datos.

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

2. Pasar los datos al dataframe `pandas`.

```python
df = pd.DataFrame(data)
```

3. Pasar el dataframe `df` al `create_pandas_dataframe_agent` e invocar

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-4"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

4. Ejecutar el agente

```python
output = agent.run("How many rows are there?")
```
