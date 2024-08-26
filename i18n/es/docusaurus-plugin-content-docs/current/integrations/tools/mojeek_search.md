---
translated: true
---

# Búsqueda de Mojeek

El siguiente cuaderno explicará cómo obtener resultados utilizando Mojeek Search. Visite [Sitio web de Mojeek](https://www.mojeek.com/services/search/web-search-api/) para obtener una clave API.

```python
from langchain_community.tools import MojeekSearch
```

```python
api_key = "KEY"  # obtained from Mojeek Website
```

```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

En `search_kwargs` puede agregar cualquier parámetro de búsqueda que pueda encontrar en [Documentación de Mojeek](https://www.mojeek.com/support/api/search/request_parameters.html)

```python
search.run("mojeek")
```
