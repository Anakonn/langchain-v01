---
translated: true
---

# Hugging Face

Chargeons la classe Hugging Face Embedding.

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

## API d'inférence Hugging Face

Nous pouvons également accéder aux modèles d'intégration via l'API d'inférence Hugging Face, qui ne nécessite pas l'installation de ``sentence_transformers`` et le téléchargement de modèles localement.

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

## Hugging Face Hub

Nous pouvons également générer des intégrations localement via le package Hugging Face Hub, qui nécessite l'installation de ``huggingface_hub``

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
