---
traducido: falso
translated: true
---

# FastEmbed por Qdrant

>[FastEmbed](https://qdrant.github.io/fastembed/) de [Qdrant](https://qdrant.tech) es una biblioteca de Python ligera, rápida, construida para la generación de incrustaciones.
>
>- Pesos del modelo cuantificados
>- ONNX Runtime, sin dependencia de PyTorch
>- Diseño centrado en CPU
>- Paralelismo de datos para la codificación de grandes conjuntos de datos.

## Dependencias

Para usar FastEmbed con LangChain, instala el paquete de Python `fastembed`.

```python
%pip install --upgrade --quiet  fastembed
```

## Importaciones

```python
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
```

## Instanciando FastEmbed

### Parámetros

- `model_name: str` (predeterminado: "BAAI/bge-small-en-v1.5")
    > Nombre del modelo FastEmbedding a utilizar. Puedes encontrar la lista de modelos compatibles [aquí](https://qdrant.github.io/fastembed/examples/Supported_Models/).

- `max_length: int` (predeterminado: 512)
    > El número máximo de tokens. Comportamiento desconocido para valores > 512.

- `cache_dir: Optional[str]`
    > La ruta al directorio de caché. Predeterminado a `local_cache` en el directorio padre.

- `threads: Optional[int]`
    > El número de hilos que una sola sesión de onnxruntime puede usar. Predeterminado a None.

- `doc_embed_type: Literal["default", "passage"]` (predeterminado: "default")
    > "default": Usa el método de incrustación predeterminado de FastEmbed.

    > "passage": Prefija el texto con "passage" antes de incrustar.

```python
embeddings = FastEmbedEmbeddings()
```

## Uso

### Generando incrustaciones de documentos

```python
document_embeddings = embeddings.embed_documents(
    ["This is a document", "This is some other document"]
)
```

### Generando incrustaciones de consultas

```python
query_embeddings = embeddings.embed_query("This is a query")
```
