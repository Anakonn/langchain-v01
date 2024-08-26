---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) est un moteur de recherche et d'analyse distribué et RESTful, capable d'effectuer des recherches vectorielles et lexicales. Il est construit sur la bibliothèque Apache Lucene.

Ce notebook montre comment utiliser les fonctionnalités d'historique des messages de chat avec `Elasticsearch`.

## Configurer Elasticsearch

Il existe deux principales façons de configurer une instance Elasticsearch :

1. **Elastic Cloud.** Elastic Cloud est un service Elasticsearch géré. Inscrivez-vous à un [essai gratuit](https://cloud.elastic.co/registration?storm=langchain-notebook).

2. **Installation locale d'Elasticsearch.** Commencez avec Elasticsearch en l'exécutant localement. Le moyen le plus simple est d'utiliser l'image Docker officielle d'Elasticsearch. Consultez la [documentation Docker d'Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) pour plus d'informations.

## Installer les dépendances

```python
%pip install --upgrade --quiet  elasticsearch langchain
```

## Authentification

### Comment obtenir un mot de passe pour l'utilisateur "elastic" par défaut

Pour obtenir votre mot de passe Elastic Cloud pour l'utilisateur "elastic" par défaut :
1. Connectez-vous à la [console Elastic Cloud](https://cloud.elastic.co)
2. Allez dans "Sécurité" > "Utilisateurs"
3. Localisez l'utilisateur "elastic" et cliquez sur "Modifier"
4. Cliquez sur "Réinitialiser le mot de passe"
5. Suivez les invites pour réinitialiser le mot de passe

### Utiliser le nom d'utilisateur/mot de passe

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### Comment obtenir une clé API

Pour obtenir une clé API :
1. Connectez-vous à la [console Elastic Cloud](https://cloud.elastic.co)
2. Ouvrez `Kibana` et allez dans Gestion de la pile > Clés API
3. Cliquez sur "Créer une clé API"
4. Entrez un nom pour la clé API et cliquez sur "Créer"

### Utiliser la clé API

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```

## Initialiser le client Elasticsearch et l'historique des messages de chat

```python
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## Utiliser l'historique des messages de chat

```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```
