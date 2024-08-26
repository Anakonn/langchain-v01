---
translated: true
---

# cassandra-synonym-caching

Ce modèle fournit un modèle de chaîne simple illustrant l'utilisation de la mise en cache LLM (Language Model) soutenue par Apache Cassandra® ou Astra DB via CQL.

## Configuration de l'environnement

Pour configurer votre environnement, vous aurez besoin de ce qui suit :

- une base de données vectorielle [Astra](https://astra.datastax.com) (le niveau gratuit convient !). **Vous avez besoin d'un [jeton d'administrateur de base de données](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)**, en particulier la chaîne commençant par `AstraCS:...` ;
- de même, préparez votre [ID de base de données](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier), vous devrez le saisir ci-dessous ;
- une **clé API OpenAI**. (Plus d'informations [ici](https://cassio.org/start_here/#llm-access), notez que ce démo prend en charge OpenAI par défaut, sauf si vous modifiez le code.)

_Remarque :_ vous pouvez également utiliser un cluster Cassandra régulier : pour ce faire, assurez-vous de fournir l'entrée `USE_CASSANDRA_CLUSTER` comme indiqué dans `.env.template` et les variables d'environnement suivantes pour spécifier comment vous y connecter.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package cassandra-synonym-caching
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add cassandra-synonym-caching
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from cassandra_synonym_caching import chain as cassandra_synonym_caching_chain

add_routes(app, cassandra_synonym_caching_chain, path="/cassandra-synonym-caching")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/cassandra-synonym-caching/playground](http://127.0.0.1:8000/cassandra-synonym-caching/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-synonym-caching")
```

## Référence

Référentiel de modèle LangServe autonome : [ici](https://github.com/hemidactylus/langserve_cassandra_synonym_caching).
