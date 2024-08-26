---
translated: true
---

# Xorbits अनुमान (Xinference)

यह नोटबुक LangChain में Xinference embeddings का उपयोग करने के बारे में चर्चा करता है

## स्थापना

PyPI के माध्यम से `Xinference` स्थापित करें:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## स्थानीय या वितरित क्लस्टर में Xinference तैनात करें।

स्थानीय तैनाती के लिए, `xinference` चलाएं।

Xinference को क्लस्टर में तैनात करने के लिए, पहले `xinference-supervisor` का उपयोग करके एक Xinference पर्यवेक्षक शुरू करें। आप -p का विकल्प पोर्ट निर्दिष्ट करने और -H का उपयोग होस्ट निर्दिष्ट करने के लिए भी कर सकते हैं। डिफ़ॉल्ट पोर्ट 9997 है।

फिर, प्रत्येक सर्वर पर जहां आप उन्हें चलाना चाहते हैं, `xinference-worker` का उपयोग करके Xinference कार्यकर्ताओं को शुरू करें।

[Xinference](https://github.com/xorbitsai/inference) से README फ़ाइल को देखकर अधिक जानकारी प्राप्त कर सकते हैं।

## रैपर

LangChain के साथ Xinference का उपयोग करने के लिए, आपको पहले एक मॉडल लॉन्च करना होगा। आप इसे कमांड लाइन इंटरफ़ेस (CLI) का उपयोग करके कर सकते हैं:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```

एक मॉडल UID आपके उपयोग के लिए वापस दिया जाता है। अब आप LangChain के साथ Xinference embeddings का उपयोग कर सकते हैं:

```python
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```

```python
query_result = xinference.embed_query("This is a test query")
```

```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

अंत में, जब आपको इसका उपयोग करने की आवश्यकता नहीं होती है, तो मॉडल को समाप्त करें:

```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```
