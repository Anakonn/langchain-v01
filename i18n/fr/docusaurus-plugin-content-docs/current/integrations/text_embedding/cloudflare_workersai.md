---
translated: true
---

# Cloudflare Workers AI

>[Cloudflare, Inc. (Wikipédia)](https://en.wikipedia.org/wiki/Cloudflare) est une entreprise américaine qui fournit des services de réseau de diffusion de contenu, de cybersécurité cloud, d'atténuation des attaques par déni de service distribué (DDoS) et de services d'enregistrement de domaines agréés par l'ICANN.

>[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) vous permet d'exécuter des modèles d'apprentissage automatique sur le réseau `Cloudflare`, à partir de votre code via une API REST.

>[Cloudflare AI document](https://developers.cloudflare.com/workers-ai/models/text-embeddings/) répertorie tous les modèles d'intégration de texte disponibles.

## Configuration

L'ID de compte Cloudflare et le jeton API sont requis. Découvrez comment les obtenir dans [ce document](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).

```python
import getpass

my_account_id = getpass.getpass("Enter your Cloudflare account ID:\n\n")
my_api_token = getpass.getpass("Enter your Cloudflare API token:\n\n")
```

## Exemple

```python
from langchain_community.embeddings.cloudflare_workersai import (
    CloudflareWorkersAIEmbeddings,
)
```

```python
embeddings = CloudflareWorkersAIEmbeddings(
    account_id=my_account_id,
    api_token=my_api_token,
    model_name="@cf/baai/bge-small-en-v1.5",
)
# single string embeddings
query_result = embeddings.embed_query("test")
len(query_result), query_result[:3]
```

```output
(384, [-0.033627357333898544, 0.03982774540781975, 0.03559349477291107])
```

```python
# string embeddings in batches
batch_query_result = embeddings.embed_documents(["test1", "test2", "test3"])
len(batch_query_result), len(batch_query_result[0])
```

```output
(3, 384)
```
