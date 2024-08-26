---
translated: true
---

# Clima

>[OpenWeatherMap](https://openweathermap.org/) es un proveedor de servicios meteorológicos de código abierto

Este cargador obtiene los datos meteorológicos de la API OneCall de OpenWeatherMap, utilizando el paquete Python pyowm. Debe inicializar el cargador con su token de API de OpenWeatherMap y los nombres de las ciudades para las que desea obtener los datos meteorológicos.

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
