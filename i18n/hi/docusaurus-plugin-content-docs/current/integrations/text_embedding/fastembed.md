---
translated: true
---

# FastEmbed द्वारा Qdrant

>[FastEmbed](https://qdrant.github.io/fastembed/) [Qdrant](https://qdrant.tech) से एक हल्का, तेज़, Python लाइब्रेरी है जो एम्बेडिंग जनरेशन के लिए बनाई गई है।
>
>- क्वांटाइज्ड मॉडल वेट्स
>- ONNX Runtime, कोई PyTorch निर्भरता नहीं
>- CPU-पहला डिज़ाइन
>- बड़े डेटासेट के एन्कोडिंग के लिए डेटा-समानांतरता।

## निर्भरताएं

LangChain के साथ FastEmbed का उपयोग करने के लिए, `fastembed` Python पैकेज इंस्टॉल करें।

```python
%pip install --upgrade --quiet  fastembed
```

## आयात

```python
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
```

## FastEmbed इंस्टैंशियेट करना

### पैरामीटर

- `model_name: str` (डिफ़ॉल्ट: "BAAI/bge-small-en-v1.5")
    > उपयोग करने के लिए FastEmbedding मॉडल का नाम। आप समर्थित मॉडलों की सूची [यहाँ](https://qdrant.github.io/fastembed/examples/Supported_Models/) पा सकते हैं।

- `max_length: int` (डिफ़ॉल्ट: 512)
    > अधिकतम टोकन संख्या। 512 से अधिक मूल्यों के लिए अज्ञात व्यवहार।

- `cache_dir: Optional[str]`
    > कैश डायरेक्टरी का पथ। डिफ़ॉल्ट रूप से पैरेंट डायरेक्टरी में `local_cache` है।

- `threads: Optional[int]`
    > एक onnxruntime सत्र द्वारा उपयोग किए जाने वाले थ्रेड की संख्या। डिफ़ॉल्ट रूप से None है।

- `doc_embed_type: Literal["default", "passage"]` (डिफ़ॉल्ट: "default")
    > "default": FastEmbed के डिफ़ॉल्ट एम्बेडिंग विधि का उपयोग करता है।

    > "passage": पाठ के सामने "passage" प्रीफिक्स करता है और फिर एम्बेड करता है।

```python
embeddings = FastEmbedEmbeddings()
```

## उपयोग

### दस्तावेज़ एम्बेडिंग जनरेट करना

```python
document_embeddings = embeddings.embed_documents(
    ["This is a document", "This is some other document"]
)
```

### क्वेरी एम्बेडिंग जनरेट करना

```python
query_embeddings = embeddings.embed_query("This is a query")
```
