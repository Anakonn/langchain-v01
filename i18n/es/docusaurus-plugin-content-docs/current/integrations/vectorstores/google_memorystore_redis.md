---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) es un servicio totalmente administrado que se basa en el almacén de datos en memoria Redis para crear cachés de aplicaciones que proporcionan acceso a datos en menos de un milisegundo. Extienda su aplicación de base de datos para crear experiencias impulsadas por IA aprovechando las integraciones de Langchain de Memorystore for Redis.

Este cuaderno explica cómo usar [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) para almacenar incrustaciones vectoriales con la clase `MemorystoreVectorStore`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## Requisitos previos

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Memorystore for Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Crear una instancia de Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Asegúrese de que la versión sea mayor o igual a 7.2.

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-memorystore-redis`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
```

**Solo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench, puede reiniciar el terminal usando el botón de la parte superior.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para poder aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no sabes tu ID de proyecto, prueba lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Ubicar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

* Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
* Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Inicializar un índice vectorial

```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### Preparar documentos

El texto necesita procesamiento y representación numérica antes de interactuar con un almacén vectorial. Esto implica:

* Cargar texto: El TextLoader obtiene datos de texto de un archivo (por ejemplo, "state_of_the_union.txt").
* División de texto: El CharacterTextSplitter divide el texto en trozos más pequeños para los modelos de incrustación.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### Agregar documentos al almacén vectorial

Después de la preparación del texto y la generación de incrustaciones, los siguientes métodos los insertan en el almacén vectorial de Redis.

#### Método 1: Método de clase para inserción directa

Este enfoque combina la creación de incrustaciones y la inserción en un solo paso utilizando el método de clase `from_documents`:

```python
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### Método 2: Inserción basada en instancias

Este enfoque ofrece flexibilidad al trabajar con una nueva o existente RedisVectorStore:

* [Opcional] Crear una instancia de RedisVectorStore: Instancia un objeto RedisVectorStore para personalización. Si ya tienes una instancia, pasa al siguiente paso.
* Agregar texto con metadatos: Proporciona texto sin procesar y metadatos a la instancia. La generación de incrustaciones y la inserción en el almacén vectorial se manejan automáticamente.

```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### Realizar una búsqueda de similitud (KNN)

Con el almacén vectorial poblado, es posible buscar texto semánticamente similar a una consulta. Así es como usar KNN (K-Nearest Neighbors) con la configuración predeterminada:

* Formular la consulta: Una pregunta en lenguaje natural expresa la intención de búsqueda (por ejemplo, "¿Qué dijo el presidente sobre Ketanji Brown Jackson?").
* Recuperar resultados similares: El método `similarity_search` encuentra los elementos del almacén vectorial más cercanos a la consulta en significado.

```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### Realizar una búsqueda de similitud basada en rango

Las consultas de rango proporcionan más control al especificar un umbral de similitud deseado junto con el texto de la consulta:

* Formular la consulta: Una pregunta en lenguaje natural define la intención de búsqueda.
* Establecer el umbral de similitud: El parámetro `distance_threshold` determina qué tan cerca debe estar una coincidencia para ser considerada relevante.
* Recuperar resultados: El método `similarity_search_with_score` encuentra elementos del almacén vectorial que se encuentren dentro del umbral de similitud especificado.

```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### Realizar una búsqueda de Relevancia Marginal Máxima (MMR)

Las consultas MMR tienen como objetivo encontrar resultados que sean relevantes para la consulta y diversos entre sí, reduciendo la redundancia en los resultados de búsqueda.

* Formular la consulta: Una pregunta en lenguaje natural define la intención de búsqueda.
* Equilibrar relevancia y diversidad: El parámetro `lambda_mult` controla el equilibrio entre la relevancia estricta y la promoción de la variedad en los resultados.
* Recuperar resultados de MMR: El método `max_marginal_relevance_search` devuelve elementos que optimizan la combinación de relevancia y diversidad en función de la configuración de lambda.

```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## Usar el almacén vectorial como un Recuperador

Para una integración fluida con otros componentes de LangChain, un almacén vectorial se puede convertir en un Recuperador. Esto ofrece varias ventajas:

* Compatibilidad con LangChain: Muchas herramientas y métodos de LangChain están diseñados para interactuar directamente con los recuperadores.
* Facilidad de uso: El método `as_retriever()` convierte el almacén vectorial en un formato que simplifica la consulta.

```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## Limpieza

### Eliminar documentos del almacén vectorial

Ocasionalmente, es necesario eliminar documentos (y sus vectores asociados) del almacén vectorial. El método `delete` proporciona esta funcionalidad.

```python
rvs.delete(ids)
```

### Eliminar un índice de vector

Puede haber circunstancias en las que sea necesario eliminar un índice de vector existente. Los motivos comunes incluyen:

* Cambios en la configuración del índice: si los parámetros del índice necesitan modificación, a menudo se requiere eliminar y volver a crear el índice.
* Gestión del almacenamiento: eliminar los índices no utilizados puede ayudar a liberar espacio dentro de la instancia de Redis.

Precaución: la eliminación del índice de vector es una operación irreversible. Asegúrese de que los vectores almacenados y la funcionalidad de búsqueda ya no se requieran antes de proceder.

```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```
