---
translated: true
---

# उपशिक्षण

>[उपशिक्षण](https://uptrain.ai/) एक ओपन-सोर्स एकीकृत प्लेटफ़ॉर्म है जो जनरेटिव एआई अनुप्रयोगों का मूल्यांकन और सुधार करता है। यह 20+ पूर्व-कॉन्फ़िगर किए गए मूल्यांकनों के लिए ग्रेड प्रदान करता है (भाषा, कोड, एम्बेडिंग उपयोग मामलों को कवर करता है), विफलता के मामलों पर मूल कारण विश्लेषण करता है और उन्हें कैसे हल करना है इस बारे में अंतर्दृष्टि प्रदान करता है।

## स्थापना और सेटअप

```bash
pip install uptrain
```

## कॉलबैक

```python
<!--IMPORTS:[{"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}]-->
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

एक [उदाहरण](/docs/integrations/callbacks/uptrain) देखें।
