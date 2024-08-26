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

Ce notebook montre comment utiliser les fonctionnalités liées à `SurrealDBLoader`.

## Aperçu

Le chargeur de documents SurrealDB renvoie une liste de documents Langchain à partir d'une base de données SurrealDB.

Le chargeur de documents prend les paramètres optionnels suivants :

* `dburl` : chaîne de connexion au point de terminaison websocket. par défaut : `ws://localhost:8000/rpc`
* `ns` : nom de l'espace de noms. par défaut : `langchain`
* `db` : nom de la base de données. par défaut : `database`
* `table` : nom de la table. par défaut : `documents`
* `db_user` : identifiants SurrealDB si nécessaire : nom d'utilisateur de la base de données.
* `db_pass` : identifiants SurrealDB si nécessaire : mot de passe de la base de données.
* `filter_criteria` : dictionnaire pour construire la clause `WHERE` pour filtrer les résultats de la table.

Le document de sortie prend la forme suivante :

```output
Document(
    page_content=<json encoded string containing the result document>,
    metadata={
        'id': <document id>,
        'ns': <namespace name>,
        'db': <database_name>,
        'table': <table name>,
        ... <additional fields from metadata property of the document>
    }
)
```

## Configuration

Décommentez les cellules ci-dessous pour installer surrealdb et langchain.

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
import json

from langchain_community.document_loaders.surrealdb import SurrealDBLoader
```

```python
loader = SurrealDBLoader(
    dburl="ws://localhost:8000/rpc",
    ns="langchain",
    db="database",
    table="documents",
    db_user="root",
    db_pass="root",
    filter_criteria={},
)
docs = loader.load()
len(docs)
```

```output
42
```

```python
doc = docs[-1]
doc.metadata
```

```output
{'id': 'documents:zzz434sa584xl3b4ohvk',
 'source': '../../modules/state_of_the_union.txt',
 'ns': 'langchain',
 'db': 'database',
 'table': 'documents'}
```

```python
len(doc.page_content)
```

```output
18078
```

```python
page_content = json.loads(doc.page_content)
```

```python
page_content["text"]
```

```output
'When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'
```
