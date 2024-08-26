---
translated: true
---

# Baidu VectorDB

>[Baidu VectorDB](https://cloud.baidu.com/product/vdb.html) es un servicio de base de datos distribuida robusta y de nivel empresarial, desarrollado y gestionado meticulosamente por Baidu Intelligent Cloud. Se destaca por su excepcional capacidad para almacenar, recuperar y analizar datos vectoriales multidimensionales. En su núcleo, VectorDB opera sobre el kernel de base de datos vectorial "Mochow" propiedad de Baidu, que garantiza un alto rendimiento, disponibilidad y seguridad, junto con una notable escalabilidad y facilidad de uso.

>Este servicio de base de datos admite una diversa gama de tipos de índice y métodos de cálculo de similitud, atendiendo a diversos casos de uso. Una característica destacada de VectorDB es su capacidad para gestionar una inmensa escala vectorial de hasta 10 mil millones, manteniendo un impresionante rendimiento de consulta, compatible con millones de consultas por segundo (QPS) con una latencia de consulta a nivel de milisegundos.

Este cuaderno muestra cómo utilizar la funcionalidad relacionada con Baidu VectorDB.

Para ejecutar, debe tener una [instancia de base de datos.](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf).

```python
!pip3 install pymochow
```

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import BaiduVectorDB
from langchain_community.vectorstores.baiduvectordb import ConnectionParams
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = FakeEmbeddings(size=128)
```

```python
conn_params = ConnectionParams(
    endpoint="http://192.168.xx.xx:xxxx", account="root", api_key="****"
)

vector_db = BaiduVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, drop_old=True
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```python
vector_db = BaiduVectorDB(embeddings, conn_params)
vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```
