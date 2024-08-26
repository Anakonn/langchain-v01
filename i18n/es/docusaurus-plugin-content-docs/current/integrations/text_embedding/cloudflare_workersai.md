---
translated: true
---

# Cloudflare Workers AI

>[Cloudflare, Inc. (Wikipedia)](https://en.wikipedia.org/wiki/Cloudflare) es una empresa estadounidense que proporciona servicios de red de entrega de contenido, ciberseguridad en la nube, mitigación de DDoS y servicios de registro de dominios acreditados por ICANN.

>[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) le permite ejecutar modelos de aprendizaje automático, en la red `Cloudflare`, desde su código a través de la API REST.

>[Cloudflare AI document](https://developers.cloudflare.com/workers-ai/models/text-embeddings/) enumeró todos los modelos de incrustación de texto disponibles.

## Configuración

Se requieren tanto el ID de la cuenta de Cloudflare como el token de API. Encuentre cómo obtenerlos en [este documento](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).

```python
import getpass

my_account_id = getpass.getpass("Enter your Cloudflare account ID:\n\n")
my_api_token = getpass.getpass("Enter your Cloudflare API token:\n\n")
```

## Ejemplo

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
