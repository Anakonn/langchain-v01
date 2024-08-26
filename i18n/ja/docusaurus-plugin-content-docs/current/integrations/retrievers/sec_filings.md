---
translated: true
---

# SEC 提出書類

>[SEC 提出書類](https://www.sec.gov/edgar)は、米国証券取引委員会(SEC)に提出される財務諸表やその他の正式な書類です。上場企業、一部の関係者、ブローカー・ディーラーは定期的に `SEC 提出書類` を提出する必要があります。投資家や金融専門家はこれらの提出書類から、投資対象企業に関する情報を得ています。

>`SEC 提出書類` のデータは、[Kay.ai](https://kay.ai)と[Cybersyn](https://www.cybersyn.com/)により、[Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc)を通じて提供されています。

## セットアップ

まず、`kay` パッケージをインストールする必要があります。また、APIキーも必要です。無料で取得できます: [https://kay.ai](https://kay.ai/)。APIキーは環境変数 `KAY_API_KEY` に設定する必要があります。

この例では、`KayAiRetriever` を使用します。パラメータの詳細については、[kay notebook](/docs/integrations/retrievers/kay)を参照してください。

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

## 例

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
