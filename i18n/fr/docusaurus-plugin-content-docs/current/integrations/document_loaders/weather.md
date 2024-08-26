---
translated: true
---

# Météo

>[OpenWeatherMap](https://openweathermap.org/) est un fournisseur de services météorologiques open source

Ce chargeur récupère les données météorologiques à partir de l'API OneCall d'OpenWeatherMap, en utilisant le package Python pyowm. Vous devez initialiser le chargeur avec votre jeton API OpenWeatherMap et les noms des villes pour lesquelles vous voulez les données météorologiques.

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
