---
translated: true
---

# ड्रिया

>[ड्रिया](https://dria.co/) डेवलपर्स के लिए सार्वजनिक RAG मॉडल का एक केंद्र है, जहां वे योगदान कर सकते हैं और एक साझा एम्बेडिंग लेक का उपयोग कर सकते हैं। यह नोटबुक `ड्रिया एपीआई` का उपयोग करके डेटा पुनर्प्राप्ति कार्यों का प्रदर्शन करता है।

# इंस्टॉलेशन

सुनिश्चित करें कि आपके पास `dria` पैकेज इंस्टॉल है। आप इसे pip का उपयोग करके इंस्टॉल कर सकते हैं:

```python
%pip install --upgrade --quiet dria
```

# एपीआई कुंजी कॉन्फ़िगर करें

पहुंच के लिए अपने ड्रिया एपीआई कुंजी को सेट करें।

```python
import os

os.environ["DRIA_API_KEY"] = "DRIA_API_KEY"
```

# ड्रिया रिट्रीवर इनिशियलाइज़ करें

`DriaRetriever` का एक इंस्टेंस बनाएं।

```python
from langchain.retrievers import DriaRetriever

api_key = os.getenv("DRIA_API_KEY")
retriever = DriaRetriever(api_key=api_key)
```

# **नॉलेज बेस बनाएं**

[ड्रिया के नॉलेज हब](https://dria.co/knowledge) पर एक नॉलेज बेस बनाएं।

```python
contract_id = retriever.create_knowledge_base(
    name="France's AI Development",
    embedding=DriaRetriever.models.jina_embeddings_v2_base_en.value,
    category="Artificial Intelligence",
    description="Explore the growth and contributions of France in the field of Artificial Intelligence.",
)
```

# डेटा जोड़ें

अपने ड्रिया नॉलेज बेस में डेटा लोड करें।

```python
texts = [
    "The first text to add to Dria.",
    "Another piece of information to store.",
    "More data to include in the Dria knowledge base.",
]

ids = retriever.add_texts(texts)
print("Data added with IDs:", ids)
```

# डेटा पुनर्प्राप्त करें

किसी क्वेरी के आधार पर प्रासंगिक दस्तावेज़ खोजने के लिए रिट्रीवर का उपयोग करें।

```python
query = "Find information about Dria."
result = retriever.invoke(query)
for doc in result:
    print(doc)
```
