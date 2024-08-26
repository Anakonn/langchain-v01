---
translated: true
---

# LocalAI

Vamos a cargar la clase LocalAI Embedding. Para usar la clase LocalAI Embedding, necesitas tener el servicio LocalAI alojado en algún lugar y configurar los modelos de incrustación. Consulta la documentación en https://localai.io/basics/getting_started/index.html y https://localai.io/features/embeddings/index.html.

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

Vamos a cargar la clase LocalAI Embedding con modelos de primera generación (por ejemplo, text-search-ada-doc-001/text-search-ada-query-001). Nota: estos no son los modelos recomendados, consulta [aquí](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
import os

# if you are behind an explicit proxy, you can use the OPENAI_PROXY environment variable to pass through
os.environ["OPENAI_PROXY"] = "http://proxy.yourcompany.com:8080"
```
