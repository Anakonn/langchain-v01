---
translated: true
---

# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM) एक बड़े भाषा मॉडलों (LLMs) को उत्पादन में चलाने के लिए एक खुला प्लेटफ़ॉर्म है। यह डेवलपर्स को किसी भी ओपन-सोर्स LLM के साथ अनुमान चलाने, क्लाउड या ऑन-प्रेमिसेस पर तैनात करने और शक्तिशाली AI ऐप्स बनाने में आसान बनाता है।

## स्थापना

[PyPI](https://pypi.org/project/openllm/) के माध्यम से `openllm` स्थापित करें।

```python
%pip install --upgrade --quiet  openllm
```

## स्थानीय रूप से OpenLLM सर्वर लॉन्च करें

एक LLM सर्वर शुरू करने के लिए, `openllm start` कमांड का उपयोग करें। उदाहरण के लिए, एक dolly-v2 सर्वर शुरू करने के लिए, निम्नलिखित कमांड एक टर्मिनल से चलाएं:

```bash
openllm start dolly-v2
```

## रैपर

```python
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### वैकल्पिक: स्थानीय LLM अनुमान

आप वर्तमान प्रक्रिया से स्थानीय रूप से OpenLLM द्वारा प्रबंधित एक LLM को भी प्रारंभ कर सकते हैं। यह विकास उद्देश्य के लिए उपयोगी है और डेवलपर्स को तेजी से विभिन्न प्रकार के LLM आज़माने की अनुमति देता है।

LLM अनुप्रयोगों को उत्पादन में ले जाते समय, हम अलग से OpenLLM सर्वर तैनात करने और ऊपर प्रदर्शित `server_url` विकल्प के माध्यम से उसका उपयोग करने की सिफारिश करते हैं।

LangChain रैपर के माध्यम से स्थानीय रूप से एक LLM लोड करने के लिए:

```python
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### एक LLMChain के साथ एकीकृत करें

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```

```output
iLkb
```
