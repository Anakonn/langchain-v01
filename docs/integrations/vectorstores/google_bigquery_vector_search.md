---
canonical: https://python.langchain.com/v0.1/docs/integrations/vectorstores/google_bigquery_vector_search
translated: false
---

# Google BigQuery Vector Search

> [Google Cloud BigQuery Vector Search](https://cloud.google.com/bigquery/docs/vector-search-intro) lets you use GoogleSQL to do semantic search, using vector indexes for fast approximate results, or using brute force for exact results.

This tutorial illustrates how to work with an end-to-end data and embedding management system in LangChain, and provide scalable semantic search in BigQuery.

## Getting started

### Install the library

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**Colab only:** Uncomment the following cell to restart the kernel or use the button to restart the kernel. For Vertex AI Workbench you can restart the terminal using the button on top.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## Before you begin

#### Set your project ID

If you don't know your project ID, try the following:
* Run `gcloud config list`.
* Run `gcloud projects list`.
* See the support page: [Locate the project ID](https://support.google.com/googleapi/answer/7014113).

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### Set the region

You can also change the `REGION` variable used by BigQuery. Learn more about [BigQuery regions](https://cloud.google.com/bigquery/docs/locations#supported_locations).

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### Set the dataset and table names

They will be your BigQuery Vector Store.

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### Authenticating your notebook environment

- If you are using **Colab** to run this notebook, uncomment the cell below and continue.
- If you are using **Vertex AI Workbench**, check out the setup instructions [here](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## Demo: BigQueryVectorSearch

### Create an embedding class instance

You may need to enable Vertex AI API in your project by running
`gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}`
(replace `{PROJECT_ID}` with the name of your project).

You can use any [LangChain embeddings model](/docs/integrations/text_embedding/).

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### Create BigQuery Dataset

Optional step to create the dataset if it doesn't exist.

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### Initialize BigQueryVectorSearch Vector Store with an existing BigQuery dataset

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

### Add texts

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### Search for documents

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### Search for documents by vector

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### Search for documents with metadata filter

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### Explore job satistics with BigQuery Job Id

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```