---
translated: true
---

# squelette-de-la-pensée

Implémente le "Squelette de la Pensée" à partir [de ce](https://sites.google.com/view/sot-llm) document.

Cette technique permet de générer des générations plus longues plus rapidement en générant d'abord un squelette, puis en générant chaque point de l'aperçu.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Pour obtenir votre `OPENAI_API_KEY`, accédez à [Clés API](https://platform.openai.com/account/api-keys) sur votre compte OpenAI et créez une nouvelle clé secrète.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package skeleton-of-thought
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add skeleton-of-thought
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from skeleton_of_thought import chain as skeleton_of_thought_chain

add_routes(app, skeleton_of_thought_chain, path="/skeleton-of-thought")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/skeleton-of-thought/playground](http://127.0.0.1:8000/skeleton-of-thought/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/skeleton-of-thought")
```
