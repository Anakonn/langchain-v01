---
translated: true
---

# Indexación

Aquí, veremos un flujo de trabajo de indexación básico utilizando la API de indexación de LangChain.

La API de indexación le permite cargar y mantener sincronizados los documentos de cualquier fuente en un almacén de vectores. Específicamente, ayuda a:

* Evitar escribir contenido duplicado en el almacén de vectores
* Evitar volver a escribir el contenido sin cambios
* Evitar volver a calcular los incrustaciones sobre el contenido sin cambios

Todo lo cual debería ahorrarle tiempo y dinero, así como mejorar los resultados de su búsqueda vectorial.

Crucialmente, la API de indexación funcionará incluso con documentos que han pasado por varios pasos de transformación (por ejemplo, a través del fragmentación de texto) con respecto a los documentos fuente originales.

## Cómo funciona

La indexación de LangChain hace uso de un administrador de registros (`RecordManager`) que realiza un seguimiento de las escrituras de documentos en el almacén de vectores.

Al indexar el contenido, se calculan hashes para cada documento y se almacena la siguiente información en el administrador de registros:

- el hash del documento (hash del contenido de la página y los metadatos)
- hora de escritura
- el id de origen: cada documento debe incluir información en sus metadatos para permitirnos determinar la fuente final de este documento

## Modos de eliminación

Al indexar documentos en un almacén de vectores, es posible que algunos documentos existentes en el almacén de vectores deban eliminarse. En ciertas situaciones, es posible que desee eliminar cualquier documento existente que se derive de las mismas fuentes que los nuevos documentos que se están indexando. En otros, es posible que desee eliminar todos los documentos existentes por completo. Los modos de eliminación de la API de indexación le permiten elegir el comportamiento que desea:

| Modo de limpieza | Desduplicar contenido | Paralelizable | Limpia los documentos de origen eliminados | Limpia las mutaciones de los documentos de origen y/o los documentos derivados | Momento de la limpieza |
|-----------------|----------------------|---------------|-------------------------------------------|-------------------------------------------------------------------------|------------------------|
| Ninguno          | ✅                   | ✅            | ❌                                        | ❌                                                                     | -                      |
| Incremental      | ✅                   | ✅            | ❌                                        | ✅                                                                     | Continuamente           |
| Completo         | ✅                   | ❌            | ✅                                        | ✅                                                                     | Al final de la indexación|

`Ninguno` no realiza ninguna limpieza automática, lo que permite al usuario realizar manualmente la limpieza del contenido antiguo.

`incremental` y `completo` ofrecen la siguiente limpieza automatizada:

* Si el contenido del documento fuente o los documentos derivados ha **cambiado**, los modos `incremental` o `completo` limpiarán (eliminarán) las versiones anteriores del contenido.
* Si el documento fuente se ha **eliminado** (lo que significa que no se incluye en los documentos que se están indexando actualmente), el modo de limpieza `completo` lo eliminará correctamente del almacén de vectores, pero el modo `incremental` no lo hará.

Cuando el contenido se muta (por ejemplo, el archivo PDF de origen se revisó), habrá un período de tiempo durante la indexación en el que se pueden devolver al usuario tanto la nueva como la antigua versión. Esto ocurre después de que se haya escrito el nuevo contenido, pero antes de que se haya eliminado la versión antigua.

* La indexación `incremental` minimiza este período de tiempo, ya que puede realizar la limpieza de forma continua a medida que escribe.
* El modo `completo` realiza la limpieza después de que se hayan escrito todos los lotes.

## Requisitos

1. No lo use con un almacén que se haya pre-poblado con contenido de forma independiente a la API de indexación, ya que el administrador de registros no sabrá que se han insertado registros previamente.
2. Solo funciona con los `vectorstore` de LangChain que admiten:
   * adición de documentos por id (`add_documents` método con argumento `ids`)
   * eliminación por id (`delete` método con argumento `ids`)

