---
translated: true
---

# Tigris

> [Tigris](https://tigrisdata.com) es una base de datos NoSQL y una plataforma de búsqueda de vectores de código abierto diseñada para simplificar la construcción de aplicaciones de búsqueda de vectores de alto rendimiento.
> `Tigris` elimina la complejidad de la infraestructura de administrar, operar y sincronizar múltiples herramientas, lo que le permite concentrarse en construir grandes aplicaciones.

Este cuaderno le guía sobre cómo usar Tigris como su VectorStore

**Requisitos previos**
1. Una cuenta de OpenAI. Puede registrarse para obtener una cuenta [aquí](https://platform.openai.com/)
2. [Regístrese para obtener una cuenta gratuita de Tigris](https://console.preview.tigrisdata.cloud). Una vez que se haya registrado en la cuenta de Tigris, cree un nuevo proyecto llamado `vectordemo`. A continuación, anote el *Uri* de la región en la que ha creado su proyecto, el **clientId** y el **clientSecret**. Puede obtener toda esta información en la sección **Claves de aplicación** del proyecto.

Primero instalemos nuestras dependencias:

```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai tiktoken
```

Cargaremos la clave de la API de `OpenAI` y las credenciales de `Tigris` en nuestro entorno

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Inicializar el almacén de vectores Tigris

Importemos nuestro conjunto de datos de prueba:

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### Búsqueda de similitud

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### Búsqueda de similitud con puntuación (distancia vectorial)

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
