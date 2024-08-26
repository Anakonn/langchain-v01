---
translated: true
---

# Conversation sur l'échelle de temps rag

Ce modèle est utilisé pour la [récupération conversationnelle](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [de documents](https://python.langchain.com/docs/use_cases/question_answering/), qui est l'un des cas d'utilisation les plus populaires des modèles de langage.

Il transmet à la fois l'historique de la conversation et les documents récupérés à un modèle de langage pour la synthèse.

## Configuration de l'environnement

Ce modèle utilise Timescale Vector comme magasin de vecteurs et nécessite que `TIMESCALES_SERVICE_URL` soit défini. Inscrivez-vous pour un essai gratuit de 90 jours [ici](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) si vous n'avez pas encore de compte.

Pour charger l'ensemble de données d'exemple, définissez `LOAD_SAMPLE_DATA=1`. Pour charger votre propre ensemble de données, consultez la section ci-dessous.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-timescale-conversation
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-timescale-conversation
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_timescale_conversation import chain as rag_timescale_conversation_chain

add_routes(app, rag_timescale_conversation_chain, path="/rag-timescale_conversation")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-timescale-conversation/playground](http://127.0.0.1:8000/rag-timescale-conversation/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-conversation")
```

Voir le notebook `rag_conversation.ipynb` pour un exemple d'utilisation.

## Chargement de votre propre ensemble de données

Pour charger votre propre ensemble de données, vous devrez créer une fonction `load_dataset`. Vous pouvez voir un exemple dans la fonction `load_ts_git_dataset` définie dans le fichier `load_sample_dataset.py`. Vous pouvez ensuite l'exécuter en tant que fonction autonome (par exemple dans un script bash) ou l'ajouter à `chain.py` (mais dans ce cas, vous devriez l'exécuter une seule fois).
