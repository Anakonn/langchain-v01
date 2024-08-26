---
translated: true
---

# Typesense

> [Typesense](https://typesense.org) es un motor de búsqueda de código abierto y en memoria, que puedes [autoalojar](https://typesense.org/docs/guide/install-typesense#option-2-local-machine-self-hosting) o ejecutar en [Typesense Cloud](https://cloud.typesense.org/).
>
> Typesense se centra en el rendimiento al almacenar todo el índice en la RAM (con una copia de seguridad en disco) y también se centra en proporcionar una experiencia de desarrollador lista para usar al simplificar las opciones disponibles y establecer buenos valores predeterminados.
>
> También te permite combinar el filtrado basado en atributos con consultas vectoriales, para recuperar los documentos más relevantes.

Este cuaderno te muestra cómo usar Typesense como tu VectorStore.

Primero instalemos nuestras dependencias:

```python
%pip install --upgrade --quiet  typesense openapi-schema-pydantic langchain-openai tiktoken
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Importemos nuestro conjunto de datos de prueba:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
docsearch = Typesense.from_documents(
    docs,
    embeddings,
    typesense_client_params={
        "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
        "port": "8108",  # Use 443 for Typesense Cloud
        "protocol": "http",  # Use https for Typesense Cloud
        "typesense_api_key": "xyz",
        "typesense_collection_name": "lang-chain",
    },
)
```

## Búsqueda de similitud

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = docsearch.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

## Typesense como un Retriever

Typesense, al igual que todos los otros almacenes de vectores, es un Retriever de LangChain, utilizando la similitud del coseno.

```python
retriever = docsearch.as_retriever()
retriever
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```
