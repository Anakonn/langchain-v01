---
translated: true
---

# rag-ollama-multi-query

Ce modèle effectue un RAG (Retrieval Augmented Generation) à l'aide d'Ollama et d'OpenAI avec un récupérateur de requêtes multi-requêtes.

Le récupérateur de requêtes multi-requêtes est un exemple de transformation de requête, générant plusieurs requêtes à partir de différentes perspectives basées sur la requête d'entrée de l'utilisateur.

Pour chaque requête, il récupère un ensemble de documents pertinents et prend l'union unique de tous les résultats pour la synthèse de la réponse.

Nous utilisons un LLM local et privé pour la tâche étroite de génération de requêtes afin d'éviter les appels excessifs à une API LLM plus importante.

Voir un exemple de trace pour le LLM Ollama effectuant l'expansion de la requête [ici](https://smith.langchain.com/public/8017d04d-2045-4089-b47f-f2d66393a999/r).

Mais nous utilisons OpenAI pour la tâche plus difficile de synthèse de réponse (exemple de trace complète [ici](https://smith.langchain.com/public/ec75793b-645b-498d-b855-e8d85e1f6738/r))).

## Configuration de l'environnement

Pour configurer l'environnement, vous devez télécharger Ollama.

Suivez les instructions [ici](https://python.langchain.com/docs/integrations/chat/ollama).

Vous pouvez choisir le LLM souhaité avec Ollama.

Ce modèle utilise `zephyr`, qui peut être accédé en utilisant `ollama pull zephyr`.

Il y a de nombreuses autres options disponibles [ici](https://ollama.ai/library).

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord installer le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ce package, faites :

```shell
langchain app new my-app --package rag-ollama-multi-query
```

Pour ajouter ce package à un projet existant, exécutez :

```shell
langchain app add rag-ollama-multi-query
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_ollama_multi_query import chain as rag_ollama_multi_query_chain

add_routes(app, rag_ollama_multi_query_chain, path="/rag-ollama-multi-query")
```

(Facultatif) Maintenant, configurons LangSmith. LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain. Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/). Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur [http://localhost:8000](http://localhost:8000)

Vous pouvez voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Vous pouvez accéder au playground sur [http://127.0.0.1:8000/rag-ollama-multi-query/playground](http://127.0.0.1:8000/rag-ollama-multi-query/playground)

Pour accéder au modèle à partir du code, utilisez :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-ollama-multi-query")
```
