---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/) est une base de données de recherche et d'analyse en temps réel construite pour le cloud. Rockset utilise un [Converged Index™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/) avec un magasin efficace pour les vecteurs d'intégration afin de servir des requêtes de recherche à faible latence et à haute concurrence à grande échelle. Rockset prend en charge le filtrage des métadonnées et gère l'ingestion en temps réel pour les données de flux en constante évolution.

Ce notebook montre comment utiliser `Rockset` comme un magasin de vecteurs dans LangChain. Avant de commencer, assurez-vous d'avoir accès à un compte `Rockset` et à une clé API disponible. [Commencez votre essai gratuit aujourd'hui.](https://rockset.com/create/)

## Configuration de votre environnement

1. Utilisez la console `Rockset` pour créer une [collection](https://rockset.com/docs/collections/) avec l'API d'écriture comme source. Dans ce tutoriel, nous créons une collection nommée `langchain_demo`.

    Configurez la [transformation d'ingestion](https://rockset.com/docs/ingest-transformation/) suivante pour marquer votre champ d'intégration et tirer parti des optimisations de performances et de stockage :

   (Nous avons utilisé OpenAI `text-embedding-ada-002` pour ces exemples, où #length_of_vector_embedding = 1536)

```sql
SELECT _input.* EXCEPT(_meta),
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding
FROM _input
```

2. Après avoir créé votre collection, utilisez la console pour récupérer une [clé API](https://rockset.com/docs/iam/#users-api-keys-and-roles). Pour les besoins de ce notebook, nous supposons que vous utilisez la région `Oregon(us-west-2)`.

3. Installez le [rockset-python-client](https://github.com/rockset/rockset-python-client) pour permettre à LangChain de communiquer directement avec `Rockset`.

```python
%pip install --upgrade --quiet  rockset
```

## Tutoriel LangChain

Suivez le tutoriel dans votre propre notebook Python pour générer et stocker des intégrations vectorielles dans Rockset.
Commencez à utiliser Rockset pour rechercher des documents similaires à vos requêtes de recherche.

### 1. Définir les variables clés

```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. Préparer les documents

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. Insérer les documents

```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. Rechercher des documents similaires

```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. Rechercher des documents similaires avec filtrage

```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [Facultatif] Supprimer les documents insérés

Vous devez avoir l'ID unique associé à chaque document pour les supprimer de votre collection.
Définissez les ID lors de l'insertion des documents avec `Rockset.add_texts()`. Rockset générera sinon un ID unique pour chaque document. Quoi qu'il en soit, `Rockset.add_texts()` renvoie les ID des documents insérés.

Pour supprimer ces documents, utilisez simplement la fonction `Rockset.delete_texts()`.

```python
docsearch.delete_texts(ids)
```

## Résumé

Dans ce tutoriel, nous avons réussi à créer une collection `Rockset`, à `insérer` des documents avec des intégrations OpenAI et à rechercher des documents similaires avec et sans filtres de métadonnées.

Restez à l'écoute sur https://rockset.com/ pour les prochaines mises à jour dans ce domaine.
