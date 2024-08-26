---
translated: true
---

# 증권거래위원회(SEC) 제출 서류

>[증권거래위원회(SEC) 제출 서류](https://www.sec.gov/edgar)는 미국 증권거래위원회(SEC)에 제출되는 재무 보고서 또는 기타 공식 문서입니다. 상장 기업, 특정 내부자 및 중개인은 정기적으로 `SEC 제출 서류`를 제출해야 합니다. 투자자와 금융 전문가는 투자 평가를 위해 이러한 제출 서류를 활용합니다.

>`SEC 제출 서류` 데이터는 [Kay.ai](https://kay.ai) 및 [Cybersyn](https://www.cybersyn.com/)을 통해 [Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc)에서 제공됩니다.

## 설정

먼저 `kay` 패키지를 설치해야 합니다. API 키도 필요합니다: [https://kay.ai](https://kay.ai/)에서 무료로 받을 수 있습니다. API 키를 받으면 `KAY_API_KEY` 환경 변수로 설정해야 합니다.

이 예에서는 `KayAiRetriever`를 사용할 것입니다. 매개변수에 대한 자세한 정보는 [kay 노트북](/docs/integrations/retrievers/kay)을 참조하세요.

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

## 예시

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
