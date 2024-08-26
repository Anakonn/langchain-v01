---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/overview/) es una base de datos en la nube optimizada para aplicaciones y soluciones de IA, construida sobre el código abierto [ClickHouse](https://github.com/ClickHouse/ClickHouse).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `MyScale`.

## Configuración de entornos

```python
%pip install --upgrade --quiet  clickhouse-connect
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["OPENAI_API_BASE"] = getpass.getpass("OpenAI Base:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale Host:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

Hay dos formas de configurar los parámetros para el índice de myscale.

1. Variables de entorno

    Antes de ejecutar la aplicación, establezca la variable de entorno con `export`:
    `export MYSCALE_HOST='<your-endpoints-url>' MYSCALE_PORT=<your-endpoints-port> MYSCALE_USERNAME=<your-username> MYSCALE_PASSWORD=<your-password> ...`

    Puede encontrar fácilmente su cuenta, contraseña y otra información en nuestro SaaS. Para más detalles, consulte [este documento](https://docs.myscale.com/en/cluster-management/)

    Todos los atributos bajo `MyScaleSettings` se pueden establecer con el prefijo `MYSCALE_` y no distinguen entre mayúsculas y minúsculas.

2. Crear objeto `MyScaleSettings` con parámetros

    ```python
    from langchain_community.vectorstores import MyScale, MyScaleSettings
    config = MyScaleSetting(host="<your-backend-url>", port=8443, ...)
    index = MyScale(embedding_function, config)
    index.add_documents(...)
    ```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale
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
for d in docs:
    d.metadata = {"some": "metadata"}
docsearch = MyScale.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.66it/s]
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

## Obtener información de conexión y esquema de datos

```python
print(str(docsearch))
```

## Filtrado

Puede tener acceso directo a la declaración SQL de myscale `WHERE`. Puede escribir cláusulas `WHERE` siguiendo el estándar SQL.

**NOTA**: Tenga cuidado con la inyección SQL, esta interfaz no debe ser llamada directamente por el usuario final.

Si personalizó su `column_map` en su configuración, puede buscar con filtros de esta manera:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = MyScale.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.68it/s]
```

### Búsqueda de similitud con puntuación

La puntuación de distancia devuelta es la distancia coseno. Por lo tanto, una puntuación más baja es mejor.

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.229655921459198 {'doc_id': 0} Madam Speaker, Madam...
0.24506962299346924 {'doc_id': 8} And so many families...
0.24786919355392456 {'doc_id': 1} Groups of citizens b...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
```

## Eliminar sus datos

Puede eliminar la tabla con el método `.drop()` o eliminar parcialmente sus datos con el método `.delete()`.

```python
# use directly a `where_str` to delete
docsearch.delete(where_str=f"{docsearch.metadata_column}.doc_id < 5")
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.24506962299346924 {'doc_id': 8} And so many families...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
0.26027143001556396 {'doc_id': 7} We see the unity amo...
0.26390212774276733 {'doc_id': 9} And unlike the $2 Tr...
```

```python
docsearch.drop()
```
