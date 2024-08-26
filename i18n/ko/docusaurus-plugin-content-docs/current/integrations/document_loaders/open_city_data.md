---
translated: true
---

# 오픈 시티 데이터

[Socrata](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6)는 시 오픈 데이터를 위한 API를 제공합니다.

[SF 범죄](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry)와 같은 데이터 세트의 경우, 오른쪽 상단의 `API` 탭으로 이동하세요.

이를 통해 `데이터 세트 식별자`를 얻을 수 있습니다.

데이터 세트 식별자를 사용하여 특정 테이블을 주어진 city_id(`data.sfgov.org`)에 대해 가져올 수 있습니다.

예: `vw6y-z8j6`은 [SF 311 데이터](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6)에 해당합니다.

예: `tmnf-yvry`는 [SF 경찰 데이터](https://dev.socrata.com/foundry/data.sfgov.org/tmnf-yvry)에 해당합니다.

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
