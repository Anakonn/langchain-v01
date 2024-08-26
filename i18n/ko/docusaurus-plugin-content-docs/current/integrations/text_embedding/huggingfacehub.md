---
translated: true
---

# Hugging Face

Hugging Face Embedding 클래스를 로드해 보겠습니다.

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

## Hugging Face Inference API

Hugging Face Inference API를 통해 임베딩 모델에 액세스할 수도 있습니다. 이 경우 ``sentence_transformers``를 설치하고 모델을 로컬에 다운로드할 필요가 없습니다.

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

``huggingface_hub``를 설치하면 Hugging Face Hub 패키지를 통해 로컬에서 임베딩을 생성할 수도 있습니다.

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
