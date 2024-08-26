---
translated: true
---

# Aleph Alpha

Aleph Alpha के सेमांटिक एम्बेडिंग का उपयोग करने के दो संभावित तरीके हैं। यदि आपके पास असमान संरचना वाले पाठ्य (जैसे एक दस्तावेज़ और एक क्वेरी) हैं, तो आप असमतुल्य एम्बेडिंग का उपयोग करना चाहेंगे। इसके विपरीत, तुलनीय संरचना वाले पाठ्य के लिए, समतुल्य एम्बेडिंग का सुझाव दिया जाता है।

## असमतुल्य

```python
from langchain_community.embeddings import AlephAlphaAsymmetricSemanticEmbedding
```

```python
document = "This is a content of the document"
query = "What is the content of the document?"
```

```python
embeddings = AlephAlphaAsymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```

```python
doc_result = embeddings.embed_documents([document])
```

```python
query_result = embeddings.embed_query(query)
```

## समतुल्य

```python
from langchain_community.embeddings import AlephAlphaSymmetricSemanticEmbedding
```

```python
text = "This is a test text"
```

```python
embeddings = AlephAlphaSymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
query_result = embeddings.embed_query(text)
```
