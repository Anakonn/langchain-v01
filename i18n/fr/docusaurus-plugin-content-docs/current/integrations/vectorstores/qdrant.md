---
translated: true
---

# Qdrant

>[Qdrant](https://qdrant.tech/documentation/) (se lit : quadrant) est un moteur de recherche par similarité de vecteurs. Il fournit un service prêt pour la production avec une API pratique pour stocker, rechercher et gérer des points - des vecteurs avec une charge utile supplémentaire. `Qdrant` est conçu pour prendre en charge un filtrage étendu. Cela le rend utile pour toutes sortes de correspondances basées sur les réseaux de neurones ou sémantiques, la recherche par facettes et d'autres applications.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Qdrant`.

Il existe différents modes de fonctionnement de `Qdrant`, et selon celui choisi, il y aura quelques différences subtiles. Les options incluent :
- Mode local, aucun serveur requis
- Déploiement de serveur sur site
- Qdrant Cloud

Voir les [instructions d'installation](https://qdrant.tech/documentation/install/).

```python
%pip install --upgrade --quiet  qdrant-client
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## Connexion à Qdrant depuis LangChain

### Mode local

Le client Python vous permet d'exécuter le même code en mode local sans exécuter le serveur Qdrant. C'est idéal pour tester les choses et déboguer ou si vous prévoyez de stocker seulement une petite quantité de vecteurs. Les embeddings peuvent être entièrement conservés en mémoire ou persistés sur disque.

#### En mémoire

Pour certains scénarios de test et d'expériences rapides, vous pouvez préférer conserver toutes les données en mémoire uniquement, de sorte qu'elles soient perdues lorsque le client est détruit - généralement à la fin de votre script/notebook.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",  # Local mode with in-memory storage only
    collection_name="my_documents",
)
```

#### Stockage sur disque

Le mode local, sans utiliser le serveur Qdrant, peut également stocker vos vecteurs sur disque afin qu'ils soient persistés entre les exécutions.

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    path="/tmp/local_qdrant",
    collection_name="my_documents",
)
```

### Déploiement de serveur sur site

Que vous choisissiez de lancer Qdrant localement avec [un conteneur Docker](https://qdrant.tech/documentation/install/), ou de sélectionner un déploiement Kubernetes avec [le graphique Helm officiel](https://github.com/qdrant/qdrant-helm), la façon de vous connecter à une telle instance sera identique. Vous devrez fournir une URL pointant vers le service.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### Qdrant Cloud

Si vous préférez ne pas vous occuper de la gestion de l'infrastructure, vous pouvez choisir de configurer un cluster Qdrant entièrement géré sur [Qdrant Cloud](https://cloud.qdrant.io/). Il y a un cluster gratuit à vie de 1 Go inclus pour essayer. La principale différence avec l'utilisation d'une version gérée de Qdrant est que vous devrez fournir une clé API pour sécuriser votre déploiement contre un accès public.

```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## Recréation de la collection

Les méthodes `Qdrant.from_texts` et `Qdrant.from_documents` sont idéales pour commencer à utiliser Qdrant avec Langchain. Dans les versions précédentes, la collection était recréée à chaque fois que vous appeliez l'une d'entre elles. Ce comportement a changé. Actuellement, la collection sera réutilisée si elle existe déjà. Le paramètre `force_recreate` à `True` permet de supprimer l'ancienne collection et de repartir de zéro.

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
    force_recreate=True,
)
```

## Recherche de similarité

Le scénario le plus simple pour utiliser le magasin de vecteurs Qdrant est d'effectuer une recherche de similarité. En interne, notre requête sera encodée avec la `embedding_function` et utilisée pour trouver des documents similaires dans la collection Qdrant.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Recherche de similarité avec score

Parfois, nous pouvons vouloir effectuer la recherche, mais aussi obtenir un score de pertinence pour savoir à quel point un résultat particulier est bon.
Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Score: 0.8153784913324512
```

### Filtrage des métadonnées

Qdrant dispose d'un [système de filtrage étendu](https://qdrant.tech/documentation/concepts/filtering/) avec un riche support de types. Il est également possible d'utiliser les filtres dans Langchain, en passant un paramètre supplémentaire aux méthodes `similarity_search_with_score` et `similarity_search`.

```python
from qdrant_client.http import models as rest

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query, filter=rest.Filter(...))
```

## Recherche de pertinence marginale maximale (MMR)

Si vous souhaitez rechercher des documents similaires, mais que vous souhaitez également recevoir des résultats diversifiés, MMR est la méthode à envisager. La pertinence marginale maximale optimise à la fois la similarité avec la requête et la diversité parmi les documents sélectionnés.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

```python
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## Qdrant en tant que Retriever

Qdrant, comme tous les autres magasins de vecteurs, est un Retriever LangChain, en utilisant la similarité cosinus.

```python
retriever = qdrant.as_retriever()
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='similarity', search_kwargs={})
```

Il peut également être spécifié d'utiliser MMR comme stratégie de recherche, au lieu de la similarité.

```python
retriever = qdrant.as_retriever(search_type="mmr")
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='mmr', search_kwargs={})
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

## Personnalisation de Qdrant

Il existe quelques options pour utiliser une collection Qdrant existante dans votre application Langchain. Dans ces cas, vous devrez peut-être définir comment mapper le point Qdrant dans le `Document` Langchain.

### Vecteurs nommés

Qdrant prend en charge [plusieurs vecteurs par point](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors) par vecteurs nommés. Langchain nécessite un seul embedding par document et, par défaut, utilise un seul vecteur. Cependant, si vous travaillez avec une collection créée en externe ou si vous voulez utiliser le vecteur nommé, vous pouvez le configurer en fournissant son nom.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    vector_name="custom_vector",
)
```

En tant qu'utilisateur Langchain, vous ne verrez aucune différence, que vous utilisiez ou non des vecteurs nommés. L'intégration Qdrant gérera la conversion en interne.

### Métadonnées

Qdrant stocke vos vecteurs d'intégration ainsi que la charge utile JSON-like facultative. Les charges utiles sont facultatives, mais comme LangChain suppose que les intégrations sont générées à partir des documents, nous conservons les données de contexte, afin que vous puissiez extraire les textes d'origine également.

Par défaut, votre document sera stocké dans la structure de charge utile suivante :

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

Vous pouvez cependant décider d'utiliser des clés différentes pour le contenu de la page et les métadonnées. C'est utile si vous avez déjà une collection que vous souhaitez réutiliser.

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

```output
<langchain_community.vectorstores.qdrant.Qdrant at 0x7fc4e2baa230>
```
