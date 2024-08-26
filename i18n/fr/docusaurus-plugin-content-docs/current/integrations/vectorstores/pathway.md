---
translated: true
---

# Parcours

> [Parcours](https://pathway.com/) est un cadre ouvert de traitement des données. Il vous permet de développer facilement des pipelines de transformation de données et des applications d'apprentissage automatique qui fonctionnent avec des sources de données en direct et des données en évolution.

Ce notebook montre comment utiliser un pipeline d'indexation de données en direct `Parcours` avec `Langchain`. Vous pouvez interroger les résultats de ce pipeline à partir de vos chaînes de la même manière que vous le feriez avec un magasin de vecteurs standard. Cependant, sous le capot, Parcours met à jour l'index à chaque changement de données, vous donnant ainsi des réponses toujours à jour.

Dans ce notebook, nous utiliserons un [pipeline public de traitement de documents de démonstration](https://pathway.com/solutions/ai-pipelines#try-it-out) qui :

1. Surveille plusieurs sources de données cloud pour les changements de données.
2. Construit un index vectoriel pour les données.

Pour avoir votre propre pipeline de traitement de documents, consultez l'[offre hébergée](https://pathway.com/solutions/ai-pipelines) ou [construisez le vôtre](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/).

Nous nous connecterons à l'index à l'aide d'un client `VectorStore`, qui implémente la fonction `similarity_search` pour récupérer les documents correspondants.

Le pipeline de base utilisé dans ce document permet de construire facilement un simple index vectoriel des fichiers stockés dans un emplacement cloud. Cependant, Parcours fournit tout ce qui est nécessaire pour construire des pipelines et des applications de données en temps réel, y compris des opérations de type SQL telles que les réductions de groupage et les jointures entre sources de données disparates, le groupement et la fenêtrage des données en fonction du temps, et une large gamme de connecteurs.

## Interroger le pipeline de données

Pour instancier et configurer le client, vous devez fournir soit l'`url`, soit l'`host` et le `port` de votre pipeline d'indexation de documents. Dans le code ci-dessous, nous utilisons un [pipeline de démonstration public](https://pathway.com/solutions/ai-pipelines#try-it-out), dont l'API REST est accessible à l'adresse `https://demo-document-indexing.pathway.stream`. Cette démonstration ingère des documents à partir de [Google Drive](https://drive.google.com/drive/u/0/folders/1cULDv2OaViJBmOfG5WB0oWcgayNrGtVs) et [Sharepoint](https://navalgo.sharepoint.com/sites/ConnectorSandbox/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FConnectorSandbox%2FShared%20Documents%2FIndexerSandbox&p=true&ga=1) et maintient un index pour récupérer les documents.

```python
from langchain_community.vectorstores import PathwayVectorClient

client = PathwayVectorClient(url="https://demo-document-indexing.pathway.stream")
```

 Et nous pouvons commencer à poser des questions

```python
query = "What is Pathway?"
docs = client.similarity_search(query)
```

```python
print(docs[0].page_content)
```

 **À vous !** [Obtenez votre pipeline](https://pathway.com/solutions/ai-pipelines) ou téléchargez [de nouveaux documents](https://chat-realtime-sharepoint-gdrive.demo.pathway.com/) dans le pipeline de démonstration et réessayez la requête !

## Filtrage basé sur les métadonnées des fichiers

Nous prenons en charge le filtrage de documents à l'aide d'expressions [jmespath](https://jmespath.org/), par exemple :

```python
# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="modified_at >= `1702672093`")

# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="owner == `james`")

# take into account only sources with path containing 'repo_readme'
docs = client.similarity_search(query, metadata_filter="contains(path, 'repo_readme')")

# and of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` && modified_at >= `1702672093`"
)

# or of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` || modified_at >= `1702672093`"
)
```

## Obtenir des informations sur les fichiers indexés

 `PathwayVectorClient.get_vectorstore_statistics()` fournit des statistiques essentielles sur l'état du magasin de vecteurs, comme le nombre de fichiers indexés et l'horodatage du dernier fichier mis à jour. Vous pouvez l'utiliser dans vos chaînes pour informer l'utilisateur de la fraîcheur de votre base de connaissances.

```python
client.get_vectorstore_statistics()
```

## Votre propre pipeline

### Exécution en production

Pour avoir votre propre pipeline d'indexation de données Parcours, consultez l'offre de Parcours pour les [pipelines hébergés](https://pathway.com/solutions/ai-pipelines). Vous pouvez également exécuter votre propre pipeline Parcours - pour plus d'informations sur la construction du pipeline, reportez-vous au [guide Parcours](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/).

### Traitement des documents

Le pipeline de vectorisation prend en charge des composants enfichables pour l'analyse, la division et l'intégration des documents. Pour l'intégration et la division, vous pouvez utiliser les [composants Langchain](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/#langchain) ou consulter les [intégrateurs](https://pathway.com/developers/api-docs/pathway-xpacks-llm/embedders) et les [diviseurs](https://pathway.com/developers/api-docs/pathway-xpacks-llm/splitters) disponibles dans Parcours. Si aucun analyseur n'est fourni, il se défaut sur l'analyseur `UTF-8`. Vous pouvez trouver les analyseurs disponibles [ici](https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/parser.py).
