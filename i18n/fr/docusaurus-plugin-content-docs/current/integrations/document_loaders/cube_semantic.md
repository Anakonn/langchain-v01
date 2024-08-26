---
translated: true
---

# Couche sémantique Cube

Ce notebook démontre le processus de récupération des métadonnées du modèle de données de Cube dans un format adapté pour être transmis aux LLM sous forme d'embeddings, améliorant ainsi les informations contextuelles.

### À propos de Cube

[Cube](https://cube.dev/) est la couche sémantique pour construire des applications de données. Il aide les ingénieurs de données et les développeurs d'applications à accéder aux données des magasins de données modernes, à les organiser en définitions cohérentes et à les fournir à chaque application.

Le modèle de données de Cube fournit une structure et des définitions qui sont utilisées comme contexte pour que le LLM comprenne les données et génère des requêtes correctes. Le LLM n'a pas besoin de naviguer dans des jointures complexes et des calculs de métriques car Cube les abstrait et fournit une interface simple qui fonctionne sur la terminologie au niveau de l'entreprise, plutôt que sur les noms de tables et de colonnes SQL. Cette simplification aide le LLM à être moins sujet aux erreurs et à éviter les hallucinations.

### Exemple

**Arguments d'entrée (obligatoires)**

`Cube Semantic Loader` nécessite 2 arguments :

- `cube_api_url` : L'URL du déploiement REST API de votre Cube. Veuillez vous référer à la [documentation Cube](https://cube.dev/docs/http-api/rest#configuration-base-path) pour plus d'informations sur la configuration du chemin de base.

- `cube_api_token` : Le jeton d'authentification généré en fonction du secret API de votre Cube. Veuillez vous référer à la [documentation Cube](https://cube.dev/docs/security#generating-json-web-tokens-jwt) pour obtenir des instructions sur la génération de JSON Web Tokens (JWT).

**Arguments d'entrée (facultatifs)**

- `load_dimension_values` : Indique s'il faut charger les valeurs de dimension pour chaque dimension de type chaîne de caractères ou non.

- `dimension_values_limit` : Nombre maximum de valeurs de dimension à charger.

- `dimension_values_max_retries` : Nombre maximum de nouvelles tentatives pour charger les valeurs de dimension.

- `dimension_values_retry_delay` : Délai entre les nouvelles tentatives de chargement des valeurs de dimension.

```python
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

Renvoie une liste de documents avec les attributs suivants :

- `page_content`
- `metadata`
  - `table_name`
  - `column_name`
  - `column_data_type`
  - `column_title`
  - `column_description`
  - `column_values`
  - `cube_data_obj_type`

```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```