Vectorstores compatibles: `AnalyticDB`, `AstraDB`, `AzureCosmosDBVectorSearch`, `AzureSearch`, `AwaDB`, `Bagel`, `Cassandra`, `Chroma`, `CouchbaseVectorStore`, `DashVector`, `DatabricksVectorSearch`, `DeepLake`, `Dingo`, `ElasticVectorSearch`, `ElasticsearchStore`, `FAISS`, `HanaDB`, `LanceDB`, `Milvus`, `MyScale`, `OpenSearchVectorSearch`, `PGVector`, `Pinecone`, `Qdrant`, `Redis`, `Rockset`, `ScaNN`, `SupabaseVectorStore`, `SurrealDBStore`, `TimescaleVector`, `UpstashVectorStore`, `Vald`, `VDMS`, `Vearch`, `VespaStore`, `Weaviate`, `ZepVectorStore`, `TencentVectorDB`, `OpenSearchVectorSearch`, `Yellowbrick`.

## Precaución

El administrador de registros se basa en un mecanismo basado en el tiempo para determinar qué contenido se puede limpiar (cuando se utilizan los modos de limpieza `completo` o `incremental`).

Si se ejecutan dos tareas una detrás de otra, y la primera tarea termina antes de que cambie el tiempo del reloj, entonces es posible que la segunda tarea no pueda limpiar el contenido.

Es poco probable que esto sea un problema en entornos reales por las siguientes razones:

1. El RecordManager utiliza marcas de tiempo de mayor resolución.
2. Los datos tendrían que cambiar entre la ejecución de la primera y la segunda tarea, lo que se vuelve poco probable si el intervalo de tiempo entre las tareas es pequeño.
3. Las tareas de indexación suelen tardar más de unos pocos milisegundos.

## Inicio rápido

```python
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

Inicializa un almacén de vectores y configura los incrustaciones:

```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

Inicializa un administrador de registros con un espacio de nombres apropiado.

**Sugerencia:** Usa un espacio de nombres que tenga en cuenta tanto el almacén de vectores como el nombre de la colección en el almacén de vectores; por ejemplo, 'redis/my_docs', 'chromadb/my_docs' o 'postgres/my_docs'.

```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

Crea un esquema antes de usar el administrador de registros.

```python
record_manager.create_schema()
```

Vamos a indexar algunos documentos de prueba:

```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

Indexación en un almacén de vectores vacío:

```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### Modo de eliminación ``None``

Este modo no realiza una limpieza automática de las versiones antiguas del contenido; sin embargo, aún se encarga de la deduplicación de contenido.

```python
_clear()
```

```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
_clear()
```

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

La segunda vez, todo el contenido se omitirá:

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

### Modo de eliminación ``"incremental"``

```python
_clear()
```

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

La indexación nuevamente debería dar como resultado que ambos documentos se **omitan** - ¡también omitiendo la operación de incrustación!

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

Si no proporcionamos documentos con el modo de indexación incremental, no se producirá ningún cambio.

```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

Si mutamos un documento, se escribirá la nueva versión y se eliminarán todas las versiones antiguas que compartan la misma fuente.

```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```

```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```

### Modo de eliminación ``"full"``

En el modo `full`, el usuario debe pasar el `full` universo de contenido que debe indexarse en la función de indexación.

¡Cualquier documento que no se pase a la función de indexación y esté presente en el almacén de vectores se eliminará!

Este comportamiento es útil para manejar eliminaciones de documentos fuente.

```python
_clear()
```

```python
all_docs = [doc1, doc2]
```

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

Digamos que alguien eliminó el primer documento:

```python
del all_docs[0]
```

```python
all_docs
```

```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```

Usar el modo full limpiará el contenido eliminado también.

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```

## Fuente

El atributo de metadatos contiene un campo llamado `source`. Esta fuente debe apuntar a la *última* procedencia asociada con el documento dado.

Por ejemplo, si estos documentos representan fragmentos de algún documento principal, el `source` de ambos documentos debe ser el mismo y hacer referencia al documento principal.

En general, siempre se debe especificar `source`. Usa un `None` solo si **nunca** tienes la intención de usar el modo `incremental` y, por alguna razón, no puedes especificar correctamente el campo `source`.

```python
from langchain_text_splitters import CharacterTextSplitter
```

```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```

```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```

```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```

```python
_clear()
```

```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

Esto debería eliminar las versiones antiguas de los documentos asociados con la fuente `doggy.txt` y reemplazarlas por las nuevas versiones.

```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```

## Usar con cargadores

La indexación puede aceptar tanto un iterable de documentos como cualquier cargador.

**Atención:** El cargador **debe** establecer correctamente las claves de origen.

```python
from langchain_community.document_loaders.base import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```

```python
_clear()
```

```python
loader = MyCustomLoader()
```

```python
loader.load()
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```
