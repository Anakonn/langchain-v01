---
translated: true
---

# हग्गिंग फ़ेस

चलो हग्गिंग फ़ेस एम्बेडिंग क्लास को लोड करते हैं।

```python
%pip install --upgrade --quiet  langchain sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
```

```python
embeddings = HuggingFaceEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
query_result[:3]
```

```output
[-0.04895168915390968, -0.03986193612217903, -0.021562768146395683]
```

```python
doc_result = embeddings.embed_documents([text])
```

## हग्गिंग फ़ेस इन्फरेंस API

हम एम्बेडिंग मॉडल तक भी हग्गिंग फ़ेस इन्फरेंस API के माध्यम से पहुंच सकते हैं, जिसके लिए हमें ``sentence_transformers`` को स्थानीय रूप से स्थापित और मॉडल डाउनलोड करने की आवश्यकता नहीं है।

```python
import getpass

inference_api_key = getpass.getpass("Enter your HF Inference API Key:\n\n")
```

```output
Enter your HF Inference API Key:

 ········
```

```python
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings

embeddings = HuggingFaceInferenceAPIEmbeddings(
    api_key=inference_api_key, model_name="sentence-transformers/all-MiniLM-l6-v2"
)

query_result = embeddings.embed_query(text)
query_result[:3]
```

```output
[-0.038338541984558105, 0.1234646737575531, -0.028642963618040085]
```

## हग्गिंग फ़ेस हब

हम ``huggingface_hub`` को स्थापित करके स्थानीय रूप से भी एम्बेडिंग जनरेट कर सकते हैं।

```python
!pip install huggingface_hub
```

```python
from langchain_community.embeddings import HuggingFaceHubEmbeddings
```

```python
embeddings = HuggingFaceHubEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
query_result[:3]
```
