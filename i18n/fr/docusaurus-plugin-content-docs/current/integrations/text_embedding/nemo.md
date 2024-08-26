---
translated: true
---

# Intégrations NVIDIA NeMo

Connectez-vous au service d'intégration NVIDIA à l'aide de la classe `NeMoEmbeddings`.

Le microservice d'intégration de récupération NeMo (NREM) apporte la puissance des intégrations de texte de pointe à vos applications, offrant des capacités de traitement et de compréhension du langage naturel inégalées. Que vous développiez une recherche sémantique, des pipelines de génération augmentée par la récupération (RAG) ou toute application nécessitant l'utilisation d'intégrations de texte, NREM vous couvre. Construit sur la plateforme logicielle NVIDIA intégrant CUDA, TensorRT et Triton, NREM apporte le service de modèles d'intégration de texte accéléré par GPU de pointe.

NREM utilise TensorRT d'NVIDIA, construit sur le serveur d'inférence Triton, pour une inférence optimisée des modèles d'intégration de texte.

## Imports

```python
from langchain_community.embeddings import NeMoEmbeddings
```

## Configuration

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
