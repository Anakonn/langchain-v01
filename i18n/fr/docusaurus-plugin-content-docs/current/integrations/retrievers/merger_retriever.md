---
translated: true
---

# LOTR (Merger Retriever)

>`Lord of the Retrievers (LOTR)`, également connu sous le nom de `MergerRetriever`, prend une liste de récupérateurs en entrée et fusionne les résultats de leurs méthodes get_relevant_documents() en une seule liste. Les résultats fusionnés seront une liste de documents pertinents à la requête et classés par les différents récupérateurs.

La classe `MergerRetriever` peut être utilisée pour améliorer la précision de la récupération de documents de plusieurs manières. Tout d'abord, elle peut combiner les résultats de plusieurs récupérateurs, ce qui peut aider à réduire le risque de biais dans les résultats. Deuxièmement, elle peut classer les résultats des différents récupérateurs, ce qui peut aider à s'assurer que les documents les plus pertinents sont renvoyés en premier.

```python
import os

import chromadb
from langchain.retrievers import (
    ContextualCompressionRetriever,
    DocumentCompressorPipeline,
    MergerRetriever,
)
from langchain_chroma import Chroma
from langchain_community.document_transformers import (
    EmbeddingsClusteringFilter,
    EmbeddingsRedundantFilter,
)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings

# Get 3 diff embeddings.
all_mini = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
multi_qa_mini = HuggingFaceEmbeddings(model_name="multi-qa-MiniLM-L6-dot-v1")
filter_embeddings = OpenAIEmbeddings()

ABS_PATH = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(ABS_PATH, "db")

# Instantiate 2 diff chromadb indexes, each one with a diff embedding.
client_settings = chromadb.config.Settings(
    is_persistent=True,
    persist_directory=DB_DIR,
    anonymized_telemetry=False,
)
db_all = Chroma(
    collection_name="project_store_all",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=all_mini,
)
db_multi_qa = Chroma(
    collection_name="project_store_multi",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=multi_qa_mini,
)

# Define 2 diff retrievers with 2 diff embeddings and diff search type.
retriever_all = db_all.as_retriever(
    search_type="similarity", search_kwargs={"k": 5, "include_metadata": True}
)
retriever_multi_qa = db_multi_qa.as_retriever(
    search_type="mmr", search_kwargs={"k": 5, "include_metadata": True}
)

# The Lord of the Retrievers will hold the output of both retrievers and can be used as any other
# retriever on different types of chains.
lotr = MergerRetriever(retrievers=[retriever_all, retriever_multi_qa])
```

## Supprimer les résultats redondants des récupérateurs fusionnés.

```python
# We can remove redundant results from both retrievers using yet another embedding.
# Using multiples embeddings in diff steps could help reduce biases.
filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
pipeline = DocumentCompressorPipeline(transformers=[filter])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## Choisir un échantillon représentatif de documents à partir des récupérateurs fusionnés.

```python
# This filter will divide the documents vectors into clusters or "centers" of meaning.
# Then it will pick the closest document to that center for the final results.
# By default the result document will be ordered/grouped by clusters.
filter_ordered_cluster = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
)

# If you want the final document to be ordered by the original retriever scores
# you need to add the "sorted" parameter.
filter_ordered_by_retriever = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
    sorted=True,
)

pipeline = DocumentCompressorPipeline(transformers=[filter_ordered_by_retriever])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## Réorganiser les résultats pour éviter la dégradation des performances.

Quelle que soit l'architecture de votre modèle, il y a une dégradation substantielle des performances lorsque vous incluez 10+ documents récupérés.
En bref : Lorsque les modèles doivent accéder à des informations pertinentes au milieu de longs contextes, ils ont tendance à ignorer les documents fournis.
Voir : https://arxiv.org/abs//2307.03172

```python
# You can use an additional document transformer to reorder documents after removing redundancy.
from langchain_community.document_transformers import LongContextReorder

filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
reordering = LongContextReorder()
pipeline = DocumentCompressorPipeline(transformers=[filter, reordering])
compression_retriever_reordered = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```
