---
translated: true
---

# Incrustaciones de NVIDIA NeMo

Conéctese al servicio de incrustación de NVIDIA utilizando la clase `NeMoEmbeddings`.

El Servicio de Microempresas de Recuperación de Incrustaciones de NeMo (NREM) aporta el poder de los últimos avances en incrustación de texto a sus aplicaciones, proporcionando capacidades de procesamiento y comprensión del lenguaje natural sin precedentes. Ya sea que esté desarrollando búsqueda semántica, canalizaciones de Generación Aumentada por Recuperación (RAG) o cualquier aplicación que necesite utilizar incrustaciones de texto, NREM lo tiene cubierto. Construido sobre la plataforma de software NVIDIA que incorpora CUDA, TensorRT y Triton, NREM aporta el servicio de modelos de incrustación de texto acelerados por GPU de última generación.

NREM utiliza TensorRT de NVIDIA construido sobre el Servidor de Inferencia Triton para una inferencia optimizada de los modelos de incrustación de texto.

## Importaciones

```python
from langchain_community.embeddings import NeMoEmbeddings
```

## Configuración

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
