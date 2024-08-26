---
translated: true
---

# Dépôt SEC

>[Dépôt SEC](https://www.sec.gov/edgar) est un état financier ou un autre document officiel soumis à la U.S. Securities and Exchange Commission (SEC). Les sociétés cotées, certains initiés et les courtiers-négociants sont tenus de faire des `dépôts SEC` réguliers. Les investisseurs et les professionnels de la finance s'appuient sur ces dépôts pour obtenir des informations sur les entreprises qu'ils évaluent à des fins d'investissement.

>`Dépôts SEC` alimentés par [Kay.ai](https://kay.ai) et [Cybersyn](https://www.cybersyn.com/) via [Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc).

## Configuration

Tout d'abord, vous devrez installer le package `kay`. Vous aurez également besoin d'une clé API : vous pouvez en obtenir une gratuitement sur [https://kay.ai](https://kay.ai/). Une fois que vous avez une clé API, vous devez la définir en tant que variable d'environnement `KAY_API_KEY`.

Dans cet exemple, nous allons utiliser le `KayAiRetriever`. Consultez le [notebook kay](/docs/integrations/retrievers/kay) pour plus d'informations détaillées sur les paramètres qu'il accepte.

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

## Exemple

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
