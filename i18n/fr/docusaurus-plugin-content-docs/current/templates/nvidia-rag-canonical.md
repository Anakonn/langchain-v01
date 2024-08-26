---
translated: true
---

# nvidia-rag-canonical

Ce modèle effectue un RAG (Retrieval Augmented Generation) à l'aide du Milvus Vector Store et des modèles NVIDIA (Embedding et Chat).

## Configuration de l'environnement

Vous devez exporter votre clé API NVIDIA en tant que variable d'environnement.
Si vous n'avez pas de clé API NVIDIA, vous pouvez en créer une en suivant ces étapes :
1. Créez un compte gratuit avec le service [NVIDIA GPU Cloud](https://catalog.ngc.nvidia.com/), qui héberge des catalogues de solutions IA, des conteneurs, des modèles, etc.
2. Accédez à `Catalog > AI Foundation Models > (Modèle avec point de terminaison API)`.
3. Sélectionnez l'option `API` et cliquez sur `Générer une clé`.
4. Enregistrez la clé générée sous `NVIDIA_API_KEY`. À partir de là, vous devriez avoir accès aux points de terminaison.

```shell
export NVIDIA_API_KEY=...
```

Pour obtenir des instructions sur l'hébergement du Milvus Vector Store, reportez-vous à la section ci-dessous.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour utiliser les modèles NVIDIA, installez le package LangChain NVIDIA AI Endpoints :

```shell
pip install -U langchain_nvidia_aiplay
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package nvidia-rag-canonical
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add nvidia-rag-canonical
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from nvidia_rag_canonical import chain as nvidia_rag_canonical_chain

add_routes(app, nvidia_rag_canonical_chain, path="/nvidia-rag-canonical")
```

Si vous voulez configurer un pipeline d'ingestion, vous pouvez ajouter le code suivant à votre fichier `server.py` :

```python
from nvidia_rag_canonical import ingest as nvidia_rag_ingest

add_routes(app, nvidia_rag_ingest, path="/nvidia-rag-ingest")
```

Notez que pour les fichiers ingérés par l'API d'ingestion, le serveur devra être redémarré pour que les nouveaux fichiers ingérés soient accessibles par le récupérateur.

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous n'avez PAS déjà un Milvus Vector Store auquel vous voulez vous connecter, consultez la section `Configuration de Milvus` ci-dessous avant de continuer.

Si vous avez un Milvus Vector Store auquel vous voulez vous connecter, modifiez les détails de connexion dans `nvidia_rag_canonical/chain.py`.

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/nvidia-rag-canonical/playground](http://127.0.0.1:8000/nvidia-rag-canonical/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/nvidia-rag-canonical")
```

## Configuration de Milvus

Utilisez cette étape si vous devez créer un Milvus Vector Store et ingérer des données.
Nous suivrons d'abord les instructions standard de configuration de Milvus [ici](https://milvus.io/docs/install_standalone-docker.md).

1. Téléchargez le fichier YAML Docker Compose.
    ```shell
    wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml
    ```
2. Démarrez le conteneur Milvus Vector Store
    ```shell
    sudo docker compose up -d
    ```
3. Installez le package PyMilvus pour interagir avec le conteneur Milvus.
    ```shell
    pip install pymilvus
    ```
4. Ingérons maintenant quelques données ! Nous pouvons le faire en nous déplaçant dans ce répertoire et en exécutant le code dans `ingest.py`, par exemple :

    ```shell
    python ingest.py
    ```

    Notez que vous pouvez (et devriez !) modifier cela pour ingérer les données de votre choix.
