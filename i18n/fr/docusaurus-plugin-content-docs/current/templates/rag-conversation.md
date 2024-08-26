---
translated: true
---

# rag-conversation

Ce modèle est utilisé pour [conversationnel](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [recherche](https://python.langchain.com/docs/use_cases/question_answering/), qui est l'un des cas d'utilisation LLM les plus populaires.

Il passe à la fois un historique de conversation et des documents récupérés dans un LLM pour synthèse.

## Configuration de l'environnement

Ce modèle utilise Pinecone comme vectorstore et nécessite que `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` et `PINECONE_INDEX` soient définis.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et l'installer comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-conversation
```

Si vous souhaitez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-conversation
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_conversation import chain as rag_conversation_chain

add_routes(app, rag_conversation_chain, path="/rag-conversation")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez passer cette section

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur fonctionnant localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-conversation/playground](http://127.0.0.1:8000/rag-conversation/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation")
```
