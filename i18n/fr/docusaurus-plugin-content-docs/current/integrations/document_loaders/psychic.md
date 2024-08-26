---
translated: true
---

# Psychique

Ce cahier couvre comment charger des documents à partir de `Psychic`. Voir [ici](/docs/integrations/providers/psychic) pour plus de détails.

## Prérequis

1. Suivez la section Démarrage rapide dans [ce document](/docs/integrations/providers/psychic)
2. Connectez-vous au [tableau de bord Psychic](https://dashboard.psychic.dev/) et obtenez votre clé secrète
3. Installez la bibliothèque réactive frontend dans votre application web et faites authentifier une connexion par un utilisateur. La connexion sera créée en utilisant l'ID de connexion que vous avez spécifié.

## Chargement des documents

Utilisez la classe `PsychicLoader` pour charger des documents à partir d'une connexion. Chaque connexion a un ID de connecteur (correspondant à l'application SaaS qui a été connectée) et un ID de connexion (que vous avez passé à la bibliothèque frontend).

```python
# Uncomment this to install psychicapi if you don't already have it installed
!poetry run pip -q install psychicapi langchain-chroma
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.document_loaders import PsychicLoader
from psychicapi import ConnectorId

# Create a document loader for google drive. We can also load from other connectors by setting the connector_id to the appropriate value e.g. ConnectorId.notion.value
# This loader uses our test credentials
google_drive_loader = PsychicLoader(
    api_key="7ddb61c1-8b6a-4d31-a58e-30d1c9ea480e",
    connector_id=ConnectorId.gdrive.value,
    connection_id="google-test",
)

documents = google_drive_loader.load()
```

## Conversion des documents en embeddings

Nous pouvons maintenant convertir ces documents en embeddings et les stocker dans une base de données vectorielle comme Chroma

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
docsearch = Chroma.from_documents(texts, embeddings)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
chain({"question": "what is psychic?"}, return_only_outputs=True)
```
