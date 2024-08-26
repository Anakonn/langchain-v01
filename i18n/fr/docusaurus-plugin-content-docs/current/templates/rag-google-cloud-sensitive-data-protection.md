---
translated: true
---

# rag-google-cloud-sensitive-data-protection

Ce modèle est une application qui utilise Google Vertex AI Search, un service de recherche alimenté par l'apprentissage automatique, et PaLM 2 pour Chat (chat-bison). L'application utilise une chaîne de récupération pour répondre aux questions basées sur vos documents.

Ce modèle est une application qui utilise Google Sensitive Data Protection, un service pour détecter et redacter les données sensibles dans le texte, et PaLM 2 pour Chat (chat-bison), bien que vous puissiez utiliser n'importe quel modèle.

Pour plus d'informations sur l'utilisation de Sensitive Data Protection, consultez [ici](https://cloud.google.com/dlp/docs/sensitive-data-protection-overview).

## Configuration de l'environnement

Avant d'utiliser ce modèle, assurez-vous d'activer l'[API DLP](https://console.cloud.google.com/marketplace/product/google/dlp.googleapis.com) et l'[API Vertex AI](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com) dans votre projet Google Cloud.

Pour certaines étapes de dépannage courantes liées à Google Cloud, consultez la fin de ce readme.

Définissez les variables d'environnement suivantes :

* `GOOGLE_CLOUD_PROJECT_ID` - L'ID de votre projet Google Cloud.
* `MODEL_TYPE` - Le type de modèle pour Vertex AI Search (par exemple, `chat-bison`)

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-google-cloud-sensitive-data-protection
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-google-cloud-sensitive-data-protection
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_google_cloud_sensitive_data_protection.chain import chain as rag_google_cloud_sensitive_data_protection_chain

add_routes(app, rag_google_cloud_sensitive_data_protection_chain, path="/rag-google-cloud-sensitive-data-protection")
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

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-sensitive-data-protection")
```

# Dépannage Google Cloud

Vous pouvez définir vos identifiants `gcloud` avec leur interface en ligne de commande en utilisant `gcloud auth application-default login`

Vous pouvez définir votre projet `gcloud` avec les commandes suivantes :

```bash
gcloud config set project <your project>
gcloud auth application-default set-quota-project <your project>
export GOOGLE_CLOUD_PROJECT_ID=<your project>
```
