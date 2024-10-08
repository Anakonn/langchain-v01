---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# Oracle AI Vector Search: सारांश उत्पन्न करें

Oracle AI Vector Search कृत्रिम बुद्धिमत्ता (AI) कार्यभार के लिए डिज़ाइन किया गया है जो आपको डेटा को कीवर्ड के बजाय अर्थशास्त्र के आधार पर क्वेरी करने की अनुमति देता है। Oracle AI Vector Search के सबसे बड़े लाभों में से एक यह है कि अstruक्चर्ड डेटा पर अर्थशास्त्रीय खोज को व्यावसायिक डेटा पर रिलेशनल खोज के साथ एक ही सिस्टम में जोड़ा जा सकता है। यह न केवल शक्तिशाली है, बल्कि महत्वपूर्ण रूप से अधिक प्रभावी भी है क्योंकि आपको एक विशेषज्ञ वेक्टर डेटाबेस जोड़ने की आवश्यकता नहीं है, जिससे कई प्रणालियों के बीच डेटा टुकड़ों की समस्या समाप्त हो जाती है।

गाइड Oracle AI Vector Search के भीतर सारांश क्षमताओं का उपयोग करने का प्रदर्शन करता है ताकि OracleSummary का उपयोग करके आप अपने दस्तावेजों के लिए सारांश उत्पन्न कर सकें।

### पूर्वापेक्षाएं

कृपया Oracle AI Vector Search के साथ Langchain का उपयोग करने के लिए Oracle Python क्लाइंट ड्राइवर स्थापित करें।

```python
# pip install oracledb
```

### Oracle डेटाबेस से कनेक्ट करें

निम्नलिखित नमूना कोड Oracle डेटाबेस से कनेक्ट करने का तरीका दिखाएगा।

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

### सारांश उत्पन्न करें

Oracle AI Vector Search Langchain लाइब्रेरी दस्तावेजों के सारांश उत्पन्न करने के लिए API प्रदान करती है। डेटाबेस, OCIGENAI, HuggingFace आदि सहित कुछ सारांश उत्पादन प्रदाता विकल्प हैं। उपयोगकर्ता अपने पसंदीदा प्रदाता का चयन करके सारांश उत्पन्न कर सकते हैं। उन्हें केवल इन पैरामीटरों को उचित रूप से सेट करने की आवश्यकता है। कृपया इन पैरामीटरों के बारे में पूरी जानकारी के लिए Oracle AI Vector Search गाइडबुक देखें।

***नोट:*** यदि उपयोगकर्ता Oracle के अंदर और डिफ़ॉल्ट प्रदाता 'डेटाबेस' के अलावा किसी अन्य 3rd पार्टी सारांश उत्पादन प्रदाताओं का उपयोग करना चाहते हैं, तो उन्हें प्रॉक्सी सेट करना होगा। यदि आपके पास प्रॉक्सी नहीं है, तो कृपया OracleSummary को इंस्टैंशिएट करते समय प्रॉक्सी पैरामीटर को हटा दें।

```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

निम्नलिखित नमूना कोड सारांश उत्पन्न करने का तरीका दिखाएगा:

```python
from langchain_community.utilities.oracleai import OracleSummary
from langchain_core.documents import Document

"""
# using 'ocigenai' provider
summary_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/summarizeText",
    "model": "cohere.command",
}

# using 'huggingface' provider
summary_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/models/",
    "model": "facebook/bart-large-cnn",
    "wait_for_model": "true"
}
"""

# using 'database' provider
summary_params = {
    "provider": "database",
    "glevel": "S",
    "numParagraphs": 1,
    "language": "english",
}

# get the summary instance
# Remove proxy if not required
summ = OracleSummary(conn=conn, params=summary_params, proxy=proxy)
summary = summ.get_summary(
    "In the heart of the forest, "
    + "a lone fox ventured out at dusk, seeking a lost treasure. "
    + "With each step, memories flooded back, guiding its path. "
    + "As the moon rose high, illuminating the night, the fox unearthed "
    + "not gold, but a forgotten friendship, worth more than any riches."
)

print(f"Summary generated by OracleSummary: {summary}")
```

### एंड टू एंड डेमो

कृपया हमारे पूर्ण डेमो गाइड [Oracle AI Vector Search End-to-End Demo Guide](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) देखें ताकि आप Oracle AI Vector Search की मदद से एक एंड टू एंड RAG पाइपलाइन बना सकें।
