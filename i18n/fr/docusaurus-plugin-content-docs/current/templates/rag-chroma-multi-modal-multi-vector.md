---
translated: true
---

# rag-chroma-multi-modal-multi-vector

Les LLM multimodaux permettent aux assistants visuels d'effectuer des questions-réponses sur les images.

Ce modèle crée un assistant visuel pour les présentations, qui contiennent souvent des éléments visuels tels que des graphiques ou des figures.

Il utilise GPT-4V pour créer des résumés d'images pour chaque diapositive, les intègre et les stocke dans Chroma.

Étant donné une question, les diapositives pertinentes sont récupérées et transmises à GPT-4V pour la synthèse de la réponse.

## Entrée

Fournissez un jeu de diapositives au format pdf dans le répertoire `/docs`.

Par défaut, ce modèle a un jeu de diapositives sur les résultats du troisième trimestre de DataDog, une entreprise technologique publique.

Exemples de questions à poser :

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

Pour créer un index du jeu de diapositives, exécutez :

```shell
poetry install
python ingest.py
```

## Stockage

Voici le processus que le modèle utilisera pour créer un index des diapositives (voir [blog](https://blog.langchain.dev/multi-modal-rag-template/))) :

* Extraire les diapositives sous forme de collection d'images
* Utiliser GPT-4V pour résumer chaque image
* Intégrer les résumés d'images à l'aide d'embeddings de texte avec un lien vers les images d'origine
* Récupérer les images pertinentes en fonction de la similarité entre le résumé de l'image et la question d'entrée de l'utilisateur
* Transmettre ces images à GPT-4V pour la synthèse de la réponse

Par défaut, cela utilisera [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) pour stocker les images et Chroma pour stocker les résumés.

Pour la production, il peut être souhaitable d'utiliser une option distante comme Redis.

Vous pouvez définir le paramètre `local_file_store` dans `chain.py` et `ingest.py` pour basculer entre les deux options.

Pour Redis, le modèle utilisera [UpstashRedisByteStore](https://python.langchain.com/docs/integrations/stores/upstash_redis).

Nous utiliserons Upstash pour stocker les images, qui offre Redis avec une API REST.

Connectez-vous [ici](https://upstash.com/) et créez une base de données.

Cela vous donnera une API REST avec :

* `UPSTASH_URL`
* `UPSTASH_TOKEN`

Définissez `UPSTASH_URL` et `UPSTASH_TOKEN` en tant que variables d'environnement pour accéder à votre base de données.

Nous utiliserons Chroma pour stocker et indexer les résumés d'images, qui seront créés localement dans le répertoire du modèle.

## LLM

L'application récupérera les images en fonction de la similarité entre l'entrée textuelle et le résumé de l'image, et les transmettra à GPT-4V.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder à OpenAI GPT-4V.

Définissez `UPSTASH_URL` et `UPSTASH_TOKEN` en tant que variables d'environnement pour accéder à votre base de données si vous utilisez `UpstashRedisByteStore`.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-chroma-multi-modal-multi-vector
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-chroma-multi-modal-multi-vector
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_chroma_multi_modal_multi_vector import chain as rag_chroma_multi_modal_chain_mv

add_routes(app, rag_chroma_multi_modal_chain_mv, path="/rag-chroma-multi-modal-multi-vector")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal-multi-vector")
```
