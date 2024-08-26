---
translated: true
---

# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb) de [SemaFind](https://www.semafind.com) es una base de datos de similitud vectorial sin complicaciones para construir aplicaciones de IA. El `SemaDB Cloud` alojado ofrece una experiencia de desarrollador sin complicaciones para comenzar.

La documentación completa de la API junto con ejemplos y un patio de recreo interactivo está disponible en [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb).

Este cuaderno demuestra el uso del almacén de vectores `SemaDB Cloud`.

## Cargar incrustaciones de documentos

Para ejecutar las cosas localmente, estamos usando [Sentence Transformers](https://www.sbert.net/) que se usan comúnmente para incrustar oraciones. Puede usar cualquier modelo de incrustación que ofrezca LangChain.

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```

```output
114
```

## Conectarse a SemaDB

SemaDB Cloud usa [claves de RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb) para autenticarse. Puede obtener las suyas creando una cuenta gratuita de RapidAPI.

```python
import getpass
import os

os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```

```output
SemaDB API Key: ········
```

```python
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

Los parámetros del almacén de vectores SemaDB reflejan la API directamente:

- "mycollection": es el nombre de la colección en la que almacenaremos estos vectores.
- 768: son las dimensiones de los vectores. En nuestro caso, las incrustaciones del transformador de oraciones producen vectores de 768 dimensiones.
- API_KEY: es su clave de RapidAPI.
- embeddings: corresponden a cómo se generarán las incrustaciones de documentos, textos y consultas.
- DistanceStrategy: es la métrica de distancia utilizada. El wrapper normaliza automáticamente los vectores si se usa COSINE.

```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```

```output
True
```

El wrapper del almacén de vectores SemaDB agrega el texto del documento como metadatos de punto para recopilar más tarde. Almacenar grandes fragmentos de texto *no se recomienda*. Si está indexando una gran colección, le recomendamos almacenar referencias a los documentos, como identificadores externos.

```python
db.add_documents(docs)[:2]
```

```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```

## Búsqueda de similitud

Usamos la interfaz de búsqueda de similitud predeterminada de LangChain para buscar las oraciones más similares.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```

## Limpiar

Puede eliminar la colección para eliminar todos los datos.

```python
db.delete_collection()
```

```output
True
```
