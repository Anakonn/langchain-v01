---
translated: true
---

# EDEN AI

Eden AI एआई परिदृश्य को क्रांतिकारी बना रहा है क्योंकि यह सर्वश्रेष्ठ एआई प्रदाताओं को एकजुट करता है, उपयोगकर्ताओं को असीमित संभावनाओं को खोलने और कृत्रिम बुद्धिमत्ता के वास्तविक क्षमता का लाभ उठाने में सक्षम बनाता है। एक सर्वव्यापी व्यापक और परेशानी मुक्त प्लेटफ़ॉर्म के साथ, यह उपयोगकर्ताओं को एक एकल एपीआई के माध्यम से एआई क्षमताओं की पूरी श्रृंखला तक आसान पहुंच प्रदान करते हुए उत्पादन में एआई सुविधाओं को तेजी से तैनात करने की अनुमति देता है। (वेबसाइट: https://edenai.co/)

यह उदाहरण LangChain का उपयोग करके Eden AI एम्बेडिंग मॉडल के साथ कैसे काम करना है, इस बारे में बताता है।

-----------------------------------------------------------------------------------

EDENAI के एपीआई का उपयोग करने के लिए एक एपीआई कुंजी की आवश्यकता होती है,

जिसे आप एक खाता बनाकर https://app.edenai.run/user/register और यहां जाकर प्राप्त कर सकते हैं https://app.edenai.run/admin/account/settings

एक बार जब हमारे पास कुंजी हो जाती है, तो हम इसे निम्नलिखित कमांड चलाकर एक पर्यावरण चर के रूप में सेट करना चाहेंगे:

```shell
export EDENAI_API_KEY="..."
```

यदि आप एक पर्यावरण चर सेट करना नहीं चाहते हैं, तो आप EdenAI एम्बेडिंग क्लास को प्रारंभ करते समय edenai_api_key नामित पैरामीटर के माध्यम से कुंजी को सीधे पास कर सकते हैं:

```python
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```

```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## मॉडल को कॉल करना

EDENAI एपीआई विभिन्न प्रदाताओं को एक साथ लाता है।

किसी विशिष्ट मॉडल तक पहुंचने के लिए, आप सिर्फ "प्रदाता" का उपयोग कर सकते हैं जब कॉल करते हैं।

```python
embeddings = EdenAiEmbeddings(provider="openai")
```

```python
docs = ["It's raining right now", "cats are cute"]
document_result = embeddings.embed_documents(docs)
```

```python
query = "my umbrella is broken"
query_result = embeddings.embed_query(query)
```

```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```

```output
Cosine similarity between "It's raining right now" and query: 0.849261496107252
Cosine similarity between "cats are cute" and query: 0.7525900655705218
```
