---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/) est une base de données cloud-native de bout en bout conçue pour les applications modernes, notamment le web, le mobile, le serverless, Jamstack, le backend et les applications traditionnelles. Avec SurrealDB, vous pouvez simplifier votre infrastructure de base de données et d'API, réduire le temps de développement et construire des applications sécurisées et performantes rapidement et de manière rentable.

>**Les principales fonctionnalités de SurrealDB incluent :**

>* **Réduit le temps de développement :** SurrealDB simplifie votre pile de base de données et d'API en éliminant le besoin de la plupart des composants côté serveur, vous permettant de construire des applications sécurisées et performantes plus rapidement et à moindre coût.
>* **Service d'API backend collaboratif en temps réel :** SurrealDB fonctionne à la fois comme une base de données et un service d'API backend, permettant une collaboration en temps réel.
>* **Prise en charge de plusieurs langages d'interrogation :** SurrealDB prend en charge l'interrogation SQL depuis les appareils clients, GraphQL, les transactions ACID, les connexions WebSocket, les données structurées et non structurées, l'interrogation de graphes, l'indexation en texte intégral et l'interrogation géospatiale.
>* **Contrôle d'accès granulaire :** SurrealDB fournit un contrôle d'accès basé sur les autorisations au niveau des lignes, vous donnant la possibilité de gérer l'accès aux données avec précision.

>Consultez les [fonctionnalités](https://surrealdb.com/features), les dernières [versions](https://surrealdb.com/releases) et la [documentation](https://surrealdb.com/docs).

Ce notebook montre comment utiliser les fonctionnalités liées à `SurrealDBStore`.

## Configuration

Décommentez les cellules ci-dessous pour installer surrealdb.

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

## Utilisation de SurrealDBStore

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import SurrealDBStore
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings()
```

### Création d'un objet SurrealDBStore

```python
db = SurrealDBStore(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding_function=embeddings,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)

# this is needed to initialize the underlying async library for SurrealDB
await db.initialize()

# delete all existing documents from the vectorstore collection
await db.adelete()

# add documents to the vectorstore
ids = await db.aadd_documents(docs)

# document ids of the added documents
ids[:5]
```

```output
['documents:38hz49bv1p58f5lrvrdc',
 'documents:niayw63vzwm2vcbh6w2s',
 'documents:it1fa3ktplbuye43n0ch',
 'documents:il8f7vgbbp9tywmsn98c',
 'documents:vza4c6cqje0avqd58gal']
```

### (Alternativement) Créer un objet SurrealDBStore et ajouter des documents

```python
await db.adelete()

db = await SurrealDBStore.afrom_documents(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding=embeddings,
    documents=docs,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)
```

### Recherche de similarité

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### Recherche de similarité avec score

Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
docs = await db.asimilarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'id': 'documents:slgdlhjkfknhqo15xz0w', 'source': '../../modules/state_of_the_union.txt'}),
 0.39839531721941895)
```
