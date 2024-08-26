---
translated: true
---

# NVIDIA NeMo 임베딩

`NeMoEmbeddings` 클래스를 사용하여 NVIDIA의 임베딩 서비스에 연결하세요.

NeMo Retriever Embedding Microservice (NREM)는 최첨단 텍스트 임베딩의 힘을 애플리케이션에 제공하여, 자연어 처리 및 이해 기능을 향상시킵니다. 시맨틱 검색, Retrieval Augmented Generation (RAG) 파이프라인 또는 텍스트 임베딩을 사용해야 하는 다른 애플리케이션을 개발하는 경우, NREM이 도움이 될 것입니다. CUDA, TensorRT 및 Triton을 포함하는 NVIDIA 소프트웨어 플랫폼을 기반으로 구축된 NREM은 GPU 가속 텍스트 임베딩 모델 서비스를 제공합니다.

NREM은 Triton Inference Server 위에 구축된 NVIDIA의 TensorRT를 사용하여 텍스트 임베딩 모델의 최적화된 추론을 제공합니다.

## 가져오기

```python
from langchain_community.embeddings import NeMoEmbeddings
```

## 설정

```python
batch_size = 16
model = "NV-Embed-QA-003"
api_endpoint_url = "http://localhost:8080/v1/embeddings"
```

```python
embedding_model = NeMoEmbeddings(
    batch_size=batch_size, model=model, api_endpoint_url=api_endpoint_url
)
```

```output
Checking if endpoint is live: http://localhost:8080/v1/embeddings
```

```python
embedding_model.embed_query("This is a test.")
```
