---
translated: true
---

# viking DB

>[viking DB](https://www.volcengine.com/docs/6459/1163946) es una base de datos que almacena, indexa y gestiona enormes vectores de incrustación generados por redes neuronales profundas y otros modelos de aprendizaje automático (ML).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores VikingDB.

Para ejecutar, debe tener una [instancia de viking DB en ejecución](https://www.volcengine.com/docs/6459/1165058).

```python
!pip install --upgrade volcengine
```

Queremos usar VikingDBEmbeddings, así que tenemos que obtener la clave API de VikingDB.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
docs[0].page_content
```

### Compartimentar los datos con las colecciones de viking DB

Puede almacenar diferentes documentos no relacionados en diferentes colecciones dentro de la misma instancia de viking DB para mantener el contexto.

Así es como puede crear una nueva colección.

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

Y así es como puede recuperar esa colección almacenada.

```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

Después de la recuperación, puede continuar consultándola como de costumbre.
