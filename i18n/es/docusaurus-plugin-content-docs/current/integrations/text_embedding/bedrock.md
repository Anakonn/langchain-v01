---
translated: true
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) es un servicio totalmente administrado que ofrece una variedad de
> modelos de fundación (FMs) de alto rendimiento de empresas líderes en IA como `AI21 Labs`, `Anthropic`, `Cohere`,
> `Meta`, `Stability AI` y `Amazon` a través de una sola API, junto con un amplio conjunto de capacidades que necesitas para
> construir aplicaciones de IA generativa con seguridad, privacidad y IA responsable. Usando `Amazon Bedrock`,
> puedes experimentar y evaluar fácilmente los principales FMs para tu caso de uso, personalizarlos de forma privada con
> tus datos utilizando técnicas como el fine-tuning y la `Generación Aumentada por Recuperación` (`RAG`), y construir
> agentes que ejecuten tareas utilizando tus sistemas empresariales y fuentes de datos. Dado que `Amazon Bedrock` es
> sin servidor, no tienes que administrar ninguna infraestructura, y puedes integrar y implementar de forma segura
> las capacidades de IA generativa en tus aplicaciones utilizando los servicios de AWS con los que ya estás familiarizado.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    credentials_profile_name="bedrock-admin", region_name="us-east-1"
)
```

```python
embeddings.embed_query("This is a content of the document")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("This is a content of the document")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
