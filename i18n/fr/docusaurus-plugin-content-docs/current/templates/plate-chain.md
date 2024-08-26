---
translated: true
---

# plate-chain

Ce modèle permet l'analyse des données provenant de plaques de laboratoire.

Dans le contexte de la biochimie ou de la biologie moléculaire, les plaques de laboratoire sont des outils couramment utilisés pour contenir des échantillons dans un format de grille.

Cela peut analyser les données résultantes dans un format standardisé (par exemple, JSON) pour un traitement ultérieur.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser plate-chain, vous devez avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

La création d'un nouveau projet LangChain et l'installation de plate-chain comme seul package peuvent être effectuées avec :

```shell
langchain app new my-app --package plate-chain
```

Si vous souhaitez l'ajouter à un projet existant, exécutez simplement :

```shell
langchain app add plate-chain
```

Ensuite, ajoutez le code suivant à votre fichier `server.py` :

```python
from plate_chain import chain as plate_chain

add_routes(app, plate_chain, path="/plate-chain")
```

(Facultatif) Pour configurer LangSmith, qui aide à tracer, surveiller et déboguer les applications LangChain, utilisez le code suivant :

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez démarrer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarre l'application FastAPI avec un serveur s'exécutant localement sur
[http://localhost:8000](http://localhost:8000)

Tous les modèles peuvent être consultés sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Accédez au playground sur [http://127.0.0.1:8000/plate-chain/playground](http://127.0.0.1:8000/plate-chain/playground)

Vous pouvez accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/plate-chain")
```
