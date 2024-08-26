---
translated: true
---

# Dria

>[Dria](https://dria.co/) est un hub de modèles RAG publics pour que les développeurs puissent à la fois contribuer et utiliser un lac d'intégration partagé. Ce notebook montre comment utiliser l'`API Dria` pour les tâches de récupération de données.

# Installation

Assurez-vous d'avoir le package `dria` installé. Vous pouvez l'installer avec pip :

```python
%pip install --upgrade --quiet dria
```

# Configurer la clé API

Configurez votre clé API Dria pour l'accès.

```python
import os

os.environ["DRIA_API_KEY"] = "DRIA_API_KEY"
```

# Initialiser le récupérateur Dria

Créez une instance de `DriaRetriever`.

```python
from langchain.retrievers import DriaRetriever

api_key = os.getenv("DRIA_API_KEY")
retriever = DriaRetriever(api_key=api_key)
```

# **Créer une base de connaissances**

Créez une connaissance sur [Dria's Knowledge Hub](https://dria.co/knowledge)

```python
contract_id = retriever.create_knowledge_base(
    name="France's AI Development",
    embedding=DriaRetriever.models.jina_embeddings_v2_base_en.value,
    category="Artificial Intelligence",
    description="Explore the growth and contributions of France in the field of Artificial Intelligence.",
)
```

# Ajouter des données

Chargez des données dans votre base de connaissances Dria.

```python
texts = [
    "The first text to add to Dria.",
    "Another piece of information to store.",
    "More data to include in the Dria knowledge base.",
]

ids = retriever.add_texts(texts)
print("Data added with IDs:", ids)
```

# Récupérer les données

Utilisez le récupérateur pour trouver les documents pertinents en fonction d'une requête.

```python
query = "Find information about Dria."
result = retriever.invoke(query)
for doc in result:
    print(doc)
```
