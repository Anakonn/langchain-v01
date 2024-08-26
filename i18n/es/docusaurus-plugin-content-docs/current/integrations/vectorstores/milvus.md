---
translated: true
---

# Milvus

>[Milvus](https://milvus.io/docs/overview.md) es una base de datos que almacena, indexa y gestiona enormes vectores de incrustación generados por redes neuronales profundas y otros modelos de aprendizaje automático (ML).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores Milvus.

Para ejecutar, debe tener una [instancia de Milvus en ejecución](https://milvus.io/docs/install_standalone-docker.md).

```python
%pip install --upgrade --quiet  pymilvus
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

### Compartimentar los datos con las colecciones de Milvus

Puede almacenar diferentes documentos no relacionados en diferentes colecciones dentro de la misma instancia de Milvus para mantener el contexto.

Así es como puede crear una nueva colección.

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    collection_name="collection_1",
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

Y así es como recupera esa colección almacenada.

```python
vector_db = Milvus(
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    collection_name="collection_1",
)
```

Después de la recuperación, puede continuar consultándola como de costumbre.

### Recuperación por usuario

Al construir una aplicación de recuperación, a menudo tienes que construirla con varios usuarios en mente. Esto significa que es posible que esté almacenando datos no solo para un usuario, sino para muchos usuarios diferentes, y no deben poder ver los datos de los demás.

Milvus recomienda usar [partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy) para implementar multitenencia, aquí hay un ejemplo.

```python
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

Para realizar una búsqueda utilizando la clave de partición, debe incluir cualquiera de los siguientes en la expresión booleana de la solicitud de búsqueda:

`search_kwargs={"expr": '<partition_key> == "xxxx"'}`

`search_kwargs={"expr": '<partition_key> == in ["xxx", "xxx"]'}`

Reemplace `<partition_key>` por el nombre del campo que se designa como la clave de partición.

Milvus cambia a una partición en función de la clave de partición especificada, filtra las entidades de acuerdo con la clave de partición y busca entre las entidades filtradas.

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "ankush"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```

**Para eliminar o actualizar (actualizar/insertar) una o más entidades:**

```python
from langchain_community.docstore.document import Document

# Insert data sample
docs = [
    Document(page_content="foo", metadata={"id": 1}),
    Document(page_content="bar", metadata={"id": 2}),
    Document(page_content="baz", metadata={"id": 3}),
]
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)

# Search pks (primary keys) using expression
expr = "id in [1,2]"
pks = vector_db.get_pks(expr)

# Delete entities by pks
result = vector_db.delete(pks)

# Upsert (Update/Insert)
new_docs = [
    Document(page_content="new_foo", metadata={"id": 1}),
    Document(page_content="new_bar", metadata={"id": 2}),
    Document(page_content="upserted_bak", metadata={"id": 3}),
]
upserted_pks = vector_db.upsert(pks, new_docs)
```
