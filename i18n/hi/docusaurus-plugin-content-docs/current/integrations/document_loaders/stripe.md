---
translated: true
---

# स्ट्राइप

>[स्ट्राइप](https://stripe.com/en-ca) एक आयरिश-अमेरिकी वित्तीय सेवा और सॉफ्टवेयर के रूप में सेवा (SaaS) कंपनी है। यह ई-कॉमर्स वेबसाइटों और मोबाइल एप्लिकेशनों के लिए भुगतान प्रक्रिया सॉफ्टवेयर और एप्लिकेशन प्रोग्रामिंग इंटरफेस प्रदान करता है।

यह नोटबुक `स्ट्राइप REST API` से डेटा लोड करने और LangChain में इसे इंजेस्ट करने के लिए प्रारूप में कैसे लोड करना है, साथ ही उदाहरण उपयोग के लिए वेक्टरीकरण कवर करता है।

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

स्ट्राइप API एक एक्सेस टोकन की आवश्यकता होती है, जो स्ट्राइप डैशबोर्ड के अंदर पाया जा सकता है।

यह दस्तावेज़ लोडर भी एक `संसाधन` विकल्प की आवश्यकता होती है जो परिभाषित करता है कि आप कौन सा डेटा लोड करना चाहते हैं।

निम्नलिखित संसाधन उपलब्ध हैं:

`balance_transations` [दस्तावेज़ीकरण](https://stripe.com/docs/api/balance_transactions/list)

`charges` [दस्तावेज़ीकरण](https://stripe.com/docs/api/charges/list)

`customers` [दस्तावेज़ीकरण](https://stripe.com/docs/api/customers/list)

`events` [दस्तावेज़ीकरण](https://stripe.com/docs/api/events/list)

`refunds` [दस्तावेज़ीकरण](https://stripe.com/docs/api/refunds/list)

`disputes` [दस्तावेज़ीकरण](https://stripe.com/docs/api/disputes/list)

```python
stripe_loader = StripeLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([stripe_loader])
stripe_doc_retriever = index.vectorstore.as_retriever()
```
