---
sidebar_label: Azure OpenAI
translated: true
---

# AzureChatOpenAI

>[Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview) GPT-4, GPT-3.5-Turbo और Embeddings मॉडल श्रृंखला सहित OpenAI के शक्तिशाली भाषा मॉडलों तक REST API पहुंच प्रदान करता है। इन मॉडलों को आसानी से आपके विशिष्ट कार्य के लिए अनुकूलित किया जा सकता है, जिसमें सामग्री उत्पादन, सारांश,语义 खोज और कोड अनुवाद शामिल हैं। उपयोगकर्ता REST API, Python SDK या Azure OpenAI स्टूडियो में वेब-आधारित इंटरफ़ेस के माध्यम से सेवा का उपयोग कर सकते हैं।

यह नोटबुक Azure-होस्टेड OpenAI एंडपॉइंट से कनेक्ट करने के बारे में बताता है। पहले, हमें `langchain-openai` पैकेज इंस्टॉल करना होगा।
%pip install -qU langchain-openai
अगला कदम, Azure OpenAI सेवा से कनेक्ट करने में मदद करने के लिए कुछ पर्यावरण चर सेट करना है। आप इन मूल्यों को Azure पोर्टल में पा सकते हैं।

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-06-01-preview"
os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"] = "chat"
```

अब, हम अपने मॉडल का निर्माण करेंगे और इससे बात करेंगे:

```python
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
)
```

```python
message = HumanMessage(
    content="Translate this sentence from English to French. I love programming."
)
model.invoke([message])
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': 'gpt-35-turbo', 'system_fingerprint': None, 'prompt_filter_results': [{'prompt_index': 0, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}], 'finish_reason': 'stop', 'logprobs': None, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}, id='run-25ed88db-38f2-4b0c-a943-a03f217711a9-0')
```

## मॉडल संस्करण

Azure OpenAI प्रतिक्रियाओं में `model` गुण होता है, जो प्रतिक्रिया को जनरेट करने के लिए उपयोग किए गए मॉडल का नाम है। हालांकि, नेटिव OpenAI प्रतिक्रियाओं के विपरीत, इसमें मॉडल का संस्करण नहीं होता है, जो Azure में तैनाती पर सेट होता है। इससे यह पता लगाना मुश्किल हो जाता है कि किस मॉडल के संस्करण का उपयोग प्रतिक्रिया को जनरेट करने के लिए किया गया था, जिसके परिणामस्वरूप `OpenAICallbackHandler` के साथ कुल लागत की गलत गणना हो सकती है।

इस समस्या को हल करने के लिए, आप `model_version` पैरामीटर को `AzureChatOpenAI` क्लास में पास कर सकते हैं, जो मॉडल नाम में जोड़ दिया जाएगा। इस तरह आप आसानी से विभिन्न संस्करणों के बीच अंतर कर सकते हैं।

```python
from langchain.callbacks import get_openai_callback
```

```python
model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ[
        "AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"
    ],  # in Azure, this deployment has version 0613 - input and output tokens are counted separately
)
with get_openai_callback() as cb:
    model.invoke([message])
    print(
        f"Total Cost (USD): ${format(cb.total_cost, '.6f')}"
    )  # without specifying the model version, flat-rate 0.002 USD per 1k input and output tokens is used
```

```output
Total Cost (USD): $0.000041
```

हम `AzureChatOpenAI` कंस्ट्रक्टर को मॉडल संस्करण प्रदान कर सकते हैं। यह Azure OpenAI द्वारा लौटाए गए मॉडल नाम में जोड़ दिया जाएगा और लागत को सही ढंग से गिना जाएगा।

```python
model0301 = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
    model_version="0301",
)
with get_openai_callback() as cb:
    model0301.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")
```

```output
Total Cost (USD): $0.000044
```
