---
translated: true
---

# elastic-query-generator

Ce modèle permet d'interagir avec les bases de données analytiques Elasticsearch en langage naturel à l'aide de LLM.

Il construit des requêtes de recherche via l'API Elasticsearch DSL (filtres et agrégations).

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

### Installation d'Elasticsearch

Il existe plusieurs façons d'exécuter Elasticsearch. Cependant, une méthode recommandée est via Elastic Cloud.

Créez un compte d'essai gratuit sur [Elastic Cloud](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=langserve).

Avec un déploiement, mettez à jour la chaîne de connexion.

Le mot de passe et la connexion (url elasticsearch) peuvent être trouvés sur la console de déploiement.

Notez que le client Elasticsearch doit avoir les autorisations pour la liste des index, la description du mappage et les requêtes de recherche.

### Remplissage avec des données

Si vous voulez remplir la base de données avec quelques informations d'exemple, vous pouvez exécuter `python ingest.py`.

Cela créera un index `customers`. Dans ce package, nous spécifions les index pour générer des requêtes, et nous spécifions `["customers"]`. Cela est spécifique à la configuration de votre index Elastic.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package elastic-query-generator
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add elastic-query-generator
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from elastic_query_generator.chain import chain as elastic_query_generator_chain

add_routes(app, elastic_query_generator_chain, path="/elastic-query-generator")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/elastic-query-generator/playground](http://127.0.0.1:8000/elastic-query-generator/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/elastic-query-generator")
```
