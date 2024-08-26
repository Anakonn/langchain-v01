---
translated: true
---

# agent-de-sollicitation-de-performance-solo

Ce modèle crée un agent qui transforme un seul LLM en un synergiste cognitif en s'engageant dans une auto-collaboration à plusieurs tours avec plusieurs personnages.
Un synergiste cognitif fait référence à un agent intelligent qui collabore avec plusieurs esprits, combinant leurs forces et leurs connaissances individuelles, pour améliorer la résolution de problèmes et les performances globales dans des tâches complexes. En identifiant et en simulant dynamiquement différents personnages en fonction des entrées de la tâche, SPP libère le potentiel de la synergie cognitive dans les LLM.

Ce modèle utilisera l'API de recherche `DuckDuckGo`.

## Configuration de l'environnement

Ce modèle utilisera `OpenAI` par défaut.
Assurez-vous que `OPENAI_API_KEY` est défini dans votre environnement.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package solo-performance-prompting-agent
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add solo-performance-prompting-agent
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from solo_performance_prompting_agent.agent import agent_executor as solo_performance_prompting_agent_chain

add_routes(app, solo_performance_prompting_agent_chain, path="/solo-performance-prompting-agent")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/solo-performance-prompting-agent/playground](http://127.0.0.1:8000/solo-performance-prompting-agent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/solo-performance-prompting-agent")
```
