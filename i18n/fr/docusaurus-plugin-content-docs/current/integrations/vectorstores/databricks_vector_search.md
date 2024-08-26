---
translated: true
---

# Recherche vectorielle Databricks

La recherche vectorielle Databricks est un moteur de recherche de similarité sans serveur qui vous permet de stocker une représentation vectorielle de vos données, y compris les métadonnées, dans une base de données vectorielle. Avec la recherche vectorielle, vous pouvez créer des index de recherche vectorielle auto-mis à jour à partir de tables Delta gérées par Unity Catalog et les interroger avec une API simple pour renvoyer les vecteurs les plus similaires.

Ce notebook montre comment utiliser LangChain avec la recherche vectorielle Databricks.

Installer `databricks-vectorsearch` et les packages Python associés utilisés dans ce notebook.

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

Utiliser `OpenAIEmbeddings` pour les embeddings.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Diviser les documents et obtenir les embeddings.

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))
```

## Configurer le client de recherche vectorielle Databricks

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
```

## Créer un point de terminaison de recherche vectorielle

Ce point de terminaison est utilisé pour créer et accéder aux index de recherche vectorielle.

```python
vsc.create_endpoint(name="vector_search_demo_endpoint", endpoint_type="STANDARD")
```

## Créer un index d'accès vectoriel direct

L'index d'accès vectoriel direct prend en charge la lecture et l'écriture directes des vecteurs d'embedding et des métadonnées via une API REST ou un SDK. Pour cet index, vous gérez vous-même les vecteurs d'embedding et les mises à jour de l'index.

```python
vector_search_endpoint_name = "vector_search_demo_endpoint"
index_name = "ml.llm.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        "source": "string",
    },
)

index.describe()
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    index, text_column="text", embedding=embeddings, columns=["source"]
)
```

## Ajouter des documents à l'index

```python
dvs.add_documents(docs)
```

## Recherche de similarité

```python
query = "What did the president say about Ketanji Brown Jackson"
dvs.similarity_search(query)
print(docs[0].page_content)
```

## Travailler avec l'index de synchronisation Delta

Vous pouvez également utiliser `DatabricksVectorSearch` pour rechercher dans un index de synchronisation Delta. L'index de synchronisation Delta se synchronise automatiquement à partir d'une table Delta. Vous n'avez pas besoin d'appeler `add_text`/`add_documents` manuellement. Voir la [page de documentation Databricks](https://docs.databricks.com/en/generative-ai/vector-search.html#delta-sync-index-with-managed-embeddings) pour plus de détails.

```python
dvs_delta_sync = DatabricksVectorSearch("catalog_name.schema_name.delta_sync_index")
dvs_delta_sync.similarity_search(query)
```
