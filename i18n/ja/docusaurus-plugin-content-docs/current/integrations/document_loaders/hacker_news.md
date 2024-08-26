---
translated: true
---

# Hacker News

>[Hacker News](https://en.wikipedia.org/wiki/Hacker_News) (時々 `HN` と略される) は、コンピューターサイエンスとエンタープライズに焦点を当てたソーシャルニュースウェブサイトです。 `Y Combinator` の投資ファンドとスタートアップインキュベーターによって運営されています。 一般的に、提出可能なコンテンツは「知的好奇心を満たすもの」と定義されています。

このノートブックでは、[Hacker News](https://news.ycombinator.com/)からページデータとコメントを取得する方法について説明します。

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
