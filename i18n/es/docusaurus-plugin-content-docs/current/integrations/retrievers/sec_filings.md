---
translated: true
---

# Presentación de la SEC

>[Presentación de la SEC](https://www.sec.gov/edgar) es un estado financiero u otro documento formal presentado a la Comisión de Valores y Bolsa de EE. UU. (SEC). Las empresas públicas, ciertos insiders y los corredores de bolsa deben hacer `presentaciones de la SEC` de forma regular. Los inversores y los profesionales financieros confían en estas presentaciones para obtener información sobre las empresas que están evaluando con fines de inversión.

>`Presentaciones de la SEC` con datos proporcionados por [Kay.ai](https://kay.ai) y [Cybersyn](https://www.cybersyn.com/) a través de [Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc).

## Configuración

Primero, deberá instalar el paquete `kay`. También necesitará una clave API: puede obtener una de forma gratuita en [https://kay.ai](https://kay.ai/). Una vez que tenga una clave API, debe establecerla como una variable de entorno `KAY_API_KEY`.

En este ejemplo, vamos a usar `KayAiRetriever`. Echa un vistazo a la [libreta de Kay](/docs/integrations/retrievers/kay) para obtener información más detallada sobre los parámetros que acepta.

```python
# Setup API keys for Kay and OpenAI
from getpass import getpass

KAY_API_KEY = getpass()
OPENAI_API_KEY = getpass()
```

```output
 ········
 ········
```

```python
import os

os.environ["KAY_API_KEY"] = KAY_API_KEY
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## Ejemplo

```python
from langchain.chains import ConversationalRetrievalChain
from langchain_community.retrievers import KayAiRetriever
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")
retriever = KayAiRetriever.create(
    dataset_id="company", data_types=["10-K", "10-Q"], num_contexts=6
)
qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
```

```python
questions = [
    "What are patterns in Nvidia's spend over the past three quarters?",
    # "What are some recent challenges faced by the renewable energy sector?",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```

```output
-> **Question**: What are patterns in Nvidia's spend over the past three quarters?

**Answer**: Based on the provided information, here are the patterns in NVIDIA's spend over the past three quarters:

1. Research and Development Expenses:
   - Q3 2022: Increased by 34% compared to Q3 2021.
   - Q1 2023: Increased by 40% compared to Q1 2022.
   - Q2 2022: Increased by 25% compared to Q2 2021.

   Overall, research and development expenses have been consistently increasing over the past three quarters.

2. Sales, General and Administrative Expenses:
   - Q3 2022: Increased by 8% compared to Q3 2021.
   - Q1 2023: Increased by 14% compared to Q1 2022.
   - Q2 2022: Decreased by 16% compared to Q2 2021.

   The pattern for sales, general and administrative expenses is not as consistent, with some quarters showing an increase and others showing a decrease.

3. Total Operating Expenses:
   - Q3 2022: Increased by 25% compared to Q3 2021.
   - Q1 2023: Increased by 113% compared to Q1 2022.
   - Q2 2022: Increased by 9% compared to Q2 2021.

   Total operating expenses have generally been increasing over the past three quarters, with a significant increase in Q1 2023.

Overall, the pattern indicates a consistent increase in research and development expenses and total operating expenses, while sales, general and administrative expenses show some fluctuations.
```
