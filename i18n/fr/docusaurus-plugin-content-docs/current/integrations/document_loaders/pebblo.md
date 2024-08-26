---
translated: true
---

# Chargeur de documents sécurisé Pebblo

> [Pebblo](https://daxa-ai.github.io/pebblo/) permet aux développeurs de charger des données en toute sécurité et de promouvoir leur application Gen AI vers le déploiement sans se soucier des exigences de conformité et de sécurité de l'organisation. Le projet identifie les sujets sémantiques et les entités trouvées dans les données chargées et les résume dans l'interface utilisateur ou dans un rapport PDF.

Pebblo a deux composants.

1. Chargeur de documents sécurisé Pebblo pour Langchain
1. Serveur Pebblo

Ce document décrit comment augmenter votre chargeur de documents Langchain existant avec le chargeur de documents sécurisé Pebblo pour obtenir une visibilité approfondie des types de sujets et d'entités ingérés dans l'application Langchain Gen-AI. Pour plus de détails sur le `serveur Pebblo`, consultez ce document [serveur pebblo](https://daxa-ai.github.io/pebblo/daemon).

Le chargeur de documents sécurisé Pebblo permet une ingestion de données sécurisée pour le `chargeur de documents` Langchain. Cela se fait en enveloppant l'appel du chargeur de documents avec le `chargeur de documents sécurisé Pebblo`.

Remarque : pour configurer le serveur pebblo sur une URL autre que l'URL par défaut (localhost:8000), mettez l'URL correcte dans la variable d'environnement `PEBBLO_CLASSIFIER_URL`. Cela est également configurable à l'aide de l'argument de mot-clé `classifier_url`. Réf : [configurations du serveur](https://daxa-ai.github.io/pebblo/config)

#### Comment activer le chargement de documents Pebblo ?

Supposons un extrait d'application Langchain RAG utilisant `CSVLoader` pour lire un document CSV pour l'inférence.

Voici l'extrait du chargement de documents à l'aide de `CSVLoader`.

```python
from langchain.document_loaders.csv_loader import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

Le chargeur de documents sécurisé Pebblo peut être activé avec quelques lignes de modification de code par rapport à l'extrait ci-dessus.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### Envoyer les sujets sémantiques et les identités à Pebblo cloud server

Pour envoyer les données sémantiques à Pebblo-cloud, transmettez la clé API à PebbloSafeLoader en tant qu'argument ou, alternativement, placez la clé API dans la variable d'environnement `PEBBLO_API_KEY`.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### Ajouter des sujets sémantiques et des identités aux métadonnées chargées

Pour ajouter des sujets sémantiques et des entités sémantiques aux métadonnées des documents chargés, définissez `load_semantic` sur True en tant qu'argument ou, alternativement, définissez une nouvelle variable d'environnement `PEBBLO_LOAD_SEMANTIC` et définissez-la sur True.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```
