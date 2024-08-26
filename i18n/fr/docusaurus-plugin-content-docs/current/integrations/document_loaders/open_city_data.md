---
translated: true
---

# Données ouvertes de la ville

[Socrata](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6) fournit une API pour les données ouvertes de la ville.

Pour un jeu de données comme [SF crime](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry), rendez-vous sur l'onglet `API` en haut à droite.

Cela vous fournit l'`identifiant du jeu de données`.

Utilisez l'identifiant du jeu de données pour récupérer des tables spécifiques pour un `city_id` donné (`data.sfgov.org`) -

Par exemple, `vw6y-z8j6` pour [Données SF 311](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6).

Par exemple, `tmnf-yvry` pour [Données de la police de SF](https://dev.socrata.com/foundry/data.sfgov.org/tmnf-yvry).

```python
%pip install --upgrade --quiet  sodapy
```

```python
from langchain_community.document_loaders import OpenCityDataLoader
```

```python
dataset = "vw6y-z8j6"  # 311 data
dataset = "tmnf-yvry"  # crime data
loader = OpenCityDataLoader(city_id="data.sfgov.org", dataset_id=dataset, limit=2000)
```

```python
docs = loader.load()
```

```output
WARNING:root:Requests made without an app_token will be subject to strict throttling limits.
```

```python
eval(docs[0].page_content)
```

```output
{'pdid': '4133422003074',
 'incidntnum': '041334220',
 'incident_code': '03074',
 'category': 'ROBBERY',
 'descript': 'ROBBERY, BODILY FORCE',
 'dayofweek': 'Monday',
 'date': '2004-11-22T00:00:00.000',
 'time': '17:50',
 'pddistrict': 'INGLESIDE',
 'resolution': 'NONE',
 'address': 'GENEVA AV / SANTOS ST',
 'x': '-122.420084075249',
 'y': '37.7083109744362',
 'location': {'type': 'Point',
  'coordinates': [-122.420084075249, 37.7083109744362]},
 ':@computed_region_26cr_cadq': '9',
 ':@computed_region_rxqg_mtj9': '8',
 ':@computed_region_bh8s_q3mv': '309'}
```
