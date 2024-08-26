---
translated: true
---

# जॉन स्नो लैब्स

>[जॉन स्नो लैब्स](https://nlp.johnsnowlabs.com/) एनएलपी और एलएलएम पारिस्थितिकी तंत्र में स्केल पर उत्कृष्ट एआई के लिए सॉफ्टवेयर लाइब्रेरी, जिम्मेदार एआई, नो-कोड एआई और हेल्थकेयर, कानूनी, वित्त आदि के लिए 20,000 से अधिक मॉडल तक पहुंच शामिल है।

>मॉडल [nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api) के साथ लोड किए जाते हैं और स्पार्क सत्र [nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession) के तहत शुरू किया जाता है।
>24,000+ मॉडल के लिए, [जॉन स्नो लैब्स मॉडल मॉडल हब](https://nlp.johnsnowlabs.com/models) देखें

## सेटअप करना

```python
%pip install --upgrade --quiet  johnsnowlabs
```

```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## उदाहरण

```python
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

जॉनस्नोलैब्स एम्बेडिंग्स और स्पार्क सत्र को प्रारंभ करें

```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

कुछ उदाहरण पाठ परिभाषित करें। ये किसी भी दस्तावेज हो सकते हैं जिनका आप विश्लेषण करना चाहते हैं - उदाहरण के लिए, समाचार लेख, सोशल मीडिया पोस्ट या उत्पाद समीक्षा।

```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

पाठों के लिए एम्बेडिंग्स उत्पन्न और प्रिंट करें। जॉनस्नोलैब्स एम्बेडिंग्स क्लास प्रत्येक दस्तावेज के लिए एक एम्बेडिंग उत्पन्न करता है, जो दस्तावेज के सामग्री का संख्यात्मक प्रतिनिधित्व है। ये एम्बेडिंग विभिन्न प्राकृतिक भाषा प्रसंस्करण कार्यों, जैसे दस्तावेज समानता तुलना या पाठ वर्गीकरण के लिए उपयोग किए जा सकते हैं।

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

एक अकेले पाठ के लिए एम्बेडिंग उत्पन्न और प्रिंट करें। आप एक अकेले पाठ, जैसे एक खोज क्वेरी के लिए भी एम्बेडिंग उत्पन्न कर सकते हैं। यह जानकारी पुनर्प्राप्ति जैसे कार्यों के लिए उपयोगी हो सकता है, जहां आप दिए गए क्वेरी से समान दस्तावेज खोजना चाहते हैं।

```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
