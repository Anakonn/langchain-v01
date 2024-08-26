---
translated: true
---

# Meilisearch

> [Meilisearch](https://meilisearch.com) est un moteur de recherche open-source, ultra-rapide et hyper pertinent. Il est livré avec de grands paramètres par défaut pour aider les développeurs à construire des expériences de recherche rapides.
>
> Vous pouvez [héberger Meilisearch vous-même](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) ou l'exécuter sur [Meilisearch Cloud](https://www.meilisearch.com/pricing).

Meilisearch v1.3 prend en charge la recherche vectorielle. Cette page vous guide à travers l'intégration de Meilisearch en tant que magasin vectoriel et son utilisation pour effectuer des recherches vectorielles.

## Configuration

### Lancement d'une instance Meilisearch

Vous aurez besoin d'une instance Meilisearch en cours d'exécution pour l'utiliser comme magasin vectoriel. Vous pouvez exécuter [Meilisearch en local](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) ou créer un compte [Meilisearch Cloud](https://cloud.meilisearch.com/).

À partir de Meilisearch v1.3, le stockage vectoriel est une fonctionnalité expérimentale. Après avoir lancé votre instance Meilisearch, vous devez **activer le stockage vectoriel**. Pour Meilisearch auto-hébergé, lisez la documentation sur [l'activation des fonctionnalités expérimentales](https://www.meilisearch.com/docs/learn/experimental/overview). Sur **Meilisearch Cloud**, activez _Vector Store_ via la page _Paramètres_ de votre projet.

Vous devriez maintenant avoir une instance Meilisearch en cours d'exécution avec le stockage vectoriel activé. 🎉

### Identifiants

Pour interagir avec votre instance Meilisearch, le SDK Meilisearch a besoin d'un hôte (URL de votre instance) et d'une clé API.

**Hôte**

- En **local**, l'hôte par défaut est `localhost:7700`
- Sur **Meilisearch Cloud**, trouvez l'hôte dans la page _Paramètres_ de votre projet

**Clés API**

L'instance Meilisearch vous fournit trois clés API par défaut :
- Une `MASTER KEY` - elle ne doit être utilisée que pour créer votre instance Meilisearch
- Une `ADMIN KEY` - à utiliser uniquement côté serveur pour mettre à jour votre base de données et ses paramètres
- Une `SEARCH KEY` - une clé que vous pouvez partager en toute sécurité dans les applications front-end

Vous pouvez créer [des clés API supplémentaires](https://www.meilisearch.com/docs/learn/security/master_api_keys) selon les besoins.

### Installation des dépendances

Ce guide utilise le [SDK Python Meilisearch](https://github.com/meilisearch/meilisearch-python). Vous pouvez l'installer en exécutant :

```python
%pip install --upgrade --quiet  meilisearch
```

Pour plus d'informations, reportez-vous à la [documentation du SDK Python Meilisearch](https://meilisearch.github.io/meilisearch-python/).

## Exemples

Il existe plusieurs façons d'initialiser le magasin vectoriel Meilisearch : en fournissant un client Meilisearch ou l'_URL_ et la _clé API_ selon les besoins. Dans nos exemples, les identifiants seront chargés à partir de l'environnement.

Vous pouvez rendre les variables d'environnement disponibles dans votre environnement Notebook en utilisant `os` et `getpass`. Vous pouvez utiliser cette technique pour tous les exemples suivants.

```python
import getpass
import os

os.environ["MEILI_HTTP_ADDR"] = getpass.getpass("Meilisearch HTTP address and port:")
os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### Ajout de texte et d'embeddings

Cet exemple ajoute du texte à la base de données vectorielle Meilisearch sans avoir à initialiser un magasin vectoriel Meilisearch.

```python
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

En coulisses, Meilisearch convertira le texte en plusieurs vecteurs. Cela nous amènera au même résultat que l'exemple suivant.

### Ajout de documents et d'embeddings

Dans cet exemple, nous utiliserons Langchain TextSplitter pour diviser le texte en plusieurs documents. Ensuite, nous stockerons ces documents ainsi que leurs embeddings.

```python
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## Ajout de documents en créant un Meilisearch Vectorstore

Dans cette approche, nous créons un objet de magasin vectoriel et ajoutons des documents à celui-ci.

```python
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## Recherche de similarité avec score

Cette méthode spécifique vous permet de renvoyer les documents et le score de distance de la requête à ceux-ci. `embedder_name` est le nom de l'embedder à utiliser pour la recherche sémantique, par défaut "default".

```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## Recherche de similarité par vecteur

`embedder_name` est le nom de l'embedder à utiliser pour la recherche sémantique, par défaut "default".

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## Ressources supplémentaires

Documentation
- [Meilisearch](https://www.meilisearch.com/docs/)
- [SDK Python Meilisearch](https://python-sdk.meilisearch.com)

Dépôts open-source
- [Dépôt Meilisearch](https://github.com/meilisearch/meilisearch)
- [SDK Python Meilisearch](https://github.com/meilisearch/meilisearch-python)
