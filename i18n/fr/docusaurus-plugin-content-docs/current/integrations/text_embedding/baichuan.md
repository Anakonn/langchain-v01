---
translated: true
---

# Baichuan Text Embeddings

À ce jour (25 janvier 2024), BaichuanTextEmbeddings se classe n°1 dans le classement C-MTEB (Chinese Multi-Task Embedding Benchmark).

Classement (sous Général -> Section chinoise) : https://huggingface.co/spaces/mteb/leaderboard

Site officiel : https://platform.baichuan-ai.com/docs/text-Embedding

Une clé d'API est requise pour utiliser ce modèle d'intégration. Vous pouvez en obtenir une en vous inscrivant sur https://platform.baichuan-ai.com/docs/text-Embedding.

BaichuanTextEmbeddings prend en charge une fenêtre de 512 jetons et produit des vecteurs de 1024 dimensions.

Veuillez noter que BaichuanTextEmbeddings ne prend en charge que l'intégration de texte chinois. La prise en charge de plusieurs langues arrive bientôt.

```python
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

Vous pouvez également définir la clé d'API de cette manière :

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
