---
translated: true
---

# नुक्लिया

>[नुक्लिया](https://nuclia.com) अपने आंतरिक और बाहरी स्रोतों से अव्यवस्थित डेटा को स्वचालित रूप से सूचीबद्ध करता है, जो अनुकूलित खोज परिणाम और उत्पादक उत्तर प्रदान करता है। यह वीडियो और ऑडियो प्रतिलेखन, छवि सामग्री निकालना और दस्तावेज़ पार्सिंग को संभाल सकता है।

`नुक्लिया समझ एपीआई` दस्तावेज़ रूपांतरक पाठ को अनुच्छेद और वाक्यों में विभाजित करता है, इकाइयों की पहचान करता है, पाठ का सारांश प्रदान करता है और सभी वाक्यों के लिए एम्बेडिंग्स उत्पन्न करता है।

नुक्लिया समझ एपीआई का उपयोग करने के लिए, आपके पास एक नुक्लिया खाता होना चाहिए। आप [https://nuclia.cloud](https://nuclia.cloud) पर मुफ्त में एक बना सकते हैं, और फिर [एक एनयूए कुंजी बना सकते हैं](https://docs.nuclia.dev/docs/docs/using/understanding/intro)।

langchain_community.document_transformers.nuclia_text_transform से NucliaTextTransformer आयात करें

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

नुक्लिया दस्तावेज़ रूपांतरक का उपयोग करने के लिए, आपको `enable_ml` को `True` पर सेट करके एक `NucliaUnderstandingAPI` उपकरण को इंस्टैंशिएट करना होगा:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

नुक्लिया दस्तावेज़ रूपांतरक को असिंक्रोनस मोड में कॉल किया जाना चाहिए, इसलिए आपको `atransform_documents` विधि का उपयोग करना होगा:

```python
import asyncio

from langchain_community.document_transformers.nuclia_text_transform import (
    NucliaTextTransformer,
)
from langchain_core.documents import Document


async def process():
    documents = [
        Document(page_content="<TEXT 1>", metadata={}),
        Document(page_content="<TEXT 2>", metadata={}),
        Document(page_content="<TEXT 3>", metadata={}),
    ]
    nuclia_transformer = NucliaTextTransformer(nua)
    transformed_documents = await nuclia_transformer.atransform_documents(documents)
    print(transformed_documents)


asyncio.run(process())
```
