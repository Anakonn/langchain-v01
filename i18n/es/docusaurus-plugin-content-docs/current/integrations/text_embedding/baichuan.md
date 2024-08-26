---
translated: true
---

# Incrustaciones de texto de Baichuan

A partir de hoy (25 de enero de 2024), BaichuanTextEmbeddings ocupa el puesto #1 en el ranking de C-MTEB (Chinese Multi-Task Embedding Benchmark).

Ranking (En la sección China -> General): https://huggingface.co/spaces/mteb/leaderboard

Sitio web oficial: https://platform.baichuan-ai.com/docs/text-Embedding

Se requiere una clave API para usar este modelo de incrustación. Puede obtener una registrándose en https://platform.baichuan-ai.com/docs/text-Embedding.

BaichuanTextEmbeddings admite una ventana de 512 tokens y produce vectores con 1024 dimensiones.

TENGA EN CUENTA que BaichuanTextEmbeddings solo admite incrustación de texto en chino. El soporte multilingüe llegará pronto.

```python
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

Alternativamente, puede establecer la clave API de esta manera:

```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```

```python
text_1 = "今天天气不错"
text_2 = "今天阳光很好"

query_result = embeddings.embed_query(text_1)
query_result
```

```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result
```
