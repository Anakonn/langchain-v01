---
translated: true
---

# SEC फाइलिंग

>[SEC फाइलिंग](https://www.sec.gov/edgar) एक वित्तीय विवरण या अन्य औपचारिक दस्तावेज है जो अमेरिकी प्रतिभूति और विनिमय आयोग (SEC) को प्रस्तुत किया जाता है। सार्वजनिक कंपनियों, कुछ अंदरूनी लोगों और ब्रोकर-डीलरों को नियमित `SEC फाइलिंग` करने की आवश्यकता होती है। निवेशक और वित्तीय पेशेवर निवेश उद्देश्यों के लिए मूल्यांकन कर रहे कंपनियों के बारे में इन फाइलिंगों पर निर्भर करते हैं।

>`SEC फाइलिंग` डेटा [Kay.ai](https://kay.ai) और [Cybersyn](https://www.cybersyn.com/) द्वारा [Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc) के माध्यम से प्रदान किया जाता है।

## सेटअप

पहले, आपको `kay` पैकेज स्थापित करना होगा। आपको एक API कुंजी की भी आवश्यकता होगी: आप [https://kay.ai](https://kay.ai/) पर मुफ्त में एक प्राप्त कर सकते हैं। एक बार जब आप एक API कुंजी प्राप्त कर लेते हैं, तो आपको इसे `KAY_API_KEY` पर्यावरण चर के रूप में सेट करना होगा।

इस उदाहरण में, हम `KayAiRetriever` का उपयोग करने जा रहे हैं। [kay नोटबुक](/docs/integrations/retrievers/kay) में अधिक विस्तृत जानकारी के लिए इसके द्वारा स्वीकार किए जाने वाले पैरामीटरों पर एक नज़र डालें।

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

## उदाहरण

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
