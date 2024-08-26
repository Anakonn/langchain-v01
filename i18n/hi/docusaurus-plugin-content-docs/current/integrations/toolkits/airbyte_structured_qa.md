---
translated: true
---

# Airbyte प्रश्न उत्तर

यह नोटबुक दिखाता है कि संरचित डेटा पर प्रश्न उत्तर कैसे करें, इस मामले में `AirbyteStripeLoader` का उपयोग करके।

वेक्टर स्टोर अक्सर ऐसे प्रश्नों का जवाब देने में मुश्किल का सामना करते हैं जो संरचित डेटा की गणना, समूहीकरण और फ़िल्टरिंग की आवश्यकता रखते हैं, इसलिए उच्च स्तरीय विचार यह है कि इन प्रकार के प्रश्नों के लिए `pandas` डेटाफ़्रेम का उपयोग करें।

1. `AirbyteStripeLoader` का उपयोग करके स्ट्राइप से डेटा लोड करें। `record_handler` पैरामीटर का उपयोग करके डेटा लोडर से JSON वापस करें।

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

2. डेटा को `pandas` डेटाफ़्रेम में पास करें।

```python
df = pd.DataFrame(data)
```

3. डेटाफ़्रेम `df` को `create_pandas_dataframe_agent` में पास करें और इसे कॉल करें।

```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-4"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```

4. एजेंट को चलाएं

```python
output = agent.run("How many rows are there?")
```
