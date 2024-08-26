---
translated: true
---

# rag-google-cloud-vertexai-search

Ce modèle est une application qui utilise Google Vertex AI Search, un service de recherche alimenté par l'apprentissage automatique, et PaLM 2 pour Chat (chat-bison). L'application utilise une chaîne de récupération pour répondre aux questions basées sur vos documents.

Pour plus d'informations sur la construction d'applications RAG avec Vertex AI Search, consultez [ici](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction).

## Configuration de l'environnement

Avant d'utiliser ce modèle, assurez-vous d'être authentifié avec Vertex AI Search. Consultez le guide d'authentification : [ici](https://cloud.google.com/generative-ai-app-builder/docs/authentication).

Vous devrez également créer :

- Une application de recherche [ici](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es)
- Un magasin de données [ici](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)

Un jeu de données approprié pour tester ce modèle est les rapports de résultats d'Alphabet, que vous pouvez trouver [ici](https://abc.xyz/investor/). Les données sont également disponibles sur `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs`.

Définissez les variables d'environnement suivantes :

* `GOOGLE_CLOUD_PROJECT_ID` - L'ID de votre projet Google Cloud.
* `DATA_STORE_ID` - L'ID du magasin de données dans Vertex AI Search, qui est une valeur alphanumérique de 36 caractères trouvée sur la page des détails du magasin de données.
* `MODEL_TYPE` - Le type de modèle pour Vertex AI Search.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-google-cloud-vertexai-search
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-google-cloud-vertexai-search
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_google_cloud_vertexai_search.chain import chain as rag_google_cloud_vertexai_search_chain

add_routes(app, rag_google_cloud_vertexai_search_chain, path="/rag-google-cloud-vertexai-search")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez sauter cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground
sur [http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-vertexai-search")
```
