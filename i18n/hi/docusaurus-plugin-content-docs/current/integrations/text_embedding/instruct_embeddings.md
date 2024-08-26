---
translated: true
---

# Hugging Face पर निर्देश एम्बेडिंग्स

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) एक Python फ्रेमवर्क है जो राज्य-के-कला वाक्य, पाठ और छवि एम्बेडिंग्स के लिए है।
>इंस्ट्रक्ट एम्बेडिंग मॉडलों में से एक `HuggingFaceInstructEmbeddings` क्लास में उपयोग किया जाता है।

```python
from langchain_community.embeddings import HuggingFaceInstructEmbeddings
```

```python
embeddings = HuggingFaceInstructEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```

```output
load INSTRUCTOR_Transformer
max_seq_length  512
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```
