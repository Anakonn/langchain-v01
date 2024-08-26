---
translated: true
---

# 天気

>[OpenWeatherMap](https://openweathermap.org/)は、オープンソースの気象サービスプロバイダーです。

このローダーは、pyowmのPythonパッケージを使用して、OpenWeatherMapのOneCallAPIから気象データを取得します。ローダーを初期化する際は、OpenWeatherMapのAPIトークンと、気象データを取得したい都市名を指定する必要があります。

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
