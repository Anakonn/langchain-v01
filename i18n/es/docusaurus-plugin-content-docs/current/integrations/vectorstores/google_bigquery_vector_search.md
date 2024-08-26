---
translated: true
---

# Google BigQuery Vector Search

> [Google Cloud BigQuery Vector Search](https://cloud.google.com/bigquery/docs/vector-search-intro) le permite usar GoogleSQL para realizar búsquedas semánticas, utilizando índices de vectores para obtener resultados aproximados rápidos, o utilizando fuerza bruta para obtener resultados exactos.

Este tutorial ilustra cómo trabajar con un sistema de gestión de datos y incrustaciones de extremo a extremo en LangChain, y proporcionar una búsqueda semántica escalable en BigQuery.

## Comenzando

### Instalar la biblioteca

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**Solo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## Antes de comenzar

#### Establece tu ID de proyecto

Si no sabes tu ID de proyecto, intenta lo siguiente:
* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localizar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### Establece la región

También puedes cambiar la variable `REGION` utilizada por BigQuery. Más información sobre [regiones de BigQuery](https://cloud.google.com/bigquery/docs/locations#supported_locations).

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### Establece los nombres de dataset y tabla

Serán tu Vector Store de BigQuery.

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### Autenticando tu entorno de cuaderno

- Si estás usando **Colab** para ejecutar este cuaderno, descomenta la celda a continuación y continúa.
- Si estás usando **Vertex AI Workbench**, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## Demo: BigQueryVectorSearch

### Crear una instancia de clase de incrustación

Es posible que tengas que habilitar la API de Vertex AI en tu proyecto ejecutando
`gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}`
(reemplaza `{PROJECT_ID}` con el nombre de tu proyecto).

Puedes usar cualquier [modelo de incrustaciones de LangChain](/docs/integrations/text_embedding/).

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### Crear dataset de BigQuery

Paso opcional para crear el dataset si no existe.

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### Inicializar el Vector Store de BigQueryVectorSearch con un dataset de BigQuery existente

```python
from langchain.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import BigQueryVectorSearch

store = BigQueryVectorSearch(
    project_id=PROJECT_ID,
    dataset_name=DATASET,
    table_name=TABLE,
    location=REGION,
    embedding=embedding,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### Agregar textos

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### Buscar documentos

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### Buscar documentos por vector

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### Buscar documentos con filtro de metadatos

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### Explorar las estadísticas de trabajo con el ID de trabajo de BigQuery

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```
