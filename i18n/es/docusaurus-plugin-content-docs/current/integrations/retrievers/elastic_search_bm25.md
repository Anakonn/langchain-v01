---
translated: true
---

# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/) es un motor de búsqueda y análisis distribuido y RESTful. Proporciona un motor de búsqueda de texto completo distribuido y multiinquilino con una interfaz web HTTP y documentos JSON sin esquema.

>En la recuperación de información, [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) (BM es una abreviatura de best matching) es una función de clasificación utilizada por los motores de búsqueda para estimar la relevancia de los documentos para una consulta de búsqueda determinada. Se basa en el marco de recuperación probabilística desarrollado en las décadas de 1970 y 1980 por Stephen E. Robertson, Karen Spärck Jones y otros.

>El nombre de la función de clasificación real es BM25. El nombre más completo, Okapi BM25, incluye el nombre del primer sistema en usarlo, que fue el sistema de recuperación de información Okapi, implementado en la Universidad de la Ciudad de Londres en las décadas de 1980 y 1990. BM25 y sus variantes más recientes, por ejemplo, BM25F (una versión de BM25 que puede tener en cuenta la estructura del documento y el texto del ancla), representan funciones de recuperación similares a TF-IDF utilizadas en la recuperación de documentos.

Este cuaderno muestra cómo usar un recuperador que utiliza `ElasticSearch` y `BM25`.

Para obtener más información sobre los detalles de BM25, consulte [este artículo de blog](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables).

```python
%pip install --upgrade --quiet  elasticsearch
```

```python
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## Crear un nuevo recuperador

```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```

```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## Agregar textos (si es necesario)

Podemos agregar opcionalmente textos al recuperador (si aún no están allí)

```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```

```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```

## Usar el recuperador

¡Ahora podemos usar el recuperador!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```
