---
translated: true
---

# TensorFlow Hub

>[TensorFlow Hub](https://www.tensorflow.org/hub) एक प्रशिक्षित मशीन लर्निंग मॉडलों का भंडार है जिन्हें फाइन-ट्यूनिंग और किसी भी जगह तैनात किया जा सकता है। `BERT` और `Faster R-CNN` जैसे प्रशिक्षित मॉडलों का पुनः उपयोग केवल कुछ पंक्तियों में कोड के साथ करें।

>
TensorflowHub Embedding वर्ग को लोड करें।

```python
from langchain_community.embeddings import TensorflowHubEmbeddings
```

```python
embeddings = TensorflowHubEmbeddings()
```

```output
2023-01-30 23:53:01.652176: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
2023-01-30 23:53:34.362802: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_results = embeddings.embed_documents(["foo"])
```

```python
doc_results
```
