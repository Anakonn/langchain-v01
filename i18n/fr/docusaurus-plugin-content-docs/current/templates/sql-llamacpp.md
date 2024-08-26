---
translated: true
---

# sql-llamacpp

Ce modèle permet à un utilisateur d'interagir avec une base de données SQL en utilisant un langage naturel.

Il utilise [Mistral-7b](https://mistral.ai/news/announcing-mistral-7b/) via [llama.cpp](https://github.com/ggerganov/llama.cpp) pour exécuter l'inférence localement sur un ordinateur portable Mac.

## Configuration de l'environnement

Pour configurer l'environnement, suivez les étapes suivantes :

```shell
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
conda create -n llama python=3.9.16
conda activate /Users/rlm/miniforge3/envs/llama
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package sql-llamacpp
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add sql-llamacpp
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from sql_llamacpp import chain as sql_llamacpp_chain

add_routes(app, sql_llamacpp_chain, path="/sql-llamacpp")
```

Le package téléchargera le modèle Mistral-7b à partir de [ici](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF). Vous pouvez sélectionner d'autres fichiers et spécifier leur chemin de téléchargement (parcourir [ici](https://huggingface.co/TheBloke)).

Ce package inclut un exemple de base de données des effectifs NBA 2023. Vous pouvez voir les instructions pour construire cette base de données [ici](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

(Facultatif) Configurez LangSmith pour la trace, la surveillance et le débogage des applications LangChain. Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/). Si vous n'avez pas accès, vous pouvez ignorer cette section.

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

Vous pouvez voir tous les modèles à l'adresse [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Vous pouvez accéder au playground à l'adresse [http://127.0.0.1:8000/sql-llamacpp/playground](http://127.0.0.1:8000/sql-llamacpp/playground)

Vous pouvez accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llamacpp")
```
