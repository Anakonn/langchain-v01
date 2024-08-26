---
translated: true
---

# rag-chroma-private

Ce modèle effectue un RAG sans dépendre d'API externes.

Il utilise Ollama le LLM, GPT4All pour les embeddings et Chroma pour le vectorstore.

Le vectorstore est créé dans `chain.py` et indexe par défaut un [article de blog populaire sur les agents](https://lilianweng.github.io/posts/2023-06-23-agent/) pour la réponse aux questions.

## Configuration de l'environnement

Pour configurer l'environnement, vous devez télécharger Ollama.

Suivez les instructions [ici](https://python.langchain.com/docs/integrations/chat/ollama).

Vous pouvez choisir le LLM souhaité avec Ollama.

Ce modèle utilise `llama2:7b-chat`, accessible avec `ollama pull llama2:7b-chat`.

Il y a de nombreuses autres options disponibles [ici](https://ollama.ai/library).

Ce package utilise également les embeddings [GPT4All](https://python.langchain.com/docs/integrations/text_embedding/gpt4all).

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé la CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-chroma-private
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-chroma-private
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_chroma_private import chain as rag_chroma_private_chain

add_routes(app, rag_chroma_private_chain, path="/rag-chroma-private")
```

(Facultatif) Configurons maintenant LangSmith. LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain. Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/). Si vous n'avez pas accès, vous pouvez sauter cette section.

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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-chroma-private/playground](http://127.0.0.1:8000/rag-chroma-private/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-private")
```

Le package créera et ajoutera des documents à la base de données vectorielle dans `chain.py`. Par défaut, il chargera un article de blog populaire sur les agents. Cependant, vous pouvez choisir parmi un grand nombre de chargeurs de documents [ici](https://python.langchain.com/docs/integrations/document_loaders).
