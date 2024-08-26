---
translated: true
---

# YouTube

>[Recherche YouTube](https://github.com/joetats/youtube_search) le package recherche des vidéos `YouTube` en évitant d'utiliser leur API fortement limitée en taux.
>
>Il utilise le formulaire sur la page d'accueil de `YouTube` et gratte la page résultante.

Ce notebook montre comment utiliser un outil pour rechercher sur YouTube.

Adapté de [https://github.com/venuv/langchain_yt_tools](https://github.com/venuv/langchain_yt_tools)

```python
%pip install --upgrade --quiet  youtube_search
```

```python
from langchain_community.tools import YouTubeSearchTool
```

```python
tool = YouTubeSearchTool()
```

```python
tool.run("lex friedman")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu']"
```

Vous pouvez également spécifier le nombre de résultats renvoyés

```python
tool.run("lex friedman,5")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=YVJ8gTnDC4Y&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=Udh22kuLebg&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=L_Guz73e6fw&pp=ygUMbGV4IGZyaWVkbWFu']"
```
