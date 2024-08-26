---
translated: true
---

# YouTube

>[Búsqueda de YouTube](https://github.com/joetats/youtube_search) el paquete busca videos de `YouTube` evitando usar su API con límite de velocidad.
>
>Utiliza el formulario de la página de inicio de `YouTube` y rasca la página resultante.

Este cuaderno muestra cómo usar una herramienta para buscar en YouTube.

Adaptado de [https://github.com/venuv/langchain_yt_tools](https://github.com/venuv/langchain_yt_tools)

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

También puedes especificar el número de resultados que se devuelven

```python
tool.run("lex friedman,5")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=YVJ8gTnDC4Y&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=Udh22kuLebg&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=L_Guz73e6fw&pp=ygUMbGV4IGZyaWVkbWFu']"
```
