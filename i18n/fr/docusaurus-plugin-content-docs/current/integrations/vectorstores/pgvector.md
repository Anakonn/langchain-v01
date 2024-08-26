---
translated: true
---

# PGVector

> Une implémentation de l'abstraction de la banque de vecteurs LangChain utilisant `postgres` comme backend et tirant parti de l'extension `pgvector`.

Le code se trouve dans un package d'intégration appelé : [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/).

Vous pouvez exécuter la commande suivante pour démarrer un conteneur postgres avec l'extension `pgvector` :

```shell
docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

## Statut

Ce code a été porté de `langchain_community` vers un package dédié appelé `langchain-postgres`. Les changements suivants ont été apportés :

* langchain_postgres ne fonctionne qu'avec psycopg3. Veuillez mettre à jour vos chaînes de connexion de `postgresql+psycopg2://...` à `postgresql+psycopg://langchain:langchain@...` (oui, le nom du pilote est `psycopg` et non `psycopg3`, mais il utilisera `psycopg3`.
* Le schéma du magasin d'embeddings et de la collection ont été modifiés pour que la méthode add_documents fonctionne correctement avec les identifiants spécifiés par l'utilisateur.
* Il faut maintenant passer un objet de connexion explicite.

Actuellement, il n'y a **aucun mécanisme** qui prenne en charge une migration de données facile lors des changements de schéma. Donc tout changement de schéma dans le vectorstore nécessitera que l'utilisateur recréé les tables et réajoute les documents.
Si cela vous préoccupe, veuillez utiliser un autre vectorstore. Sinon, cette implémentation devrait convenir à votre cas d'utilisation.

## Installer les dépendances

Ici, nous utilisons `langchain_cohere` pour les embeddings, mais vous pouvez utiliser d'autres fournisseurs d'embeddings.

```python
!pip install --quiet -U langchain_cohere
!pip install --quiet -U langchain_postgres
```

## Initialiser le vectorstore

```python
from langchain_cohere import CohereEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"
embeddings = CohereEmbeddings()

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## Supprimer les tables

Si vous avez besoin de supprimer les tables (par exemple, pour mettre à jour l'embedding vers une dimension différente ou simplement pour mettre à jour le fournisseur d'embedding) :

```python
vectorstore.drop_tables()
```

## Ajouter des documents

Ajouter des documents au vectorstore

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

```python
vectorstore.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```python
vectorstore.similarity_search("kitty", k=10)
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'})]
```

L'ajout de documents par ID écrasera tous les documents existants qui correspondent à cet ID.

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

## Prise en charge du filtrage

Le vectorstore prend en charge un ensemble de filtres qui peuvent être appliqués aux champs de métadonnées des documents.

| Opérateur | Signification/Catégorie   |
|----------|-------------------------|
| \$eq      | Égalité (==)            |
| \$ne      | Inégalité (!=)          |
| \$lt      | Inférieur à (<)         |
| \$lte     | Inférieur ou égal à (<=)|
| \$gt      | Supérieur à (>)         |
| \$gte     | Supérieur ou égal à (>=)|
| \$in      | Cas spécial (in)        |
| \$nin     | Cas spécial (not in)    |
| \$between | Cas spécial (between)   |
| \$like    | Texte (like)            |
| \$ilike   | Texte (insensible à la casse like) |
| \$and     | Logique (and)           |
| \$or      | Logique (or)            |

```python
vectorstore.similarity_search("kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}})
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'})]
```

Si vous fournissez un dictionnaire avec plusieurs champs, mais sans opérateurs, le niveau supérieur sera interprété comme un filtre **ET** logique.

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search("bird", k=10, filter={"location": {"$ne": "pond"}})
```

```output
[Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'})]
```
