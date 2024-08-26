---
translated: true
---

# 날씨

>[OpenWeatherMap](https://openweathermap.org/)은 오픈 소스 날씨 서비스 제공업체입니다.

이 로더는 pyowm Python 패키지를 사용하여 OpenWeatherMap의 OneCall API에서 날씨 데이터를 가져옵니다. 로더를 초기화할 때 OpenWeatherMap API 토큰과 날씨 데이터를 원하는 도시 이름을 제공해야 합니다.

```python
from langchain_community.document_loaders import WeatherDataLoader
```

```python
%pip install --upgrade --quiet  pyowm
```

```python
# Set API key either by passing it in to constructor directly
# or by setting the environment variable "OPENWEATHERMAP_API_KEY".

from getpass import getpass

OPENWEATHERMAP_API_KEY = getpass()
```

```python
loader = WeatherDataLoader.from_params(
    ["chennai", "vellore"], openweathermap_api_key=OPENWEATHERMAP_API_KEY
)
```

```python
documents = loader.load()
documents
```
