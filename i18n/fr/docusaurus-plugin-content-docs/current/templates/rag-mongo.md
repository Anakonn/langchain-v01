---
translated: true
---

# rag-mongo

Ce modèle effectue un RAG (Résumé Automatique Généré) à l'aide de MongoDB et d'OpenAI.

## Configuration de l'environnement

Vous devez exporter deux variables d'environnement, l'une étant votre URI MongoDB, l'autre étant votre clé API OpenAI.
Si vous n'avez pas d'URI MongoDB, consultez la section `Configuration de MongoDB` ci-dessous pour obtenir des instructions sur la façon de le faire.

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-mongo
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-mongo
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_mongo import chain as rag_mongo_chain

add_routes(app, rag_mongo_chain, path="/rag-mongo")
```

Si vous voulez configurer un pipeline d'ingestion, vous pouvez ajouter le code suivant à votre fichier `server.py` :

```python
from rag_mongo import ingest as rag_mongo_ingest

add_routes(app, rag_mongo_ingest, path="/rag-mongo-ingest")
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

Si vous n'avez PAS déjà un index de recherche MongoDB auquel vous voulez vous connecter, consultez la section `Configuration de MongoDB` ci-dessous avant de continuer.

Si vous avez un index de recherche MongoDB auquel vous voulez vous connecter, modifiez les détails de connexion dans `rag_mongo/chain.py`.

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-mongo/playground](http://127.0.0.1:8000/rag-mongo/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-mongo")
```

Pour plus de contexte, veuillez vous référer [à ce notebook](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB).

## Configuration de MongoDB

Utilisez cette étape si vous devez configurer votre compte MongoDB et ingérer des données.
Nous suivrons d'abord les instructions standard de configuration de MongoDB Atlas [ici](https://www.mongodb.com/docs/atlas/getting-started/).

1. Créez un compte (si ce n'est pas déjà fait)
2. Créez un nouveau projet (si ce n'est pas déjà fait)
3. Localisez votre URI MongoDB.

Cela peut se faire en allant sur la page de présentation du déploiement et en vous connectant à votre base de données.

Nous regardons ensuite les pilotes disponibles.

Parmi lesquels nous verrons notre URI répertoriée.

Définissons-la alors comme une variable d'environnement locale :

```shell
export MONGO_URI=...
```

4. Définissons également une variable d'environnement pour OpenAI (que nous utiliserons comme LLM)

```shell
export OPENAI_API_KEY=...
```

5. Ingérons maintenant quelques données ! Nous pouvons le faire en nous déplaçant dans ce répertoire et en exécutant le code dans `ingest.py`, par exemple :

```shell
python ingest.py
```

Notez que vous pouvez (et devriez !) changer cela pour ingérer les données de votre choix.

6. Nous devons maintenant configurer un index vectoriel sur nos données.

Nous pouvons d'abord nous connecter au cluster où se trouve notre base de données.

Nous pouvons ensuite naviguer jusqu'à l'endroit où se trouvent toutes nos collections.

Nous pouvons alors trouver la collection que nous voulons et examiner les index de recherche de cette collection.

Celui-ci sera probablement vide, et nous voulons en créer un nouveau :

Nous utiliserons l'éditeur JSON pour le créer.

Et nous collerons le JSON suivant :

```text
 {
   "mappings": {
     "dynamic": true,
     "fields": {
       "embedding": {
         "dimensions": 1536,
         "similarity": "cosine",
         "type": "knnVector"
       }
     }
   }
 }
```

De là, cliquez sur "Suivant" puis sur "Créer l'index de recherche". Cela prendra un peu de temps, mais vous devriez alors avoir un index sur vos données !
