---
translated: true
---

# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb) de [SemaFind](https://www.semafind.com) est une base de données de similarité vectorielle sans tracas pour construire des applications d'IA. Le `SemaDB Cloud` hébergé offre une expérience de développeur sans tracas pour se lancer.

La documentation complète de l'API ainsi que des exemples et un playground interactif sont disponibles sur [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb).

Ce notebook démontre l'utilisation du magasin de vecteurs `SemaDB Cloud`.

## Charger les embeddings de documents

Pour exécuter les choses localement, nous utilisons [Sentence Transformers](https://www.sbert.net/) qui sont couramment utilisés pour incorporer des phrases. Vous pouvez utiliser n'importe quel modèle d'incorporation que LangChain propose.

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```

```output
114
```

## Se connecter à SemaDB

SemaDB Cloud utilise les [clés RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb) pour s'authentifier. Vous pouvez les obtenir en créant un compte RapidAPI gratuit.

```python
import getpass
import os

os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```

```output
SemaDB API Key: ········
```

```python
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

Les paramètres du magasin de vecteurs SemaDB reflètent directement l'API :

- "mycollection" : est le nom de la collection dans laquelle nous stockerons ces vecteurs.
- 768 : est la dimension des vecteurs. Dans notre cas, les embeddings du transformateur de phrases produisent des vecteurs de 768 dimensions.
- API_KEY : est votre clé RapidAPI.
- embeddings : correspondent à la façon dont les embeddings des documents, des textes et des requêtes seront générés.
- DistanceStrategy : est la métrique de distance utilisée. L'enveloppe normalise automatiquement les vecteurs si COSINE est utilisé.

```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```

```output
True
```

L'enveloppe du magasin de vecteurs SemaDB ajoute le texte du document en tant que métadonnées de point pour les collecter plus tard. Le stockage de grands morceaux de texte n'est *pas recommandé*. Si vous indexez une grande collection, nous vous recommandons plutôt de stocker des références aux documents telles que des identifiants externes.

```python
db.add_documents(docs)[:2]
```

```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```

## Recherche de similarité

Nous utilisons l'interface de recherche de similarité LangChain par défaut pour rechercher les phrases les plus similaires.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```

## Nettoyage

Vous pouvez supprimer la collection pour supprimer toutes les données.

```python
db.delete_collection()
```

```output
True
```
