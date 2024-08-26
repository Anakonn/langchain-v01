---
sidebar_label: Alibaba Cloud PAI EAS
translated: true
---

# Alibaba Cloud PAI EAS

>>[Alibaba Cloud PAI (Platform for AI)](https://www.alibabacloud.com/help/en/pai/?spm=a2c63.p38356.0.0.c26a426ckrxUwZ) एक हल्का और लागत-प्रभावी मशीन लर्निंग प्लेटफॉर्म है जो क्लाउड-नेटिव प्रौद्योगिकियों का उपयोग करता है। यह आपको एंड-टू-एंड मॉडलिंग सेवा प्रदान करता है। यह 100 से अधिक परिदृश्यों में दस अरब से अधिक सुविधाओं और सौ अरब से अधिक नमूनों के आधार पर मॉडल प्रशिक्षण को त्वरित करता है।

>>[Alibaba Cloud के मशीन लर्निंग प्लेटफॉर्म के लिए AI](https://www.alibabacloud.com/help/en/machine-learning-platform-for-ai/latest/what-is-machine-learning-pai) एक मशीन लर्निंग या गहरी लर्निंग इंजीनियरिंग प्लेटफॉर्म है जो उद्यमों और डेवलपर्स के लिए है। यह आसान-इस्तेमाल, लागत-प्रभावी, उच्च-प्रदर्शन और आसानी से पैमाने पर बढ़ने वाले प्लग-इन प्रदान करता है जिन्हें विभिन्न उद्योग परिदृश्यों में लागू किया जा सकता है। 140 से अधिक बिल्ट-इन अनुकूलन एल्गोरिदम के साथ, `Machine Learning Platform for AI` डेटा लेबलिंग (`PAI-iTAG`), मॉडल बनाना (`PAI-Designer` और `PAI-DSW`), मॉडल प्रशिक्षण (`PAI-DLC`), संकलन अनुकूलन और अनुमान तैनाती (`PAI-EAS`) सहित पूरी प्रक्रिया AI इंजीनियरिंग क्षमताएं प्रदान करता है।

>`PAI-EAS` सीपीयू और जीपीयू सहित विभिन्न प्रकार के हार्डवेयर संसाधनों का समर्थन करता है और उच्च थ्रूपुट और कम लेटेंसी की विशेषता है। यह आपको कुछ क्लिक के साथ बड़े पैमाने पर जटिल मॉडल तैनात करने और वास्तविक समय में लचीली स्केल-इन और स्केल-आउट करने की अनुमति देता है। यह एक व्यापक O&M और निगरानी प्रणाली भी प्रदान करता है।

## EAS सेवा सेट अप करें

EAS सेवा URL और टोकन को इनिशिएट करने के लिए वातावरण चर सेट करें।
अधिक जानकारी के लिए [यह दस्तावेज](https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/) का उपयोग करें।

```bash
export EAS_SERVICE_URL=XXX
export EAS_SERVICE_TOKEN=XXX
```

एक और विकल्प है इस कोड का उपयोग करना:

```python
import os

from langchain_community.chat_models import PaiEasChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
chat = PaiEasChatEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

## चैट मॉडल चलाएं

आप डिफ़ॉल्ट सेटिंग का उपयोग करके EAS सेवा को इस प्रकार कॉल कर सकते हैं:

```python
output = chat.invoke([HumanMessage(content="write a funny joke")])
print("output:", output)
```

या, नए अनुमान पैरामीटर के साथ EAS सेवा को कॉल करें:

```python
kwargs = {"temperature": 0.8, "top_p": 0.8, "top_k": 5}
output = chat.invoke([HumanMessage(content="write a funny joke")], **kwargs)
print("output:", output)
```

या, स्ट्रीम प्रतिक्रिया प्राप्त करने के लिए स्ट्रीम कॉल चलाएं:

```python
outputs = chat.stream([HumanMessage(content="hi")], streaming=True)
for output in outputs:
    print("stream output:", output)
```
