---
sidebar_label: Upstage
translated: true
---

# UpstageEmbeddings

Este cuaderno cubre cómo comenzar con los modelos de incrustación de Upstage.

## Instalación

Instala el paquete `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuración del entorno

Asegúrate de establecer las siguientes variables de entorno:

- `UPSTAGE_API_KEY`: Tu clave API de Upstage desde la [consola de Upstage](https://console.upstage.ai/).

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## Uso

Inicializa la clase `UpstageEmbeddings`.

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
```

Usa `embed_documents` para incrustar una lista de textos o documentos.

```python
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)
```

Usa `embed_query` para incrustar una cadena de consulta.

```python
query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

Usa `aembed_documents` y `aembed_query` para operaciones asincrónicas.

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```

## Uso con el almacén de vectores

Puedes usar `UpstageEmbeddings` con el componente de almacén de vectores. El siguiente ejemplo muestra un ejemplo sencillo.

```python
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```
