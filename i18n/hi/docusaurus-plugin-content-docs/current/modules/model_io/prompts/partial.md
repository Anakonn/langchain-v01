---
sidebar_position: 4
translated: true
---

# आंशिक प्रॉम्प्ट टेम्पलेट

अन्य तरीकों की तरह, "आंशिक" प्रॉम्प्ट टेम्पलेट बनाना भी तर्कसंगत हो सकता है - उदाहरण के लिए, आवश्यक मूल्यों के एक उपसमूह को पास करना, ताकि केवल शेष उपसमूह के मूल्यों की उम्मीद करने वाला एक नया प्रॉम्प्ट टेम्पलेट बनाया जा सके।

LangChain इसे दो तरीकों से समर्थन करता है:
1. स्ट्रिंग मूल्यों के साथ आंशिक प्रारूपण।
2. स्ट्रिंग मूल्य वापस करने वाली फ़ंक्शन के साथ आंशिक प्रारूपण।

इन दो अलग-अलग तरीकों से अलग-अलग उपयोग मामले समर्थित होते हैं। नीचे दिए गए उदाहरणों में, हम दोनों उपयोग मामलों के लिए प्रेरणा और LangChain में इसे कैसे करना है, इस पर चर्चा करते हैं।

## स्ट्रिंग के साथ आंशिक

प्रॉम्प्ट टेम्पलेट को आंशिक बनाने के लिए एक सामान्य उपयोग मामला यह है कि आप कुछ चर पहले और कुछ बाद में प्राप्त करते हैं। उदाहरण के लिए, मान लीजिए कि आपके पास एक प्रॉम्प्ट टेम्पलेट है जिसमें `foo` और `baz` नामक दो चर आवश्यक हैं। यदि आप `foo` मान को श्रृंखला में शुरू में प्राप्त करते हैं, लेकिन `baz` मान बाद में, तो दोनों चर एक ही जगह पर पास करने का इंतजार करना उत्पीड़नकारी हो सकता है। बजाय इसके, आप `foo` मान के साथ प्रॉम्प्ट टेम्पलेट को आंशिक बना सकते हैं, और फिर आंशिक प्रॉम्प्ट टेम्पलेट को आगे पास कर सकते हैं और केवल उसका उपयोग कर सकते हैं। नीचे इसका एक उदाहरण दिया गया है:

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```

```output
foobaz
```

आप प्रॉम्प्ट को आंशिक चरों के साथ भी प्रारंभ कर सकते हैं।

```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```

```output
foobaz
```

## फ़ंक्शन के साथ आंशिक

दूसरा सामान्य उपयोग मामला फ़ंक्शन के साथ आंशिक है। इस उपयोग मामले के लिए प्रेरणा यह है कि जब आप एक ऐसा चर हमेशा एक सामान्य तरीके से प्राप्त करना चाहते हैं। इसका एक प्राइम उदाहरण तारीख या समय है। मान लीजिए कि आपके पास एक प्रॉम्प्ट है जिसमें आप हमेशा वर्तमान तारीख चाहते हैं। आप इसे प्रॉम्प्ट में हार्डकोड नहीं कर सकते, और अन्य इनपुट चरों के साथ इसे पास करना थोड़ा उत्पीड़नकारी है। इस मामले में, प्रॉम्प्ट को एक ऐसी फ़ंक्शन के साथ आंशिक बनाना बहुत उपयोगी हो सकता है जो हमेशा वर्तमान तारीख वापस करता है।

```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")
```

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:22
```

आप प्रॉम्प्ट को आंशिक चरों के साथ भी प्रारंभ कर सकते हैं, जो अक्सर इस कार्यप्रवाह में अधिक उचित होता है।

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:36
```
