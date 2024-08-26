---
translated: true
---

# Amazon Neptune avec Cypher

>[Amazon Neptune](https://aws.amazon.com/neptune/) est une base de données analytique de graphe haute performance et sans serveur pour une évolutivité et une disponibilité supérieures.
>
>Cet exemple montre la chaîne de questions-réponses qui interroge la base de données de graphe `Neptune` à l'aide de `openCypher` et renvoie une réponse lisible par l'homme.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) est un langage de requête de graphe déclaratif qui permet une interrogation de données expressive et efficace dans un graphe de propriétés.
>
>[openCypher](https://opencypher.org/) est une implémentation open source de Cypher.# Chaîne de questions-réponses Neptune Open Cypher
Cette chaîne de questions-réponses interroge Amazon Neptune à l'aide d'openCypher et renvoie une réponse lisible par l'homme

LangChain prend en charge à la fois [Neptune Database](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html) et [Neptune Analytics](https://docs.aws.amazon.com/neptune-analytics/latest/userguide/what-is-neptune-analytics.html) avec `NeptuneOpenCypherQAChain`

Neptune Database est une base de données de graphe sans serveur conçue pour une évolutivité et une disponibilité optimales. Elle fournit une solution pour les charges de travail de base de données de graphe qui doivent passer à l'échelle de 100 000 requêtes par seconde, la haute disponibilité multi-AZ et les déploiements multi-Région. Vous pouvez utiliser Neptune Database pour les réseaux sociaux, les alertes de fraude et les applications Customer 360.

Neptune Analytics est un moteur de base de données analytique qui peut rapidement analyser de grandes quantités de données de graphe en mémoire pour obtenir des informations et trouver des tendances. Neptune Analytics est une solution pour analyser rapidement les bases de données de graphe existantes ou les ensembles de données de graphe stockés dans un data lake. Il utilise des algorithmes d'analyse de graphe populaires et des requêtes analytiques à faible latence.

## Utilisation de Neptune Database

```python
from langchain_community.graphs import NeptuneGraph

host = "<neptune-host>"
port = 8182
use_https = True

graph = NeptuneGraph(host=host, port=port, use_https=use_https)
```

### Utilisation de Neptune Analytics

```python
from langchain_community.graphs import NeptuneAnalyticsGraph

graph = NeptuneAnalyticsGraph(graph_identifier="<neptune-analytics-graph-id>")
```

## Utilisation de NeptuneOpenCypherQAChain

Cette chaîne de questions-réponses interroge la base de données de graphe Neptune à l'aide d'openCypher et renvoie une réponse lisible par l'homme.

```python
from langchain.chains import NeptuneOpenCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model="gpt-4")

chain = NeptuneOpenCypherQAChain.from_llm(llm=llm, graph=graph)

chain.invoke("how many outgoing routes does the Austin airport have?")
```

```output
'The Austin airport has 98 outgoing routes.'
```
