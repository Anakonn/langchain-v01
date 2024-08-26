---
translated: true
---

# China Mobile ECloud ElasticSearch VectorSearch

>[China Mobile ECloud VectorSearch](https://ecloud.10086.cn/portal/product/elasticsearch) es un servicio de búsqueda y análisis distribuido, totalmente administrado y a nivel empresarial. China Mobile ECloud VectorSearch proporciona servicios de nivel de plataforma de recuperación y análisis de bajo costo, alto rendimiento y confiables para datos estructurados/no estructurados. Como base de datos de vectores, admite múltiples tipos de índice y métodos de distancia de similitud.

Este cuaderno muestra cómo usar la funcionalidad relacionada con el `ECloud ElasticSearch VectorStore`.
Para ejecutarlo, debe tener una instancia de [China Mobile ECloud VectorSearch](https://ecloud.10086.cn/portal/product/elasticsearch) en ejecución:

Lea el [documento de ayuda](https://ecloud.10086.cn/op-help-center/doc/category/1094) para familiarizarse y configurar rápidamente la instancia de China Mobile ECloud ElasticSearch.

Después de que la instancia esté en ejecución, siga estos pasos para dividir documentos, obtener incrustaciones, conectarse a la instancia de elasticsearch de baidu cloud, indexar documentos y realizar una recuperación de vectores.

```python
#!pip install elasticsearch == 7.10.1
```

Primero, queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

En segundo lugar, dividir documentos y obtener incrustaciones.

```python
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import EcloudESVectorStore
```

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

ES_URL = "http://localhost:9200"
USER = "your user name"
PASSWORD = "your password"
indexname = "your index name"
```

luego, indexar documentos

```python
docsearch = EcloudESVectorStore.from_documents(
    docs,
    embeddings,
    es_url=ES_URL,
    user=USER,
    password=PASSWORD,
    index_name=indexname,
    refresh_indices=True,
)
```

Finalmente, consultar y recuperar datos

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query, k=10)
print(docs[0].page_content)
```

Un caso de uso comúnmente utilizado

```python
def test_dense_float_vectore_lsh_cosine() -> None:
    """
    Test indexing with vectore type knn_dense_float_vector and  model-similarity of lsh-cosine
    this mapping is compatible with model of exact and similarity of l2/cosine
    this mapping is compatible with model of lsh and similarity of cosine
    """
    docsearch = EcloudESVectorStore.from_documents(
        docs,
        embeddings,
        es_url=ES_URL,
        user=USER,
        password=PASSWORD,
        index_name=indexname,
        refresh_indices=True,
        text_field="my_text",
        vector_field="my_vec",
        vector_type="knn_dense_float_vector",
        vector_params={"model": "lsh", "similarity": "cosine", "L": 99, "k": 1},
    )

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "similarity": "l2",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "similarity": "cosine",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "lsh",
            "similarity": "cosine",
            "candidates": 10,
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)
```

Con caso de filtro

```python
def test_dense_float_vectore_exact_with_filter() -> None:
    """
    Test indexing with vectore type knn_dense_float_vector and default model/similarity
    this mapping is compatible with model of exact and similarity of l2/cosine
    """
    docsearch = EcloudESVectorStore.from_documents(
        docs,
        embeddings,
        es_url=ES_URL,
        user=USER,
        password=PASSWORD,
        index_name=indexname,
        refresh_indices=True,
        text_field="my_text",
        vector_field="my_vec",
        vector_type="knn_dense_float_vector",
    )
    # filter={"match_all": {}} ,default
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"match_all": {}},
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    # filter={"term": {"my_text": "Jackson"}}
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"term": {"my_text": "Jackson"}},
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    # filter={"term": {"my_text": "president"}}
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"term": {"my_text": "president"}},
        search_params={
            "model": "exact",
            "similarity": "l2",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)
```
