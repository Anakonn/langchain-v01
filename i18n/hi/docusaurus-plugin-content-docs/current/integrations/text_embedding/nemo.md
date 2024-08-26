---
translated: true
---

# NVIDIA NeMo embeddings

कनेक्ट करें NVIDIA के एम्बेडिंग सर्विस का उपयोग करके `NeMoEmbeddings` क्लास।

NEMO रिट्रीवर एम्बेडिंग माइक्रोसर्विस (NREM) आपके अनुप्रयोगों में state-of-the-art टेक्स्ट एम्बेडिंग की शक्ति लाता है, जो असमान प्राकृतिक भाषा प्रसंस्करण और समझ क्षमताएं प्रदान करता है। चाहे आप सेमेंटिक खोज, रिट्रीवल ऑग्मेंटेड जनरेशन (RAG) पाइपलाइन या किसी भी अनुप्रयोग विकसित कर रहे हों जिसे टेक्स्ट एम्बेडिंग का उपयोग करने की आवश्यकता है - NREM आपको कवर करता है। NVIDIA सॉफ्टवेयर प्लेटफॉर्म पर निर्मित, जिसमें CUDA, TensorRT और Triton शामिल हैं, NREM राज्य-के-कला GPU त्वरित टेक्स्ट एम्बेडिंग मॉडल सेवा लाता है।

NREM NVIDIA के TensorRT का उपयोग करता है जो Triton Inference Server के ऊपर बना है, टेक्स्ट एम्बेडिंग मॉडलों के अनुकूलित अनुमान के लिए।

## आयात

```python
from langchain_community.embeddings import NeMoEmbeddings
```

## सेटअप

```python
batch_size = 16
model = "NV-Embed-QA-003"
api_endpoint_url = "http://localhost:8080/v1/embeddings"
```

```python
embedding_model = NeMoEmbeddings(
    batch_size=batch_size, model=model, api_endpoint_url=api_endpoint_url
)
```

```output
Checking if endpoint is live: http://localhost:8080/v1/embeddings
```

```python
embedding_model.embed_query("This is a test.")
```
