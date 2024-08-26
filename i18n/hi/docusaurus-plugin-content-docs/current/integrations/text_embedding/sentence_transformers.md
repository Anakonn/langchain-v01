---
translated: true
---

# Hugging Face पर वाक्य रूपांतरकर्ता

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) वाक्य, पाठ और छवि एम्बेडिंग के लिए एक अत्याधुनिक Python फ्रेमवर्क है।
>एम्बेडिंग मॉडलों में से एक का उपयोग `HuggingFaceEmbeddings` क्लास में किया जाता है।
>हम उन उपयोगकर्ताओं के लिए `SentenceTransformerEmbeddings` के लिए एक उपनाम भी जोड़ चुके हैं जो सीधे उस पैकेज का उपयोग करने से अधिक परिचित हैं।

`sentence_transformers` पैकेज मॉडल [Sentence-BERT](https://arxiv.org/abs/1908.10084) से उत्पन्न होते हैं।

```python
%pip install --upgrade --quiet  sentence_transformers > /dev/null
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.1[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
```

```python
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# Equivalent to SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text, "This is not a test document."])
```
