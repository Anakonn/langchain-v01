---
translated: true
---

# Vespa

>[Vespa](https://vespa.ai/) est un moteur de recherche et une base de données vectorielle entièrement fonctionnels. Il prend en charge la recherche vectorielle (ANN), la recherche lexicale et la recherche dans les données structurées, le tout dans la même requête.

Ce notebook montre comment utiliser `Vespa.ai` en tant que récupérateur LangChain.

Afin de créer un récupérateur, nous utilisons [pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) pour
créer une connexion à un service `Vespa`.

```python
%pip install --upgrade --quiet  pyvespa
```

```python
from vespa.application import Vespa

vespa_app = Vespa(url="https://doc-search.vespa.oath.cloud")
```

Cela crée une connexion à un service `Vespa`, ici le service de recherche de la documentation Vespa.
En utilisant le package `pyvespa`, vous pouvez également vous connecter à une
[instance Vespa Cloud](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
ou à une
[instance Docker locale](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html).

Après vous être connecté au service, vous pouvez configurer le récupérateur :

```python
from langchain_community.retrievers import VespaRetriever

vespa_query_body = {
    "yql": "select content from paragraph where userQuery()",
    "hits": 5,
    "ranking": "documentation",
    "locale": "en-us",
}
vespa_content_field = "content"
retriever = VespaRetriever(vespa_app, vespa_query_body, vespa_content_field)
```

Cela configure un récupérateur LangChain qui récupère des documents à partir de l'application Vespa.
Ici, jusqu'à 5 résultats sont récupérés à partir du champ `content` dans le type de document `paragraph`,
en utilisant `doumentation` comme méthode de classement. Le `userQuery()` est remplacé par la requête réelle
transmise par LangChain.

Veuillez vous référer à la [documentation pyvespa](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
pour plus d'informations.

Vous pouvez maintenant renvoyer les résultats et continuer à les utiliser dans LangChain.

```python
retriever.invoke("what is vespa?")
```
