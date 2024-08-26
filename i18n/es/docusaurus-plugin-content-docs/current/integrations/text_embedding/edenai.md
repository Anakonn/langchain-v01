---
translated: true
---

# EDEN AI

Eden AI está revolucionando el panorama de la IA al unir a los mejores proveedores de IA, capacitando a los usuarios para desbloquear posibilidades ilimitadas y aprovechar el verdadero potencial de la inteligencia artificial. Con una plataforma integral y sin complicaciones, permite a los usuarios implementar funciones de IA en producción de manera rápida, lo que facilita el acceso sin esfuerzo a toda la gama de capacidades de IA a través de una sola API. (sitio web: https://edenai.co/)

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de incrustación de Eden AI

-----------------------------------------------------------------------------------

Acceder a la API de EDENAI requiere una clave API,

que puedes obtener creando una cuenta https://app.edenai.run/user/register y dirigiéndote aquí https://app.edenai.run/admin/account/settings

Una vez que tengamos una clave, la estableceremos como una variable de entorno ejecutando:

```shell
export EDENAI_API_KEY="..."
```

Si prefieres no establecer una variable de entorno, puedes pasar la clave directamente a través del parámetro con nombre edenai_api_key

cuando se inicia la clase EdenAI embedding:

```python
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```

```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## Llamar a un modelo

La API de EdenAI reúne a varios proveedores.

Para acceder a un modelo específico, simplemente puedes usar el "proveedor" al llamar.

```python
embeddings = EdenAiEmbeddings(provider="openai")
```

```python
docs = ["It's raining right now", "cats are cute"]
document_result = embeddings.embed_documents(docs)
```

```python
query = "my umbrella is broken"
query_result = embeddings.embed_query(query)
```

```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```

```output
Cosine similarity between "It's raining right now" and query: 0.849261496107252
Cosine similarity between "cats are cute" and query: 0.7525900655705218
```
