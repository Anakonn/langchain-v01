---
translated: true
---

# assistant de recherche

Ce modèle met en œuvre une version de
[GPT Researcher](https://github.com/assafelovic/gpt-researcher) que vous pouvez utiliser
comme point de départ pour un agent de recherche.

## Configuration de l'environnement

Le modèle par défaut s'appuie sur ChatOpenAI et DuckDuckGo, vous aurez donc besoin de la
variable d'environnement suivante :

- `OPENAI_API_KEY`

Et pour utiliser le moteur de recherche optimisé pour les LLM de Tavily, vous aurez besoin de :

- `TAVILY_API_KEY`

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package research-assistant
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add research-assistant
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from research_assistant import chain as research_assistant_chain

add_routes(app, research_assistant_chain, path="/research-assistant")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur qui tourne localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/research-assistant/playground](http://127.0.0.1:8000/research-assistant/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/research-assistant")
```
