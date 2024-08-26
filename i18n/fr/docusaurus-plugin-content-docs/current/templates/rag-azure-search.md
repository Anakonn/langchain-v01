---
translated: true
---

# rag-azure-search

Ce modèle effectue un RAG (Retrieval Augmented Generation) sur des documents à l'aide d'[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) comme banque de vecteurs et des modèles de chat et d'intégration Azure OpenAI.

Pour plus de détails sur le RAG avec Azure AI Search, reportez-vous à [ce notebook](https://github.com/langchain-ai/langchain/blob/master/docs/docs/integrations/vectorstores/azuresearch.ipynb).

## Configuration de l'environnement

***Prérequis :*** Ressources [Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) et [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview) existantes.

***Variables d'environnement :***

Pour exécuter ce modèle, vous devrez définir les variables d'environnement suivantes :

***Obligatoires :***

- AZURE_SEARCH_ENDPOINT - Le point de terminaison du service Azure AI Search.
- AZURE_SEARCH_KEY - La clé API du service Azure AI Search.
- AZURE_OPENAI_ENDPOINT - Le point de terminaison du service Azure OpenAI.
- AZURE_OPENAI_API_KEY - La clé API du service Azure OpenAI.
- AZURE_EMBEDDINGS_DEPLOYMENT - Nom du déploiement Azure OpenAI à utiliser pour les intégrations.
- AZURE_CHAT_DEPLOYMENT - Nom du déploiement Azure OpenAI à utiliser pour le chat.

***Facultatives :***

- AZURE_SEARCH_INDEX_NAME - Nom d'un index Azure AI Search existant à utiliser. S'il n'est pas fourni, un index sera créé avec le nom "rag-azure-search".
- OPENAI_API_VERSION - Version de l'API Azure OpenAI à utiliser. Par défaut, "2023-05-15".

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-azure-search
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-azure-search
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_azure_search import chain as rag_azure_search_chain

add_routes(app, rag_azure_search_chain, path="/rag-azure-search")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-azure-search/playground](http://127.0.0.1:8000/rag-azure-search/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-azure-search")
```
