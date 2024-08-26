---
translated: true
---

# Baidu Cloud ElasticSearch VectorSearch

>[Baidu Cloud VectorSearch](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc) es un servicio de búsqueda y análisis distribuido a nivel empresarial, totalmente administrado y 100% compatible con código abierto. Baidu Cloud VectorSearch proporciona servicios de plataforma de recuperación y análisis de bajo costo, alto rendimiento y confiables para datos estructurados/no estructurados. Como base de datos de vectores, admite múltiples tipos de índice y métodos de distancia de similitud.

>`Baidu Cloud ElasticSearch` proporciona un mecanismo de gestión de privilegios, para que pueda configurar los privilegios del clúster libremente, a fin de garantizar aún más la seguridad de los datos.

Este cuaderno muestra cómo usar la funcionalidad relacionada con el `Baidu Cloud ElasticSearch VectorStore`.
Para ejecutarlo, debe tener una instancia de [Baidu Cloud ElasticSearch](https://cloud.baidu.com/product/bes.html) activa y en ejecución:

Lea el [documento de ayuda](https://cloud.baidu.com/doc/BES/s/8llyn0hh4) para familiarizarse y configurar rápidamente la instancia de Baidu Cloud ElasticSearch.

Después de que la instancia esté activa y en ejecución, siga estos pasos para dividir documentos, obtener incrustaciones, conectarse a la instancia de baidu cloud elasticsearch, indexar documentos y realizar una recuperación vectorial.

Primero debemos instalar los siguientes paquetes de Python.

```python
%pip install --upgrade --quiet  elasticsearch == 7.11.0
```

Primero, queremos usar `QianfanEmbeddings`, así que tenemos que obtener el AK y el SK de Qianfan. Los detalles de QianFan están relacionados con [Baidu Qianfan Workshop](https://cloud.baidu.com/product/wenxinworkshop)

```python
import getpass
import os

os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

En segundo lugar, divida los documentos y obtenga las incrustaciones.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

Luego, cree una instancia accesible de Baidu ElasticeSearch.

```python
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

Finalmente, consulta y recupera datos

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

No dude en ponerse en contacto con <liuboyao@baidu.com> o <chenweixu01@baidu.com> si encuentra algún problema durante el uso, y haremos todo lo posible para brindarle asistencia.
