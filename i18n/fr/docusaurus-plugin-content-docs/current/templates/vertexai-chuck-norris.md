---
translated: true
---

# vertexai-chuck-norris

Ce modèle fait des blagues sur Chuck Norris en utilisant Vertex AI PaLM2.

## Configuration de l'environnement

Tout d'abord, assurez-vous d'avoir un projet Google Cloud avec un compte de facturation actif et d'avoir installé l'interface en ligne de commande [gcloud](https://cloud.google.com/sdk/docs/install).

Configurez les [identifiants d'application par défaut](https://cloud.google.com/docs/authentication/provide-credentials-adc) :

```shell
gcloud auth application-default login
```

Pour définir un projet Google Cloud par défaut à utiliser, exécutez cette commande et définissez l'[ID du projet](https://support.google.com/googleapi/answer/7014113?hl=en) du projet que vous souhaitez utiliser :

```shell
gcloud config set project [PROJECT-ID]
```

Activez l'[API Vertex AI](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) pour le projet :

```shell
gcloud services enable aiplatform.googleapis.com
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package pirate-speak
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add vertexai-chuck-norris
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from vertexai_chuck_norris.chain import chain as vertexai_chuck_norris_chain

add_routes(app, vertexai_chuck_norris_chain, path="/vertexai-chuck-norris")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/vertexai-chuck-norris/playground](http://127.0.0.1:8000/vertexai-chuck-norris/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/vertexai-chuck-norris")
```
