---
translated: true
---

# Recherche Mojeek

Le cahier suivant expliquera comment obtenir des résultats à l'aide de la recherche Mojeek. Veuillez visiter le [site Web Mojeek](https://www.mojeek.com/services/search/web-search-api/) pour obtenir une clé API.

```python
from langchain_community.tools import MojeekSearch
```

```python
api_key = "KEY"  # obtained from Mojeek Website
```

```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

Dans `search_kwargs`, vous pouvez ajouter n'importe quel paramètre de recherche que vous pouvez trouver dans la [documentation Mojeek](https://www.mojeek.com/support/api/search/request_parameters.html)

```python
search.run("mojeek")
```
