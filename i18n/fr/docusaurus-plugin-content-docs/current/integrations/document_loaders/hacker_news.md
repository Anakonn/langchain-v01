---
translated: true
---

# Hacker News

>[Hacker News](https://en.wikipedia.org/wiki/Hacker_News) (parfois abrégé en `HN`) est un site d'actualités sociales axé sur l'informatique et l'entrepreneuriat. Il est géré par le fonds d'investissement et l'incubateur de startups `Y Combinator`. En général, le contenu qui peut être soumis est défini comme "tout ce qui satisfait la curiosité intellectuelle d'une personne".

Ce notebook couvre comment récupérer les données de page et les commentaires de [Hacker News](https://news.ycombinator.com/)

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
