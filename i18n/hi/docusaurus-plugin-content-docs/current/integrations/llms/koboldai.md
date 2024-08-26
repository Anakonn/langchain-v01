---
translated: true
---

# KoboldAI API

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) एक "एआई-सहायता वाले लेखन के लिए एक ब्राउज़र-आधारित फ्रंट-एंड है..." है। इसके पास एक सार्वजनिक और स्थानीय API है जिसका उपयोग langchain में किया जा सकता है।

यह उदाहरण LangChain का उपयोग करके उस API का उपयोग करने के बारे में बताता है।

प्रलेखन आपके एंडपॉइंट के अंत में /api जोड़कर ब्राउज़र में पाया जा सकता है (यानी http://127.0.0.1/:5000/api)।

```python
from langchain_community.llms import KoboldApiLLM
```

नीचे दिखाए गए एंडपॉइंट को --api या --public-api के साथ वेबयूआई शुरू करने के बाद दिखाए गए एंडपॉइंट से बदलें

वैकल्पिक रूप से, आप तापमान या max_length जैसे पैरामीटर भी पास कर सकते हैं।

```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```

```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```
