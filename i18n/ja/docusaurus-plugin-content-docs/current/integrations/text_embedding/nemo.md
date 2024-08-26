---
translated: true
---

# NVIDIA NeMo embeddings

NVIDIA NeMoエンベディングを使用して、NVIDIAのエンベディングサービスに接続します。

NeMo Retriever Embedding Microservice (NREM)は、最先端のテキストエンベディングの力をアプリケーションにもたらし、自然言語処理と理解の能力を提供します。セマンティック検索、Retrieval Augmented Generation (RAG)パイプライン、またはテキストエンベディングを使用する必要のあるアプリケーションを開発している場合、NREMはあなたをサポートします。CUDA、TensorRT、Tritonを組み込んだNVIDIAソフトウェアプラットフォームに基づいて構築されたNREMは、最先端のGPUアクセラレーテッドテキストエンベディングモデルサービングを提供します。

NREMは、最適化されたテキストエンベディングモデルの推論のためにTriton Inference Serverの上に構築されたNVIDIAのTensorRTを使用しています。

## インポート

```python
from langchain_community.embeddings import NeMoEmbeddings
```

## セットアップ

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
