---
translated: true
---

# Iugu

>[Iugu](https://www.iugu.com/) एक ब्राजीलियाई सेवाएं और सॉफ्टवेयर-एज-ए-सर्विस (SaaS) कंपनी है। यह ई-कॉमर्स वेबसाइटों और मोबाइल एप्लिकेशनों के लिए भुगतान-प्रोसेसिंग सॉफ्टवेयर और एप्लिकेशन प्रोग्रामिंग इंटरफेस प्रदान करता है।

यह नोटबुक `Iugu REST API` से डेटा लोड करने और उसे LangChain में इंजेस्ट करने के लिए प्रारूप में कवर करता है, साथ ही वेक्टरीकरण के लिए उदाहरण उपयोग भी शामिल है।

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import IuguLoader
```

Iugu API एक एक्सेस टोकन की आवश्यकता है, जिसे Iugu डैशबोर्ड के अंदर पाया जा सकता है।

यह दस्तावेज़ लोडर भी एक `resource` विकल्प की आवश्यकता है जो परिभाषित करता है कि आप कौन सा डेटा लोड करना चाहते हैं।

निम्नलिखित संसाधन उपलब्ध हैं:

`Documentation` [Documentation](https://dev.iugu.com/reference/metadados)

```python
iugu_loader = IuguLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([iugu_loader])
iugu_doc_retriever = index.vectorstore.as_retriever()
```
