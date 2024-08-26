---
translated: true
---

# Motor SAP HANA Cloud

>[Motor SAP HANA Cloud](https://www.sap.com/events/teched/news-guide/ai.html#article8) es un almacén de vectores totalmente integrado en la base de datos `SAP HANA Cloud`.

## Configuración

Instalación del controlador de base de datos HANA.

```python
# Pip install necessary package
%pip install --upgrade --quiet  hdbcli
```

Para `OpenAIEmbeddings` utilizamos la clave de la API de OpenAI del entorno.

```python
import os
# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
```

Crea una conexión de base de datos a una instancia de HANA Cloud.

```python
from hdbcli import dbapi

# Use connection settings from the environment
connection = dbapi.connect(
    address=os.environ.get("HANA_DB_ADDRESS"),
    port=os.environ.get("HANA_DB_PORT"),
    user=os.environ.get("HANA_DB_USER"),
    password=os.environ.get("HANA_DB_PASSWORD"),
    autocommit=True,
    sslValidateCertificate=False,
)
```

## Ejemplo

Carga el documento de muestra "state_of_the_union.txt" y crea fragmentos a partir de él.

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hanavector import HanaDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
text_chunks = text_splitter.split_documents(text_documents)
print(f"Number of document chunks: {len(text_chunks)}")

embeddings = OpenAIEmbeddings()
```

Crea una interfaz de VectorStore de LangChain para la base de datos HANA y especifica la tabla (colección) que se utilizará para acceder a los vectores de incrustación.

```python
db = HanaDB(
    embedding=embeddings, connection=connection, table_name="STATE_OF_THE_UNION"
)
```

Agrega los fragmentos de documento cargados a la tabla. Para este ejemplo, eliminamos cualquier contenido anterior de la tabla que pueda existir de ejecuciones anteriores.

```python
# Delete already existing documents from the table
db.delete(filter={})

# add the loaded document chunks
db.add_documents(text_chunks)
```

Realiza una consulta para obtener los dos fragmentos de documento que mejor coincidan con los que se agregaron en el paso anterior.
De forma predeterminada, se utiliza la "similitud del coseno" para la búsqueda.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)

for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

Consulta el mismo contenido con "Distancia Euclidiana". Los resultados deben ser los mismos que con la "Similitud del Coseno".

```python
from langchain_community.vectorstores.utils import DistanceStrategy

db = HanaDB(
    embedding=embeddings,
    connection=connection,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
    table_name="STATE_OF_THE_UNION",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## Búsqueda de Relevancia Marginal Máxima (MMR)

`Relevancia marginal máxima` optimiza la similitud con la consulta Y la diversidad entre los documentos seleccionados. Se recuperarán los primeros 20 (fetch_k) elementos de la base de datos. El algoritmo MMR luego encontrará los 2 (k) mejores partidos.

```python
docs = db.max_marginal_relevance_search(query, k=2, fetch_k=20)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```

## Operaciones básicas de VectorStore

```python
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_BASIC"
)

# Delete already existing documents from the table
db.delete(filter={})
```

Podemos agregar documentos de texto simples a la tabla existente.

```python
docs = [Document(page_content="Some text"), Document(page_content="Other docs")]
db.add_documents(docs)
```

Agregar documentos con metadatos.

```python
docs = [
    Document(
        page_content="foo",
        metadata={"start": 100, "end": 150, "doc_name": "foo.txt", "quality": "bad"},
    ),
    Document(
        page_content="bar",
        metadata={"start": 200, "end": 250, "doc_name": "bar.txt", "quality": "good"},
    ),
]
db.add_documents(docs)
```

Consultar documentos con metadatos específicos.

```python
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
# With filtering on "quality"=="bad", only one document should be returned
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

Eliminar documentos con metadatos específicos.

```python
db.delete(filter={"quality": "bad"})

# Now the similarity search with the same filter will return no results
docs = db.similarity_search("foobar", k=2, filter={"quality": "bad"})
print(len(docs))
```

## Filtrado avanzado

Además de las capacidades de filtrado básicas basadas en valores, es posible utilizar un filtrado más avanzado.
La tabla a continuación muestra los operadores de filtro disponibles.

| Operador | Semántica                 |
|----------|-------------------------|
| `$eq`    | Igualdad (==)           |
| `$ne`    | Desigualdad (!=)         |
| `$lt`    | Menor que (<)           |
| `$lte`   | Menor o igual que (<=) |
| `$gt`    | Mayor que (>)        |
| `$gte`   | Mayor o igual que (>=) |
| `$in`    | Contenido en un conjunto de valores dados  (en)    |
| `$nin`   | No contenido en un conjunto de valores dados  (no en)  |
| `$between` | Entre el rango de dos valores límite |
| `$like`  | Igualdad de texto basada en la semántica "LIKE" en SQL (usando "%" como comodín)  |
| `$and`   | Lógica "y", compatible con 2 o más operandos |
| `$or`    | Lógica "o", compatible con 2 o más operandos |

```python
# Prepare some test documents
docs = [
    Document(
        page_content="First",
        metadata={"name": "adam", "is_active": True, "id": 1, "height": 10.0},
    ),
    Document(
        page_content="Second",
        metadata={"name": "bob", "is_active": False, "id": 2, "height": 5.7},
    ),
    Document(
        page_content="Third",
        metadata={"name": "jane", "is_active": True, "id": 3, "height": 2.4},
    ),
]

db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_ADVANCED_FILTER",
)

# Delete already existing documents from the table
db.delete(filter={})
db.add_documents(docs)


# Helper function for printing filter results
def print_filter_result(result):
    if len(result) == 0:
        print("<empty result>")
    for doc in result:
        print(doc.metadata)
```

Filtrado con `$ne`, `$gt`, `$gte`, `$lt`, `$lte`

```python
advanced_filter = {"id": {"$ne": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$gte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lt": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"id": {"$lte": 1}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrado con `$between`, `$in`, `$nin`

```python
advanced_filter = {"id": {"$between": (1, 2)}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$in": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$nin": ["adam", "bob"]}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrado de texto con `$like`

```python
advanced_filter = {"name": {"$like": "a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"name": {"$like": "%a%"}}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

Filtrado combinado con `$and`, `$or`

```python
advanced_filter = {"$or": [{"id": 1}, {"name": "bob"}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$and": [{"id": 1}, {"id": 2}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))

advanced_filter = {"$or": [{"id": 1}, {"id": 2}, {"id": 3}]}
print(f"Filter: {advanced_filter}")
print_filter_result(db.similarity_search("just testing", k=5, filter=advanced_filter))
```

## Usar un VectorStore como un recuperador en cadenas para la generación aumentada por recuperación (RAG)

```python
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

# Access the vector DB with a new table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_RETRIEVAL_CHAIN",
)

# Delete already existing entries from the table
db.delete(filter={})

# add the loaded document chunks from the "State Of The Union" file
db.add_documents(text_chunks)

# Create a retriever instance of the vector store
retriever = db.as_retriever()
```

Define el mensaje.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """
You are an expert in state of the union topics. You are provided multiple context items that are related to the prompt you have to answer.
Use the following pieces of context to answer the question at the end.

\```

{context}

\```

Question: {question}
"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
chain_type_kwargs = {"prompt": PROMPT}
```

Crea la ConversationalRetrievalChain, que maneja el historial de chat y la recuperación de fragmentos de documentos similares que se agregarán al mensaje.

```python
from langchain.chains import ConversationalRetrievalChain

llm = ChatOpenAI(model="gpt-3.5-turbo")
memory = ConversationBufferMemory(
    memory_key="chat_history", output_key="answer", return_messages=True
)
qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    db.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    memory=memory,
    verbose=False,
    combine_docs_chain_kwargs={"prompt": PROMPT},
)
```

Haz la primera pregunta (y verifica cuántos fragmentos de texto se han utilizado).

```python
question = "What about Mexico and Guatemala?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])

source_docs = result["source_documents"]
print("================")
print(f"Number of used source document chunks: {len(source_docs)}")
```

Examina los fragmentos utilizados de la cadena en detalle. Comprueba si el fragmento mejor clasificado contiene información sobre "México y Guatemala" como se menciona en la pregunta.

```python
for doc in source_docs:
    print("-" * 80)
    print(doc.page_content)
    print(doc.metadata)
```

Haz otra pregunta en la misma cadena conversacional. La respuesta debe estar relacionada con la respuesta anterior dada.

```python
question = "What about other countries?"

result = qa_chain.invoke({"question": question})
print("Answer from LLM:")
print("================")
print(result["answer"])
```

## Tablas estándar vs. tablas "personalizadas" con datos vectoriales

Como comportamiento predeterminado, la tabla para los incrustaciones se crea con 3 columnas:

- Una columna `VEC_TEXT`, que contiene el texto del Documento
- Una columna `VEC_META`, que contiene los metadatos del Documento
- Una columna `VEC_VECTOR`, que contiene el vector de incrustaciones del texto del Documento

```python
# Access the vector DB with a new table
db = HanaDB(
    connection=connection, embedding=embeddings, table_name="LANGCHAIN_DEMO_NEW_TABLE"
)

# Delete already existing entries from the table
db.delete(filter={})

# Add a simple document with some metadata
docs = [
    Document(
        page_content="A simple document",
        metadata={"start": 100, "end": 150, "doc_name": "simple.txt"},
    )
]
db.add_documents(docs)
```

Muestra las columnas en la tabla "LANGCHAIN_DEMO_NEW_TABLE"

```python
cur = connection.cursor()
cur.execute(
    "SELECT COLUMN_NAME, DATA_TYPE_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = 'LANGCHAIN_DEMO_NEW_TABLE'"
)
rows = cur.fetchall()
for row in rows:
    print(row)
cur.close()
```

Muestra el valor del documento insertado en las tres columnas

```python
cur = connection.cursor()
cur.execute(
    "SELECT VEC_TEXT, VEC_META, TO_NVARCHAR(VEC_VECTOR) FROM LANGCHAIN_DEMO_NEW_TABLE LIMIT 1"
)
rows = cur.fetchall()
print(rows[0][0])  # The text
print(rows[0][1])  # The metadata
print(rows[0][2])  # The vector
cur.close()
```

Las tablas personalizadas deben tener al menos tres columnas que coincidan con la semántica de una tabla estándar

- Una columna con tipo `NCLOB` o `NVARCHAR` para el texto/contexto de las incrustaciones
- Una columna con tipo `NCLOB` o `NVARCHAR` para los metadatos
- Una columna con tipo `REAL_VECTOR` para el vector de incrustación

La tabla puede contener columnas adicionales. Cuando se insertan nuevos Documentos en la tabla, estas columnas adicionales deben permitir valores NULL.

```python
# Create a new table "MY_OWN_TABLE" with three "standard" columns and one additional column
my_own_table_name = "MY_OWN_TABLE"
cur = connection.cursor()
cur.execute(
    (
        f"CREATE TABLE {my_own_table_name} ("
        "SOME_OTHER_COLUMN NVARCHAR(42), "
        "MY_TEXT NVARCHAR(2048), "
        "MY_METADATA NVARCHAR(1024), "
        "MY_VECTOR REAL_VECTOR )"
    )
)

# Create a HanaDB instance with the own table
db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name=my_own_table_name,
    content_column="MY_TEXT",
    metadata_column="MY_METADATA",
    vector_column="MY_VECTOR",
)

# Add a simple document with some metadata
docs = [
    Document(
        page_content="Some other text",
        metadata={"start": 400, "end": 450, "doc_name": "other.txt"},
    )
]
db.add_documents(docs)

# Check if data has been inserted into our own table
cur.execute(f"SELECT * FROM {my_own_table_name} LIMIT 1")
rows = cur.fetchall()
print(rows[0][0])  # Value of column "SOME_OTHER_DATA". Should be NULL/None
print(rows[0][1])  # The text
print(rows[0][2])  # The metadata
print(rows[0][3])  # The vector

cur.close()
```

Agrega otro documento y realiza una búsqueda de similitud en la tabla personalizada.

```python
docs = [
    Document(
        page_content="Some more text",
        metadata={"start": 800, "end": 950, "doc_name": "more.txt"},
    )
]
db.add_documents(docs)

query = "What's up?"
docs = db.similarity_search(query, k=2)
for doc in docs:
    print("-" * 80)
    print(doc.page_content)
```
