---
translated: true
---

# rag-gpt-crawler

Le GPT-crawler va explorer les sites Web pour produire des fichiers à utiliser dans des GPT personnalisés ou d'autres applications (RAG).

Ce modèle utilise [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) pour construire une application RAG

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Exploration

Exécutez GPT-crawler pour extraire le contenu d'un ensemble d'URL, en utilisant le fichier de configuration du dépôt GPT-crawler.

Voici un exemple de configuration pour le cas d'utilisation de la documentation LangChain :

```javascript
export const config: Config = {
  url: "https://python.langchain.com/docs/use_cases/",
  match: "https://python.langchain.com/docs/use_cases/**",
  selector: ".docMainContainer_gTbr",
  maxPagesToCrawl: 10,
  outputFileName: "output.json",
};
```

Ensuite, exécutez cela comme décrit dans le [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) README :

```shell
npm start
```

Et copiez le fichier `output.json` dans le dossier contenant ce README.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-gpt-crawler
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-gpt-crawler
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_chroma import chain as rag_gpt_crawler

add_routes(app, rag_gpt_crawler, path="/rag-gpt-crawler")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-gpt-crawler/playground](http://127.0.0.1:8000/rag-gpt-crawler/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gpt-crawler")
```
