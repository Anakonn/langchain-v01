---
translated: true
---

# Arcee

Ce cahier démontre comment utiliser la classe `Arcee` pour générer du texte à l'aide des modèles de langue adaptés au domaine (DALM) d'Arcee.

### Configuration

Avant d'utiliser Arcee, assurez-vous que la clé d'API Arcee est définie en tant que variable d'environnement `ARCEE_API_KEY`. Vous pouvez également transmettre la clé d'API en tant que paramètre nommé.

```python
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### Configuration supplémentaire

Vous pouvez également configurer les paramètres d'Arcee tels que `arcee_api_url`, `arcee_app_url` et `model_kwargs` selon les besoins.
Le fait de définir les `model_kwargs` lors de l'initialisation de l'objet utilise les paramètres par défaut pour tous les appels ultérieurs à la réponse de génération.

```python
arcee = Arcee(
    model="DALM-Patent",
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

### Génération de texte

Vous pouvez générer du texte à partir d'Arcee en fournissant une invite. Voici un exemple :

```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### Paramètres supplémentaires

Arcee vous permet d'appliquer des `filtres` et de définir la `taille` (en termes de nombre) des documents récupérés pour faciliter la génération de texte. Les filtres permettent de restreindre les résultats. Voici comment utiliser ces paramètres :

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```
