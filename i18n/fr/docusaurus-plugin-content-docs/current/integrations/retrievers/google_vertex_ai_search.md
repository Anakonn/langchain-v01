---
translated: true
---

# Google Vertex AI Search

>[Google Vertex AI Search](https://cloud.google.com/enterprise-search) (anciennement connu sous le nom de `Enterprise Search` sur `Generative AI App Builder`) fait partie de la plateforme d'apprentissage automatique [Vertex AI](https://cloud.google.com/vertex-ai) proposée par `Google Cloud`.

>`Vertex AI Search` permet aux organisations de construire rapidement des moteurs de recherche alimentés par l'IA générative pour les clients et les employés. Il s'appuie sur une variété de technologies de `Google Search`, notamment la recherche sémantique, qui aide à fournir des résultats plus pertinents que les techniques de recherche traditionnelles basées sur les mots-clés en utilisant le traitement du langage naturel et les techniques d'apprentissage automatique pour déduire les relations au sein du contenu et l'intention à partir de la requête de l'utilisateur. Vertex AI Search bénéficie également de l'expertise de Google dans la compréhension de la façon dont les utilisateurs recherchent et tient compte de la pertinence du contenu pour ordonner les résultats affichés.

>`Vertex AI Search` est disponible dans la `Google Cloud Console` et via une API pour l'intégration des workflows d'entreprise.

Ce notebook montre comment configurer `Vertex AI Search` et utiliser le récupérateur Vertex AI Search. Le récupérateur Vertex AI Search encapsule la [bibliothèque client Python](https://cloud.google.com/generative-ai-app-builder/docs/libraries#client-libraries-install-python) et l'utilise pour accéder à l'[API du service de recherche](https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.services.search_service).

## Installer les prérequis

Vous devez installer le package `google-cloud-discoveryengine` pour utiliser le récupérateur Vertex AI Search.

```python
%pip install --upgrade --quiet google-cloud-discoveryengine
```

## Configurer l'accès à Google Cloud et Vertex AI Search

Vertex AI Search est généralement disponible sans liste d'autorisation à partir d'août 2023.

Avant de pouvoir utiliser le récupérateur, vous devez effectuer les étapes suivantes :

### Créer un moteur de recherche et remplir un magasin de données non structurées

- Suivez les instructions du [guide de démarrage de Vertex AI Search](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search) pour configurer un projet Google Cloud et Vertex AI Search.
- [Utilisez la console Google Cloud pour créer un magasin de données non structurées](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es#unstructured-data)
  - Remplissez-le avec les documents PDF d'exemple du dossier Cloud Storage `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs`.
  - Assurez-vous d'utiliser l'option `Cloud Storage (sans métadonnées)`.

### Définir les informations d'identification pour accéder à l'API Vertex AI Search

Les [bibliothèques clientes Vertex AI Search](https://cloud.google.com/generative-ai-app-builder/docs/libraries) utilisées par le récupérateur Vertex AI Search fournissent un support de haut niveau pour l'authentification à Google Cloud par programmation.
Les bibliothèques clientes prennent en charge les [informations d'identification par défaut (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) ; les bibliothèques recherchent les informations d'identification dans un ensemble d'emplacements définis et utilisent ces informations d'identification pour authentifier les requêtes à l'API.
Avec ADC, vous pouvez rendre les informations d'identification disponibles à votre application dans divers environnements, tels que le développement local ou la production, sans avoir besoin de modifier le code de votre application.

Si vous exécutez le code dans [Google Colab](https://colab.google), authentifiez-vous avec `google.colab.google.auth`, sinon suivez l'une des [méthodes prises en charge](https://cloud.google.com/docs/authentication/application-default-credentials) pour vous assurer que vos informations d'identification par défaut sont correctement définies.

```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth as google_auth

    google_auth.authenticate_user()
```

## Configurer et utiliser le récupérateur Vertex AI Search

Le récupérateur Vertex AI Search est implémenté dans la classe `langchain.retriever.GoogleVertexAISearchRetriever`. La méthode `get_relevant_documents` renvoie une liste de documents `langchain.schema.Document` où le champ `page_content` de chaque document est rempli avec le contenu du document.
Selon le type de données utilisé dans Vertex AI Search (site web, données structurées ou non structurées), le champ `page_content` est rempli comme suit :

- Site web avec indexation avancée : une `réponse extractive` qui correspond à une requête. Le champ `metadata` est rempli avec les métadonnées (le cas échéant) du document à partir duquel les segments ou les réponses ont été extraits.
- Source de données non structurées : soit un `segment extractif`, soit une `réponse extractive` qui correspond à une requête. Le champ `metadata` est rempli avec les métadonnées (le cas échéant) du document à partir duquel les segments ou les réponses ont été extraits.
- Source de données structurées : une chaîne JSON contenant tous les champs renvoyés par la source de données structurées. Le champ `metadata` est rempli avec les métadonnées (le cas échéant) du document.

### Réponses extractives et segments extractifs

Une réponse extractive est un texte verbatim qui est renvoyé avec chaque résultat de recherche. Il est extrait directement du document d'origine. Les réponses extractives sont généralement affichées près du haut des pages web pour fournir à l'utilisateur final une brève réponse qui est pertinente dans le contexte de leur requête. Les réponses extractives sont disponibles pour la recherche sur les sites web et les données non structurées.

Un segment extractif est un texte verbatim qui est renvoyé avec chaque résultat de recherche. Un segment extractif est généralement plus verbeux qu'une réponse extractive. Les segments extractifs peuvent être affichés comme réponse à une requête et peuvent être utilisés pour effectuer des tâches de post-traitement et comme entrée pour les modèles de langage de grande taille afin de générer des réponses ou du nouveau texte. Les segments extractifs sont disponibles pour la recherche sur les données non structurées.

Pour plus d'informations sur les segments extractifs et les réponses extractives, reportez-vous à la [documentation du produit](https://cloud.google.com/generative-ai-app-builder/docs/snippets).

REMARQUE : Les segments extractifs nécessitent que les fonctionnalités de l'[édition Entreprise](https://cloud.google.com/generative-ai-app-builder/docs/about-advanced-features#enterprise-features) soient activées.

Lors de la création d'une instance du récupérateur, vous pouvez spécifier un certain nombre de paramètres qui contrôlent le magasin de données à accéder et la façon dont une requête en langage naturel est traitée, y compris les configurations pour les réponses et les segments extractifs.

### Les paramètres obligatoires sont :

- `project_id` - Votre ID de projet Google Cloud.
- `location_id` - L'emplacement du magasin de données.
  - `global` (par défaut)
  - `us`
  - `eu`

L'un des suivants :
- `search_engine_id` - L'ID de l'application de recherche que vous voulez utiliser. (Requis pour la recherche combinée)
- `data_store_id` - L'ID du magasin de données que vous voulez utiliser.

Les paramètres `project_id`, `search_engine_id` et `data_store_id` peuvent être fournis explicitement dans le constructeur du récupérateur ou via les variables d'environnement - `PROJECT_ID`, `SEARCH_ENGINE_ID` et `DATA_STORE_ID`.

Vous pouvez également configurer un certain nombre de paramètres facultatifs, notamment :

- `max_documents` - Le nombre maximum de documents utilisés pour fournir des segments extractifs ou des réponses extractives
- `get_extractive_answers` - Par défaut, le récupérateur est configuré pour renvoyer des segments extractifs.
  - Définissez ce champ sur `True` pour renvoyer des réponses extractives. Cela n'est utilisé que lorsque `engine_data_type` est défini sur `0` (non structuré)
- `max_extractive_answer_count` - Le nombre maximum de réponses extractives renvoyées dans chaque résultat de recherche.
  - Au maximum 5 réponses seront renvoyées. Cela n'est utilisé que lorsque `engine_data_type` est défini sur `0` (non structuré).
- `max_extractive_segment_count` - Le nombre maximum de segments extractifs renvoyés dans chaque résultat de recherche.
  - Actuellement, un seul segment sera renvoyé. Cela n'est utilisé que lorsque `engine_data_type` est défini sur `0` (non structuré).
- `filter` - L'expression de filtre pour les résultats de recherche en fonction des métadonnées associées aux documents du magasin de données.
- `query_expansion_condition` - Spécification pour déterminer dans quelles conditions l'expansion de la requête doit se produire.
  - `0` - Condition d'expansion de requête non spécifiée. Dans ce cas, le comportement par défaut du serveur est désactivé.
  - `1` - Expansion de requête désactivée. Seule la requête de recherche exacte est utilisée, même si SearchResponse.total_size est zéro.
  - `2` - Expansion automatique de la requête construite par l'API de recherche.
- `engine_data_type` - Définit le type de données Vertex AI Search
  - `0` - Données non structurées
  - `1` - Données structurées
  - `2` - Données de site web
  - `3` - [Recherche combinée](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es#multi-data-stores)

### Guide de migration pour `GoogleCloudEnterpriseSearchRetriever`

Dans les versions précédentes, ce récupérateur s'appelait `GoogleCloudEnterpriseSearchRetriever`.

Pour mettre à jour vers le nouveau récupérateur, effectuez les modifications suivantes :

- Changez l'importation de : `from langchain.retrievers import GoogleCloudEnterpriseSearchRetriever` -> `from langchain.retrievers import GoogleVertexAISearchRetriever`.
- Changez toutes les références de classe de `GoogleCloudEnterpriseSearchRetriever` -> `GoogleVertexAISearchRetriever`.

### Configurer et utiliser le récupérateur pour les données **non structurées** avec des segments extractifs

```python
from langchain_community.retrievers import (
    GoogleVertexAIMultiTurnSearchRetriever,
    GoogleVertexAISearchRetriever,
)

PROJECT_ID = "<YOUR PROJECT ID>"  # Set to your Project ID
LOCATION_ID = "<YOUR LOCATION>"  # Set to your data store location
SEARCH_ENGINE_ID = "<YOUR SEARCH APP ID>"  # Set to your search app ID
DATA_STORE_ID = "<YOUR DATA STORE ID>"  # Set to your data store ID
```

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
)
```

```python
query = "What are Alphabet's Other Bets?"

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configurer et utiliser le récupérateur pour les données **non structurées** avec des réponses extractives

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configurer et utiliser le récupérateur pour les données **structurées**

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    engine_data_type=1,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configurer et utiliser le récupérateur pour les données de **site web** avec l'indexation avancée de site web

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
    engine_data_type=2,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configurer et utiliser le récupérateur pour les données **combinées**

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    search_engine_id=SEARCH_ENGINE_ID,
    max_documents=3,
    engine_data_type=3,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### Configurer et utiliser le récupérateur pour la recherche à plusieurs tours

[Recherche avec suites](https://cloud.google.com/generative-ai-app-builder/docs/multi-turn-search) est basée sur des modèles d'IA génératifs et est différente de la recherche de données non structurées régulière.

```python
retriever = GoogleVertexAIMultiTurnSearchRetriever(
    project_id=PROJECT_ID, location_id=LOCATION_ID, data_store_id=DATA_STORE_ID
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```
