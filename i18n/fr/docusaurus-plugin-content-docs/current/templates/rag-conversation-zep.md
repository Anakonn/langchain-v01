---
translated: true
---

# rag-conversation-zep

Ce modèle démontre la construction d'une application de conversation RAG à l'aide de Zep.

Inclus dans ce modèle :
- Remplissage d'une [Collection de documents Zep](https://docs.getzep.com/sdk/documents/) avec un ensemble de documents (une Collection est analogue à un index dans d'autres bases de données vectorielles).
- Utilisation de la fonctionnalité d'[intégration intégrée](https://docs.getzep.com/deployment/embeddings/) de Zep pour intégrer les documents sous forme de vecteurs.
- Configuration d'un [Récupérateur de la base de données vectorielle ZepVectorStore](https://docs.getzep.com/sdk/documents/) LangChain pour récupérer les documents à l'aide du reclassement [Maximal Marginal Relevance](https://docs.getzep.com/sdk/search_query/) (MMR) intégré et accéléré par le matériel de Zep.
- Invites, une simple structure de données d'historique de discussion et d'autres composants nécessaires pour construire une application de conversation RAG.
- La chaîne de conversation RAG.

## À propos de [Zep - Blocs de construction rapides et évolutifs pour les applications LLM](https://www.getzep.com/)

Zep est une plateforme open source pour la production d'applications LLM. Passez d'un prototype construit dans LangChain ou LlamaIndex, ou d'une application personnalisée, à la production en quelques minutes sans réécrire de code.

Principales caractéristiques :

- Rapide ! Les extracteurs asynchrones de Zep fonctionnent indépendamment de votre boucle de discussion, assurant une expérience utilisateur réactive.
- Persistance de la mémoire à long terme, avec accès aux messages historiques indépendamment de votre stratégie de résumé.
- Résumé automatique des messages de mémoire en fonction d'une fenêtre de messages configurable. Une série de résumés sont stockés, offrant de la flexibilité pour les futures stratégies de résumé.
- Recherche hybride sur les souvenirs et les métadonnées, avec intégration automatique des messages lors de leur création.
- Extracteur d'entités qui extrait automatiquement les entités nommées des messages et les stocke dans les métadonnées des messages.
- Comptage automatique des jetons des souvenirs et des résumés, permettant un contrôle plus fin de l'assemblage des invites.
- Kits de développement logiciel Python et JavaScript.

Projet Zep : https://github.com/getzep/zep | Documentation : https://docs.getzep.com/

## Configuration de l'environnement

Configurez un service Zep en suivant le [Guide de démarrage rapide](https://docs.getzep.com/deployment/quickstart/).

## Ingestion de documents dans une Collection Zep

Exécutez `python ingest.py` pour ingérer les documents de test dans une Collection Zep. Examinez le fichier pour modifier le nom de la Collection et la source des documents.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-conversation-zep
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-conversation-zep
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_conversation_zep import chain as rag_conversation_zep_chain

add_routes(app, rag_conversation_zep_chain, path="/rag-conversation-zep")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-conversation-zep/playground](http://127.0.0.1:8000/rag-conversation-zep/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation-zep")
```
