---
translated: true
---

# Hacker News

>[Hacker News](https://en.wikipedia.org/wiki/Hacker_News) (a veces abreviado como `HN`) es un sitio web de noticias sociales que se centra en la informática y el emprendimiento. Es administrado por el fondo de inversión y la incubadora de startups `Y Combinator`. En general, el contenido que se puede enviar se define como "cualquier cosa que satisfaga la curiosidad intelectual de uno".

Este cuaderno cubre cómo obtener datos de página y comentarios de [Hacker News](https://news.ycombinator.com/)

```python
from langchain_community.document_loaders import HNLoader
```

```python
loader = HNLoader("https://news.ycombinator.com/item?id=34817881")
```

```python
data = loader.load()
```

```python
data[0].page_content[:300]
```

```output
"delta_p_delta_x 73 days ago  \n             | next [–] \n\nAstrophysical and cosmological simulations are often insightful. They're also very cross-disciplinary; besides the obvious astrophysics, there's networking and sysadmin, parallel computing and algorithm theory (so that the simulation programs a"
```

```python
data[0].metadata
```

```output
{'source': 'https://news.ycombinator.com/item?id=34817881',
 'title': 'What Lights the Universe’s Standard Candles?'}
```
