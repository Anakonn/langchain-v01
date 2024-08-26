---
translated: true
---

# Requête dorée

>[Doré](https://golden.com) fournit un ensemble d'API en langage naturel pour interroger et enrichir à l'aide du graphe de connaissances Golden, par exemple des requêtes telles que : `Produits d'OpenAI`, `Entreprises d'IA générative avec un financement de série A` et `rappeurs qui investissent` peuvent être utilisées pour récupérer des données structurées sur les entités pertinentes.

>L'outil `golden-query` langchain est un wrapper sur l'[API de requête Golden](https://docs.golden.com/reference/query-api) qui permet un accès programmatique à ces résultats.
>Consultez la [documentation de l'API de requête Golden](https://docs.golden.com/reference/query-api) pour plus d'informations.

Ce notebook explique comment utiliser l'outil `golden-query`.

- Allez sur la [documentation de l'API Golden](https://docs.golden.com/) pour avoir un aperçu de l'API Golden.
- Obtenez votre clé d'API sur la page des [paramètres de l'API Golden](https://golden.com/settings/api).
- Enregistrez votre clé d'API dans la variable d'environnement GOLDEN_API_KEY

```python
import os

os.environ["GOLDEN_API_KEY"] = ""
```

```python
from langchain_community.utilities.golden_query import GoldenQueryAPIWrapper
```

```python
golden_query = GoldenQueryAPIWrapper()
```

```python
import json

json.loads(golden_query.run("companies in nanotech"))
```

```output
{'results': [{'id': 4673886,
   'latestVersionId': 60276991,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Samsung', 'citations': []}]}]},
  {'id': 7008,
   'latestVersionId': 61087416,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Intel', 'citations': []}]}]},
  {'id': 24193,
   'latestVersionId': 60274482,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Texas Instruments', 'citations': []}]}]},
  {'id': 1142,
   'latestVersionId': 61406205,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Advanced Micro Devices', 'citations': []}]}]},
  {'id': 193948,
   'latestVersionId': 58326582,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Freescale Semiconductor', 'citations': []}]}]},
  {'id': 91316,
   'latestVersionId': 60387380,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Agilent Technologies', 'citations': []}]}]},
  {'id': 90014,
   'latestVersionId': 60388078,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Novartis', 'citations': []}]}]},
  {'id': 237458,
   'latestVersionId': 61406160,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Analog Devices', 'citations': []}]}]},
  {'id': 3941943,
   'latestVersionId': 60382250,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'AbbVie Inc.', 'citations': []}]}]},
  {'id': 4178762,
   'latestVersionId': 60542667,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'IBM', 'citations': []}]}]}],
 'next': 'https://golden.com/api/v2/public/queries/59044/results/?cursor=eyJwb3NpdGlvbiI6IFsxNzYxNiwgIklCTS04M1lQM1oiXX0%3D&pageSize=10',
 'previous': None}
```
