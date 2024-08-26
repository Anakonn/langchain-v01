---
translated: true
---

# हैकर न्यूज़

>[हैकर न्यूज़](https://en.wikipedia.org/wiki/Hacker_News) (कभी-कभी `HN` के रूप में संक्षिप्त) कंप्यूटर विज्ञान और उद्यमिता पर केंद्रित एक सामाजिक समाचार वेबसाइट है। यह `Y Combinator` निवेश कोष और स्टार्टअप इनक्यूबेटर द्वारा संचालित है। सामान्य रूप से, प्रस्तुत किया जा सकने वाला सामग्री को "किसी भी चीज़ जो किसी व्यक्ति की बौद्धिक उत्सुकता को संतुष्ट करती है" के रूप में परिभाषित किया जाता है।

यह नोटबुक [हैकर न्यूज़](https://news.ycombinator.com/) से पृष्ठ डेटा और टिप्पणियों को कैसे प्राप्त करें, इस बारे में कवर करता है।

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
