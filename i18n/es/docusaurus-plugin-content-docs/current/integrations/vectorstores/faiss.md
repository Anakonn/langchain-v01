---
translated: true
---

# Faiss

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) es una biblioteca para búsqueda de similitud eficiente y agrupación de vectores densos. Contiene algoritmos que buscan en conjuntos de vectores de cualquier tamaño, incluso en aquellos que posiblemente no entren en la RAM. También contiene código de soporte para evaluación y ajuste de parámetros.

[Documentación de Faiss](https://faiss.ai/).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `FAISS`. Mostrará la funcionalidad específica de esta integración. Después de recorrerlo, puede ser útil explorar [páginas de casos de uso relevantes](/docs/use_cases/question_answering) para aprender cómo usar este almacén de vectores como parte de una cadena más grande.

## Configuración

La integración se encuentra en el paquete `langchain-community`. También necesitamos instalar el paquete `faiss` en sí. También estaremos usando OpenAI para incrustaciones, por lo que necesitamos instalar esos requisitos. Podemos instalarlos con:

```bash
pip install -U langchain-community faiss-cpu langchain-openai tiktoken
```

Tenga en cuenta que también puede instalar `faiss-gpu` si desea usar la versión habilitada para GPU.

Dado que estamos usando OpenAI, necesitará una clave de API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Ingesta

Aquí, ingresamos documentos en el almacén de vectores.

```python
# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
print(db.index.ntotal)
```

```output
42
```

## Consulta

Ahora, podemos consultar el almacén de vectores. Hay varios métodos para hacer esto. El más estándar es usar `similarity_search`.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Como un Recuperador

También podemos convertir el almacén de vectores en una clase [Recuperador](/docs/modules/data_connection/retrievers). Esto nos permite usarlo fácilmente en otros métodos de LangChain, que en gran medida funcionan con recuperadores.

```python
retriever = db.as_retriever()
docs = retriever.invoke(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Búsqueda de similitud con puntuación

Hay algunos métodos específicos de FAISS. Uno de ellos es `similarity_search_with_score`, que le permite devolver no solo los documentos, sino también la puntuación de distancia de la consulta a ellos. La puntuación de distancia devuelta es la distancia L2. Por lo tanto, una puntuación más baja es mejor.

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.36913747)
```

También es posible realizar una búsqueda de documentos similares a un vector de incrustación dado usando `similarity_search_by_vector`, que acepta un vector de incrustación como parámetro en lugar de una cadena.

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = db.similarity_search_by_vector(embedding_vector)
```

## Guardar y cargar

También puede guardar y cargar un índice FAISS. Esto es útil para que no tenga que recrearlo cada vez que lo use.

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings)

docs = new_db.similarity_search(query)
```

```python
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

# Serialización y deserialización a bytes

Puede serializar el índice FAISS con estas funciones. Si usa un modelo de incrustaciones que es de 90 mb (sentence-transformers/all-MiniLM-L6-v2 o cualquier otro modelo), el tamaño resultante del pickle sería de más de 90 mb. El tamaño del modelo también se incluye en el tamaño general. Para superar esto, use las siguientes funciones. Estas funciones solo serializan el índice FAISS y el tamaño sería mucho menor. Esto puede ser útil si desea almacenar el índice en una base de datos como SQL.

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl
)  # Load the index
```

## Fusión

También puede fusionar dos almacenes de vectores FAISS.

```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```

```python
db2.docstore._dict
```

```output
{'807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'068c473b-d420-487a-806b-fb0ccea7f711': Document(page_content='foo', metadata={}),
 '807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

## Búsqueda de similitud con filtrado

El almacén de vectores FAISS también puede admitir filtrado, ya que FAISS no admite nativamente el filtrado, tenemos que hacerlo manualmente. Esto se hace primero obteniendo más resultados que `k` y luego filtrándolos. Este filtro es ya sea una función que toma como entrada un diccionario de metadatos y devuelve un booleano, o un diccionario de metadatos donde se ignora cada clave faltante y cada clave presente debe estar en una lista de valores. También puede establecer el parámetro `fetch_k` al llamar a cualquier método de búsqueda para establecer cuántos documentos desea obtener antes de filtrar. Aquí hay un pequeño ejemplo:

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

Ahora hacemos la misma llamada de consulta, pero filtramos solo para `page = 1`.

```python
results_with_scores = db.similarity_search_with_score("foo", filter=dict(page=1))
# Or with a callable:
# results_with_scores = db.similarity_search_with_score("foo", filter=lambda d: d["page"] == 1)
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

Lo mismo se puede hacer con la `max_marginal_relevance_search` también.

```python
results = db.max_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

Aquí hay un ejemplo de cómo establecer el parámetro `fetch_k` al llamar a `similarity_search`. Por lo general, desearía que el parámetro `fetch_k` >> parámetro `k`. Esto se debe a que el parámetro `fetch_k` es el número de documentos que se recuperarán antes del filtrado. Si establece `fetch_k` en un número bajo, es posible que no obtenga suficientes documentos para filtrar.

```python
results = db.similarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## Eliminar

También puede eliminar registros del almacén de vectores. En el ejemplo a continuación, `db.index_to_docstore_id` representa un diccionario con elementos del índice FAISS.

```python
print("count before:", db.index.ntotal)
db.delete([db.index_to_docstore_id[0]])
print("count after:", db.index.ntotal)
```

```output
count before: 8
count after: 7
```
