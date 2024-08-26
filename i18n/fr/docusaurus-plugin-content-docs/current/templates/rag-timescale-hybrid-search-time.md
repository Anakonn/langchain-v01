---
translated: true
---

# RAG avec Timescale Vector utilisant une recherche hybride

Ce modèle montre comment utiliser timescale-vector avec le récupérateur de requêtes automatiques pour effectuer une recherche hybride sur la similarité et le temps.
Cela est utile chaque fois que vos données ont une forte composante temporelle. Voici quelques exemples de telles données :
- Articles d'actualité (politique, économie, etc.)
- Articles de blog, documentation ou autre matériel publié (public ou privé).
- Messages sur les réseaux sociaux
- Journaux des modifications de tout type
- Messages

Ces éléments sont souvent recherchés à la fois par similarité et par temps. Par exemple : Montrez-moi toutes les nouvelles sur les camions Toyota de 2022.

[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) offre des performances supérieures lors de la recherche d'embeddings dans un cadre temporel particulier en tirant parti du partitionnement automatique des tables pour isoler les données pour des plages de temps spécifiques.

Le récupérateur de requêtes automatiques de Langchain permet de déduire les plages de temps (ainsi que d'autres critères de recherche) à partir du texte des requêtes des utilisateurs.

## Qu'est-ce que Timescale Vector ?

**[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) est PostgreSQL++ pour les applications d'IA.**

Timescale Vector vous permet de stocker et de requêter efficacement des milliards d'embeddings vectoriels dans `PostgreSQL`.
- Améliore `pgvector` avec une recherche de similarité plus rapide et plus précise sur 1 milliard+ de vecteurs via un algorithme d'indexation inspiré de DiskANN.
- Permet une recherche rapide de vecteurs en fonction du temps grâce au partitionnement et à l'indexation automatiques en fonction du temps.
- Fournit une interface SQL familière pour interroger les embeddings vectoriels et les données relationnelles.

Timescale Vector est PostgreSQL cloud pour l'IA qui évolue avec vous de la POC à la production :
- Simplifie les opérations en vous permettant de stocker les métadonnées relationnelles, les embeddings vectoriels et les données de série temporelle dans une seule base de données.
- Bénéficie de la base solide de PostgreSQL avec des fonctionnalités d'entreprise comme les sauvegardes en continu et la réplication, la haute disponibilité et la sécurité au niveau des lignes.
- Permet une expérience sans souci avec une sécurité et une conformité de niveau entreprise.

### Comment accéder à Timescale Vector

Timescale Vector est disponible sur [Timescale](https://www.timescale.com/products?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral), la plateforme PostgreSQL cloud. (Il n'y a pas de version auto-hébergée pour le moment.)

- Les utilisateurs de LangChain bénéficient d'un essai gratuit de 90 jours pour Timescale Vector.
- Pour commencer, [inscrivez-vous](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) sur Timescale, créez une nouvelle base de données et suivez ce notebook !
- Consultez les [instructions d'installation](https://github.com/timescale/python-vector) pour plus de détails sur l'utilisation de Timescale Vector en python.

## Configuration de l'environnement

Ce modèle utilise Timescale Vector comme vectorstore et nécessite que `TIMESCALES_SERVICE_URL` soit défini. Inscrivez-vous à un essai gratuit de 90 jours [ici](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) si vous n'avez pas encore de compte.

Pour charger l'ensemble de données d'exemple, définissez `LOAD_SAMPLE_DATA=1`. Pour charger votre propre ensemble de données, consultez la section ci-dessous.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-timescale-hybrid-search-time
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-timescale-hybrid-search-time
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_timescale_hybrid_search.chain import chain as rag_timescale_hybrid_search_chain

add_routes(app, rag_timescale_hybrid_search_chain, path="/rag-timescale-hybrid-search")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-timescale-hybrid-search/playground](http://127.0.0.1:8000/rag-timescale-hybrid-search/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-hybrid-search")
```

## Chargement de votre propre ensemble de données

Pour charger votre propre ensemble de données, vous devrez modifier le code dans la section `DATASET SPECIFIC CODE` de `chain.py`.
Ce code définit le nom de la collection, comment charger les données et la description en langue naturelle à la fois du
contenu de la collection et de toutes les métadonnées. Les descriptions en langue naturelle sont utilisées par le récupérateur de requêtes automatiques
pour aider le LLM à convertir la question en filtres sur les métadonnées lors de la recherche des données dans Timescale-vector.
