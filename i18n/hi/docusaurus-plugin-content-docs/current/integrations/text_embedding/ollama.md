---
translated: true
---

# ओलामा

आइए ओलामा एम्बेडिंग्स क्लास को लोड करें।

```python
from langchain_community.embeddings import OllamaEmbeddings
```

```python
embeddings = OllamaEmbeddings()
```

```python
text = "This is a test document."
```

एम्बेडिंग्स को जनरेट करने के लिए, आप या तो किसी व्यक्तिगत पाठ को क्वेरी कर सकते हैं, या आप पाठों की एक सूची को क्वेरी कर सकते हैं।

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```

आइए ओलामा एम्बेडिंग्स क्लास को छोटे मॉडल (उदा. llama:7b) के साथ लोड करें। नोट: अन्य समर्थित मॉडल देखें [https://ollama.ai/library](https://ollama.ai/library)

```python
embeddings = OllamaEmbeddings(model="llama2:7b")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
query_result[:5]
```

```output
[-0.09996627271175385,
 0.015567859634757042,
 0.17670205235481262,
 0.16521376371383667,
 0.21193283796310425]
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:5]
```

```output
[-0.042427532374858856,
 0.01653730869293213,
 0.10052604228258133,
 0.18272635340690613,
 0.20790338516235352]
```
