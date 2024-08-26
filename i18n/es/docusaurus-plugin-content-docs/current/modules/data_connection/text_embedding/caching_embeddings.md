---
translated: true
---

# Caché

Las incrustaciones se pueden almacenar o cachear temporalmente para evitar la necesidad de recomputarlas.

El caching de incrustaciones puede hacerse usando un `CacheBackedEmbeddings`. El embedder respaldado por caché es un contenedor alrededor de un embedder que cachea
las incrustaciones en una tienda de clave-valor. El texto se hash y el hash se usa como la clave en la caché.

La forma principal de inicializar un `CacheBackedEmbeddings` es `from_bytes_store`. Toma los siguientes parámetros:

- underlying_embedder: El embedder a usar para incrustar.
- document_embedding_cache: Cualquier [`ByteStore`](/docs/integrations/stores/) para cachear incrustaciones de documentos.
- batch_size: (opcional, por defecto `None`) El número de documentos a incrustar entre actualizaciones de la tienda.
- namespace: (opcional, por defecto `""`) El espacio de nombres a usar para la caché de documentos. Este espacio de nombres se usa para evitar colisiones con otras cachés. Por ejemplo, configúralo con el nombre del modelo de incrustación utilizado.

**Atención**:

- Asegúrate de configurar el parámetro `namespace` para evitar colisiones del mismo texto incrustado usando diferentes modelos de incrustaciones.
- Actualmente `CacheBackedEmbeddings` no cachea incrustaciones creadas con los métodos `embed_query()` `aembed_query()`.

```python
from langchain.embeddings import CacheBackedEmbeddings
```

## Usando con una Tienda de Vectores

Primero, veamos un ejemplo que usa el sistema de archivos local para almacenar incrustaciones y usa la tienda de vectores FAISS para la recuperación.

```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```

```python
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

La caché está vacía antes de incrustar:

```python
list(store.yield_keys())
```

```output
[]
```

Carga el documento, divídelo en trozos, incrusta cada trozo y cárgalo en la tienda de vectores.

```python
raw_documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

Crea la tienda de vectores:

```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```

Si intentamos crear la tienda de vectores nuevamente, será mucho más rápido ya que no necesita recomputar ninguna incrustación.

```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```

Y aquí están algunas de las incrustaciones que se crearon:

```python
list(store.yield_keys())[:5]
```

```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```

# Cambiando el `ByteStore`

Para usar un `ByteStore` diferente, simplemente úsalo al crear tu `CacheBackedEmbeddings`. A continuación, creamos un objeto de incrustaciones en caché equivalente, excepto que usamos el `InMemoryByteStore` no persistente:

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
