---
translated: true
---

# Hacker News

>[Hacker News](https://en.wikipedia.org/wiki/Hacker_News)(때때로 `HN`으로 약칭됨)는 컴퓨터 과학과 기업가 정신에 초점을 맞춘 소셜 뉴스 웹사이트입니다. 이는 투자 펀드 및 스타트업 인큐베이터인 `Y Combinator`에서 운영됩니다. 일반적으로 제출할 수 있는 콘텐츠는 "지적 호기심을 충족시키는 모든 것"으로 정의됩니다.

이 노트북은 [Hacker News](https://news.ycombinator.com/)에서 페이지 데이터와 댓글을 가져오는 방법을 다룹니다.

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
