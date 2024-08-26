---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/) est une base de données cloud entièrement gérée disponible sur AWS, Azure et GCP. Elle prend désormais en charge la recherche vectorielle native sur vos données de documents MongoDB.

Ce notebook montre comment utiliser [MongoDB Atlas Vector Search](https://www.mongodb.com/products/platform/atlas-vector-search) pour stocker vos embeddings dans les documents MongoDB, créer un index de recherche vectorielle et effectuer une recherche KNN avec un algorithme d'approximation des plus proches voisins (`Hierarchical Navigable Small Worlds`). Il utilise l'étape [$vectorSearch MQL](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/).

Pour utiliser MongoDB Atlas, vous devez d'abord déployer un cluster. Nous avons un niveau gratuit à vie de clusters disponibles. Pour commencer, rendez-vous ici : [démarrage rapide](https://www.mongodb.com/docs/atlas/getting-started/).

> Remarque :
>
>* Plus de documentation est disponible sur le [site LangChain-MongoDB](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/)
>* Cette fonctionnalité est généralement disponible et prête pour les déploiements en production.
>* La version 0.0.305 de langchain ([notes de version](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305)) introduit la prise en charge de l'étape $vectorSearch MQL, qui est disponible avec MongoDB Atlas 6.0.11 et 7.0.2. Les utilisateurs utilisant des versions antérieures de MongoDB Atlas doivent fixer leur version LangChain à <=0.0.304
>

Dans le notebook, nous démontrerons comment effectuer une "Retrieval Augmented Generation" (RAG) à l'aide de MongoDB Atlas, OpenAI et Langchain. Nous effectuerons des recherches par similarité, des recherches par similarité avec pré-filtrage par métadonnées et des questions-réponses sur le document PDF du [rapport technique GPT 4](https://arxiv.org/pdf/2303.08774.pdf) qui est sorti en mars 2023 et n'est donc pas inclus dans la mémoire paramétrique du modèle de langage (LLM) d'OpenAI, qui avait une limite de connaissances de septembre 2021.

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons configurer notre clé d'API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Maintenant, nous allons configurer les variables d'environnement pour le cluster MongoDB Atlas.

```python
%pip install --upgrade --quiet  langchain pypdf pymongo langchain-openai tiktoken
```

```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

```python
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
```

## Créer un index de recherche vectorielle

Maintenant, créons un index de recherche vectorielle sur votre cluster. Des étapes plus détaillées sont disponibles dans la section [Créer un index de recherche vectorielle pour LangChain](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/#create-the-atlas-vector-search-index).
Dans l'exemple ci-dessous, `embedding` est le nom du champ qui contient le vecteur d'embedding. Veuillez vous référer à la [documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/) pour obtenir plus de détails sur la définition d'un index de recherche vectorielle Atlas.
Vous pouvez nommer l'index `{ATLAS_VECTOR_SEARCH_INDEX_NAME}` et créer l'index sur l'espace de noms `{DB_NAME}.{COLLECTION_NAME}`. Enfin, écrivez la définition suivante dans l'éditeur JSON sur MongoDB Atlas :

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

# Insérer des données

```python
from langchain_community.document_loaders import PyPDFLoader

# Load the PDF
loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
data = loader.load()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.split_documents(data)
```

```python
print(docs[0])
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

```python
# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What were the compute requirements for training GPT 4"
results = vector_search.similarity_search(query)

print(results[0].page_content)
```

# Interroger les données

Nous pouvons également instancier le magasin vectoriel directement et exécuter une requête comme suit :

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_search = MongoDBAtlasVectorSearch.from_connection_string(
    MONGODB_ATLAS_CLUSTER_URI,
    DB_NAME + "." + COLLECTION_NAME,
    OpenAIEmbeddings(disallowed_special=()),
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

## Pré-filtrage avec recherche par similarité

Atlas Vector Search prend en charge le pré-filtrage à l'aide d'opérateurs MQL pour le filtrage. Voici un exemple d'index et de requête sur les mêmes données chargées ci-dessus qui vous permet de faire un pré-filtrage des métadonnées sur le champ "page". Vous pouvez mettre à jour votre index existant avec le filtre défini et effectuer un pré-filtrage avec la recherche vectorielle.

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "page"
    }
  ]
}
```

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)
```

## Recherche par similarité avec score

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query,
    k=5,
)

# Display results
for result in results:
    print(result)
```

## Questions-réponses

```python
qa_retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```

GPT-4 nécessite beaucoup plus de calcul que les modèles GPT précédents. Sur un jeu de données dérivé du code interne d'OpenAI, GPT-4 nécessite 100p (pétaflops) de calcul pour atteindre la perte la plus faible, tandis que les modèles plus petits nécessitent 1-10n (nanoflops).
