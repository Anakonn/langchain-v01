---
translated: true
---

# SpaCy

>[spaCy](https://spacy.io/) एक उन्नत प्राकृतिक भाषा प्रसंस्करण के लिए एक ओपन-सोर्स सॉफ्टवेयर लाइब्रेरी है, जिसे प्रोग्रामिंग भाषाओं Python और Cython में लिखा गया है।

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  spacy
```

आवश्यक वर्गों को आयात करें

```python
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## उदाहरण

SpacyEmbeddings को प्रारंभ करें। यह मेमोरी में Spacy मॉडल को लोड करेगा।

```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

कुछ उदाहरण पाठ परिभाषित करें। ये किसी भी दस्तावेज हो सकते हैं जिनका आप विश्लेषण करना चाहते हैं - उदाहरण के लिए, समाचार लेख, सोशल मीडिया पोस्ट या उत्पाद समीक्षाएं।

```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

पाठों के लिए एम्बेडिंग जनरेट और प्रिंट करें। SpacyEmbeddings वर्ग प्रत्येक दस्तावेज के लिए एक एम्बेडिंग जनरेट करता है, जो दस्तावेज के सामग्री का एक संख्यात्मक प्रतिनिधित्व है। ये एम्बेडिंग विभिन्न प्राकृतिक भाषा प्रसंस्करण कार्यों, जैसे दस्तावेज समानता तुलना या पाठ वर्गीकरण के लिए उपयोग किए जा सकते हैं।

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

एक अकेले पाठ के लिए एम्बेडिंग जनरेट और प्रिंट करें। आप एक अकेले पाठ, जैसे एक खोज क्वेरी के लिए भी एम्बेडिंग जनरेट कर सकते हैं। यह जानकारी पुनर्प्राप्ति जैसे कार्यों के लिए उपयोगी हो सकता है, जहां आप दिए गए क्वेरी से समान दस्तावेज खोजना चाहते हैं।

```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
