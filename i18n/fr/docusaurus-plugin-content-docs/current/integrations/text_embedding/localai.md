---
translated: true
---

# LocalAI

Chargeons la classe LocalAI Embedding. Pour utiliser la classe LocalAI Embedding, vous devez avoir le service LocalAI hébergé quelque part et configurer les modèles d'intégration. Consultez la documentation sur https://localai.io/basics/getting_started/index.html et https://localai.io/features/embeddings/index.html.

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

Chargeons la classe LocalAI Embedding avec des modèles de première génération (par exemple text-search-ada-doc-001/text-search-ada-query-001). Remarque : ces modèles ne sont pas recommandés - voir [ici](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)

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
