---
translated: true
---

# Embaas

[embaas](https://embaas.io) एक पूरी तरह से प्रबंधित एनएलपी एपीआई सेवा है जो embedding generation, document text extraction, document to embeddings और अधिक जैसी सुविधाएं प्रदान करता है। आप [विभिन्न पूर्व-प्रशिक्षित मॉडलों](https://embaas.io/docs/models/embeddings) का चयन कर सकते हैं।

इस ट्यूटोरियल में, हम आपको embaas Embeddings API का उपयोग करके दिए गए पाठ के लिए embeddings कैसे उत्पन्न करें, दिखाएंगे।

### पूर्वापेक्षाएं

[https://embaas.io/register](https://embaas.io/register) पर अपना मुफ्त embaas खाता बनाएं और [एपीआई कुंजी](https://embaas.io/dashboard/api-keys) उत्पन्न करें।

```python
import os

# Set API key
embaas_api_key = "YOUR_API_KEY"
# or set environment variable
os.environ["EMBAAS_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_community.embeddings import EmbaasEmbeddings
```

```python
embeddings = EmbaasEmbeddings()
```

```python
# Create embeddings for a single document
doc_text = "This is a test document."
doc_text_embedding = embeddings.embed_query(doc_text)
```

```python
# Print created embedding
print(doc_text_embedding)
```

```python
# Create embeddings for multiple documents
doc_texts = ["This is a test document.", "This is another test document."]
doc_texts_embeddings = embeddings.embed_documents(doc_texts)
```

```python
# Print created embeddings
for i, doc_text_embedding in enumerate(doc_texts_embeddings):
    print(f"Embedding for document {i + 1}: {doc_text_embedding}")
```

```python
# Using a different model and/or custom instruction
embeddings = EmbaasEmbeddings(
    model="instructor-large",
    instruction="Represent the Wikipedia document for retrieval",
)
```

embaas Embeddings API के बारे में अधिक विस्तृत जानकारी के लिए, कृपया [आधिकारिक embaas एपीआई दस्तावेज़](https://embaas.io/api-reference) देखें।
