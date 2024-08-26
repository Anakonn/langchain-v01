---
translated: true
---

# MongoDB

[MongoDB](https://www.mongodb.com/) est une base de données NoSQL, orientée document, qui prend en charge les documents de type JSON avec un schéma dynamique.

## Aperçu

Le chargeur de documents MongoDB renvoie une liste de documents Langchain à partir d'une base de données MongoDB.

Le chargeur nécessite les paramètres suivants :

*   Chaîne de connexion MongoDB
*   Nom de la base de données MongoDB
*   Nom de la collection MongoDB
*   (Facultatif) Dictionnaire de filtres de contenu
*   (Facultatif) Liste des noms de champs à inclure dans la sortie

La sortie prend le format suivant :

- pageContent= Document Mongo
- metadata={'database': '[database_name]', 'collection': '[collection_name]'}

## Charger le chargeur de documents

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.mongodb import MongodbLoader
```

```python
loader = MongodbLoader(
    connection_string="mongodb://localhost:27017/",
    db_name="sample_restaurants",
    collection_name="restaurants",
    filter_criteria={"borough": "Bronx", "cuisine": "Bakery"},
    field_names=["name", "address"],
)
```

```python
docs = loader.load()

len(docs)
```

```output
71
```

```python
docs[0]
```

```output
Document(page_content="Morris Park Bake Shop {'building': '1007', 'coord': [-73.856077, 40.848447], 'street': 'Morris Park Ave', 'zipcode': '10462'}", metadata={'database': 'sample_restaurants', 'collection': 'restaurants'})
```
