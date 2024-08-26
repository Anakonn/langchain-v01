---
translated: true
---

# Alibaba Cloud OpenSearch

>[Alibaba Cloud Opensearch](https://www.alibabacloud.com/product/opensearch) es una plataforma integral para desarrollar servicios de búsqueda inteligente. `OpenSearch` se construyó sobre el motor de búsqueda distribuido a gran escala desarrollado por `Alibaba`. `OpenSearch` atiende a más de 500 casos empresariales en el Grupo Alibaba y a miles de clientes de Alibaba Cloud. `OpenSearch` ayuda a desarrollar servicios de búsqueda en diferentes escenarios de búsqueda, incluyendo comercio electrónico, O2O, multimedia, la industria de contenidos, comunidades y foros, y consultas de big data en empresas.

>`OpenSearch` le ayuda a desarrollar servicios de búsqueda inteligente de alta calidad, sin mantenimiento y de alto rendimiento para proporcionar a sus usuarios una alta eficiencia y precisión de búsqueda.

>`OpenSearch` proporciona la función de búsqueda vectorial. En escenarios específicos, especialmente en la búsqueda de preguntas de prueba y la búsqueda de imágenes, puede utilizar la función de búsqueda vectorial junto con la función de búsqueda multimodal para mejorar la precisión de los resultados de búsqueda.

Este cuaderno muestra cómo utilizar la funcionalidad relacionada con la `Edición de búsqueda vectorial de Alibaba Cloud OpenSearch`.

## Configuración

### Comprar una instancia y configurarla

Compre OpenSearch Vector Search Edition de [Alibaba Cloud](https://opensearch.console.aliyun.com) y configure la instancia de acuerdo con la [documentación de ayuda](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO).

Para ejecutar, debe tener una instancia de [OpenSearch Vector Search Edition](https://opensearch.console.aliyun.com) en ejecución.

### Clase de almacén vectorial de Alibaba Cloud OpenSearch

                                                                                                                La clase `AlibabaCloudOpenSearch` admite las siguientes funciones:
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`

Lea el [documento de ayuda](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search) para familiarizarse rápidamente y configurar la instancia de OpenSearch Vector Search Edition.

Si tiene algún problema durante el uso, no dude en ponerse en contacto con xingshaomin.xsm@alibaba-inc.com, y haremos todo lo posible para brindarle asistencia y apoyo.

Después de que la instancia esté en ejecución, siga estos pasos para dividir documentos, obtener incrustaciones, conectarse a la instancia de alibaba cloud opensearch, indexar documentos y realizar una recuperación vectorial.

Primero debemos instalar los siguientes paquetes de Python.

```python
%pip install --upgrade --quiet  alibabacloud_ha3engine_vector
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Ejemplo

```python
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Dividir documentos y obtener incrustaciones.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Crear configuraciones de opensearch.

```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

Crear una instancia de acceso a opensearch mediante configuraciones.

```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

o

```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

Agregar textos y construir índice.

```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

Consultar y recuperar datos.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

Consultar y recuperar datos con metadatos.

```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

Si tiene algún problema durante el uso, no dude en ponerse en contacto con <xingshaomin.xsm@alibaba-inc.com>, y haremos todo lo posible para brindarle asistencia y apoyo.
