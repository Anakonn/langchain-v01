---
translated: true
---

# Arcee

>[Arcee](https://www.arcee.ai/about/about-us) aide au développement des SLM - petits modèles de langue spécialisés, sécurisés et évolutifs.

Ce notebook montre comment utiliser la classe `ArceeRetriever` pour récupérer le(s) document(s) pertinent(s) pour les `Domain Adapted Language Models` (`DALMs`) d'Arcee.

### Configuration

Avant d'utiliser `ArceeRetriever`, assurez-vous que la clé d'API Arcee est définie en tant que variable d'environnement `ARCEE_API_KEY`. Vous pouvez également passer la clé d'API en tant que paramètre nommé.

```python
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### Configuration supplémentaire

Vous pouvez également configurer les paramètres de `ArceeRetriever` tels que `arcee_api_url`, `arcee_app_url` et `model_kwargs` selon vos besoins.
Le fait de définir les `model_kwargs` lors de l'initialisation de l'objet utilise les filtres et la taille par défaut pour toutes les récupérations ultérieures.

```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### Récupération de documents

Vous pouvez récupérer les documents pertinents à partir des contextes téléchargés en fournissant une requête. Voici un exemple :

```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### Paramètres supplémentaires

Arcee vous permet d'appliquer des `filtres` et de définir la `taille` (en termes de nombre) des documents récupérés. Les filtres permettent de restreindre les résultats. Voici comment utiliser ces paramètres :

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```
