---
translated: true
---

# Faiss (Asíncrono)

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) es una biblioteca para búsqueda de similitud eficiente y agrupación de vectores densos. Contiene algoritmos que buscan en conjuntos de vectores de cualquier tamaño, incluso en aquellos que posiblemente no entren en la RAM. También contiene código de soporte para evaluación y ajuste de parámetros.

[Documentación de Faiss](https://faiss.ai/).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `FAISS` utilizando `asyncio`.
LangChain implementó las funciones de almacén de vectores síncronas y asíncronas.

Consulta la versión `síncrona` [aquí](/docs/integrations/vectorstores/faiss).

```python
%pip install --upgrade --quiet  faiss-gpu # For CUDA 7.5+ Supported GPU's.
# OR
%pip install --upgrade --quiet  faiss-cpu # For CPU Installation
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = await FAISS.afrom_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)

print(docs[0].page_content)
```

## Búsqueda de similitud con puntuación

Hay algunos métodos específicos de FAISS. Uno de ellos es `similarity_search_with_score`, que le permite devolver no solo los documentos, sino también la puntuación de distancia de la consulta a ellos. La puntuación de distancia devuelta es la distancia L2. Por lo tanto, una puntuación más baja es mejor.

```python
docs_and_scores = await db.asimilarity_search_with_score(query)

docs_and_scores[0]
```

También es posible realizar una búsqueda de documentos similares a un vector de incrustación dado utilizando `similarity_search_by_vector`, que acepta un vector de incrustación como parámetro en lugar de una cadena.

```python
embedding_vector = await embeddings.aembed_query(query)
docs_and_scores = await db.asimilarity_search_by_vector(embedding_vector)
```

## Guardar y cargar

También puede guardar y cargar un índice FAISS. Esto es útil para no tener que recrearlo cada vez que lo use.

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings, asynchronous=True)

docs = await new_db.asimilarity_search(query)

docs[0]
```

# Serializar y deserializar a bytes

Puede serializar el índice FAISS mediante estas funciones. Si usa un modelo de incrustaciones que es de 90 mb (sentence-transformers/all-MiniLM-L6-v2 o cualquier otro modelo), el tamaño resultante del pickle sería de más de 90 mb. El tamaño del modelo también se incluye en el tamaño general. Para superar esto, use las siguientes funciones. Estas funciones solo serializan el índice FAISS y el tamaño sería mucho menor. Esto puede ser útil si desea almacenar el índice en una base de datos como SQL.

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl, asynchronous=True
)  # Load the index
```

## Fusionar

También puede fusionar dos almacenes de vectores FAISS

```python
db1 = await FAISS.afrom_texts(["foo"], embeddings)
db2 = await FAISS.afrom_texts(["bar"], embeddings)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo')}
```

```python
db2.docstore._dict
```

```output
{'4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo'),
 '4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

## Búsqueda de similitud con filtrado

El almacén de vectores FAISS también puede admitir filtrado, ya que FAISS no admite nativamente el filtrado, tenemos que hacerlo manualmente. Esto se hace primero obteniendo más resultados de los que se necesitan `k` y luego filtrándolos. Puede filtrar los documentos en función de los metadatos. También puede establecer el parámetro `fetch_k` al llamar a cualquier método de búsqueda para establecer cuántos documentos desea obtener antes del filtrado. Aquí hay un pequeño ejemplo:

```python
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```

Ahora hacemos la misma llamada de consulta, pero filtramos solo para `page = 1`

```python
results_with_scores = await db.asimilarity_search_with_score("foo", filter=dict(page=1))
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

Lo mismo se puede hacer con el `max_marginal_relevance_search` también.

```python
results = await db.amax_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

Aquí hay un ejemplo de cómo establecer el parámetro `fetch_k` al llamar a `similarity_search`. Por lo general, desearía que el parámetro `fetch_k` fuera >> parámetro `k`. Esto se debe a que el parámetro `fetch_k` es la cantidad de documentos que se obtendrán antes del filtrado. Si establece `fetch_k` en un número bajo, es posible que no obtenga suficientes documentos para filtrar.

```python
results = await db.asimilarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## Eliminar

También puede eliminar ids. Tenga en cuenta que los ids a eliminar deben ser los ids en el docstore.

```python
db.delete([db.index_to_docstore_id[0]])
```

```output
True
```

```python
# Is now missing
0 in db.index_to_docstore_id
```

```output
False
```
