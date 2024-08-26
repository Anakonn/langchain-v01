---
translated: true
---

# Predibase

Predibase का उपयोग करना सीखें LangChain मॉडल्स के साथ।

## सेटअप

- एक [Predibase](https://predibase.com/) खाता और [API कुंजी](https://docs.predibase.com/sdk-guide/intro) बनाएं।
- `pip install predibase` के साथ Predibase Python क्लाइंट स्थापित करें
- अपनी API कुंजी का उपयोग प्रमाणीकरण करने के लिए करें

### LLM

Predibase LangChain के साथ LLM मॉड्यूल को लागू करता है। आप नीचे एक छोटा उदाहरण देख सकते हैं या LLM > Integrations > Predibase के तहत एक पूर्ण नोटबुक।

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase `model` तर्क द्वारा दिए गए आधारभूत मॉडल पर फाइन-ट्यून किए गए Predibase-होस्टेड और HuggingFace-होस्टेड एडाप्टर भी समर्थन करता है:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibase `model` तर्क द्वारा दिए गए आधारभूत मॉडल पर फाइन-ट्यून किए गए एडाप्टर भी समर्थन करता है:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```
