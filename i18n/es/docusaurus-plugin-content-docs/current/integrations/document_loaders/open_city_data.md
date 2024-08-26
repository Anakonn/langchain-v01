---
translated: true
---

# Ciudad Abierta de Datos

[Socrata](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6) proporciona una API para los datos abiertos de la ciudad.

Para un conjunto de datos como [Crimen de SF](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry), ir a la pestaña `API` en la parte superior derecha.

Eso le proporciona el `identificador del conjunto de datos`.

Utilice el identificador del conjunto de datos para obtener tablas específicas para un determinado `city_id` (`data.sfgov.org`) -

Por ejemplo, `vw6y-z8j6` para [Datos de SF 311](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6).

Por ejemplo, `tmnf-yvry` para [Datos de la Policía de SF](https://dev.socrata.com/foundry/data.sfgov.org/tmnf-yvry).

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
