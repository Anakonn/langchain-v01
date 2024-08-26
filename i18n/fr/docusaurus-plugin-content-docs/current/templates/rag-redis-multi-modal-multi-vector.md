---
translated: true
---

# rag-redis-multi-modal-multi-vector

Les LLM multimodaux permettent la création d'assistants visuels capables de répondre à des questions sur les images.

Ce modèle crée un assistant visuel pour les présentations, qui contiennent souvent des éléments visuels tels que des graphiques ou des figures.

Il utilise GPT-4V pour créer des résumés d'images pour chaque diapositive, les intègre et les stocke dans Redis.

Étant donné une question, les diapositives pertinentes sont récupérées et transmises à GPT-4V pour la synthèse de la réponse.

## Entrée

Fournissez un jeu de diapositives au format PDF dans le répertoire `/docs`.

Par défaut, ce modèle contient un jeu de diapositives sur les résultats récents de NVIDIA.

Exemples de questions à poser :

```text
1/ how much can H100 TensorRT improve LLama2 inference performance?
2/ what is the % change in GPU accelerated applications from 2020 to 2023?
```

Pour créer un index du jeu de diapositives, exécutez :

```shell
poetry install
poetry shell
python ingest.py
```

## Stockage

Voici le processus que le modèle utilisera pour créer un index des diapositives (voir [blog](https://blog.langchain.dev/multi-modal-rag-template/))) :

* Extraire les diapositives sous forme de collection d'images
* Utiliser GPT-4V pour résumer chaque image
* Intégrer les résumés d'images à l'aide d'embeddings de texte avec un lien vers les images d'origine
* Récupérer les images pertinentes en fonction de la similarité entre le résumé de l'image et la question d'entrée de l'utilisateur
* Transmettre ces images à GPT-4V pour la synthèse de la réponse

### Redis

Ce modèle utilise [Redis](https://redis.com) pour alimenter le [MultiVectorRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/multi_vector), notamment :
- Redis comme [VectorStore](https://python.langchain.com/docs/integrations/vectorstores/redis) (pour stocker et indexer les embeddings des résumés d'images)
- Redis comme [ByteStore](https://python.langchain.com/docs/integrations/stores/redis) (pour stocker les images)

Assurez-vous de déployer une instance Redis soit dans le [cloud](https://redis.com/try-free) (gratuit), soit localement avec [docker](https://redis.io/docs/install/install-stack/docker/).

Cela vous donnera un point de terminaison Redis accessible que vous pourrez utiliser comme URL. Si vous le déployez localement, utilisez simplement `redis://localhost:6379`.

## LLM

L'application récupérera les images en fonction de la similarité entre l'entrée textuelle et le résumé de l'image (texte), puis transmettra les images à GPT-4V pour la synthèse de la réponse.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder à OpenAI GPT-4V.

Définissez la variable d'environnement `REDIS_URL` pour accéder à votre base de données Redis.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ce package comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-redis-multi-modal-multi-vector
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-redis-multi-modal-multi-vector
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_redis_multi_modal_multi_vector import chain as rag_redis_multi_modal_chain_mv

add_routes(app, rag_redis_multi_modal_chain_mv, path="/rag-redis-multi-modal-multi-vector")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis-multi-modal-multi-vector")
```
