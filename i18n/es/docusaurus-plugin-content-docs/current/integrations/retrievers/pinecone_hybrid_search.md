---
translated: true
---

# Búsqueda híbrida de Pinecone

>[Pinecone](https://docs.pinecone.io/docs/overview) es una base de datos de vectores con una amplia funcionalidad.

Este cuaderno explica cómo usar un buscador que usa Pinecone y Búsqueda Híbrida.

La lógica de este buscador se toma de [esta documentación](https://docs.pinecone.io/docs/hybrid-search)

Para usar Pinecone, debes tener una clave API y un Entorno.
Aquí están las [instrucciones de instalación](https://docs.pinecone.io/docs/quickstart).

```python
%pip install --upgrade --quiet  pinecone-client pinecone-text
```

```python
import getpass
import os

os.environ["PINECONE_API_KEY"] = getpass.getpass("Pinecone API Key:")
```

```python
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

```python
os.environ["PINECONE_ENVIRONMENT"] = getpass.getpass("Pinecone Environment:")
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Configurar Pinecone

Solo deberías tener que hacer esta parte una vez.

Nota: es importante asegurarse de que el campo "context" que contiene el texto del documento en los metadatos no esté indexado. Actualmente necesitas especificar explícitamente los campos que deseas indexar. Para más información, consulta la [documentación](https://docs.pinecone.io/docs/manage-indexes#selective-metadata-indexing) de Pinecone.

```python
import os

import pinecone

api_key = os.getenv("PINECONE_API_KEY") or "PINECONE_API_KEY"

index_name = "langchain-pinecone-hybrid-search"
```

```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```

```python
# create the index
pinecone.create_index(
    name=index_name,
    dimension=1536,  # dimensionality of dense model
    metric="dotproduct",  # sparse values supported only for dotproduct
    pod_type="s1",
    metadata_config={"indexed": []},  # see explanation above
)
```

Ahora que se ha creado, podemos usarlo

```python
index = pinecone.Index(index_name)
```

## Obtener incrustaciones y codificadores dispersos

Las incrustaciones se utilizan para los vectores densos, el tokenizador se utiliza para el vector disperso

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

Para codificar el texto en valores dispersos, puedes elegir SPLADE o BM25. Para tareas fuera de dominio, recomendamos usar BM25.

Para obtener más información sobre los codificadores dispersos, puedes consultar la [documentación](https://pinecone-io.github.io/pinecone-text/pinecone_text.html) de la biblioteca pinecone-text.

```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

El código anterior usa valores predeterminados de tfids. Se recomienda encarecidamente ajustar los valores de tf-idf a tu propio corpus. Puedes hacerlo de la siguiente manera:

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## Cargar el buscador

¡Ahora podemos construir el buscador!

```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## Agregar textos (si es necesario)

Opcionalmente, podemos agregar textos al buscador (si aún no están allí)

```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```

```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```

## Usar el buscador

¡Ahora podemos usar el buscador!

```python
result = retriever.invoke("foo")
```

```python
result[0]
```

```output
Document(page_content='foo', metadata={})
```
