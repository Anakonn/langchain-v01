---
translated: true
---

# IMSDb

>[IMSDb](https://imsdb.com/) `इंटरनेट मूवी स्क्रिप्ट डेटाबेस` है।

यह कवर करता है कि कैसे `IMSDb` वेबपेज को एक दस्तावेज़ प्रारूप में लोड किया जा सकता है जिसका हम आगे उपयोग कर सकते हैं।

```python
from langchain_community.document_loaders import IMSDbLoader
```

```python
loader = IMSDbLoader("https://imsdb.com/scripts/BlacKkKlansman.html")
```

```python
data = loader.load()
```

```python
data[0].page_content[:500]
```

```output
'\n\r\n\r\n\r\n\r\n                                    BLACKKKLANSMAN\r\n                         \r\n                         \r\n                         \r\n                         \r\n                                      Written by\r\n\r\n                          Charlie Wachtel & David Rabinowitz\r\n\r\n                                         and\r\n\r\n                              Kevin Willmott & Spike Lee\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n                         FADE IN:\r\n                         \r\n          SCENE FROM "GONE WITH'
```

```python
data[0].metadata
```

```output
{'source': 'https://imsdb.com/scripts/BlacKkKlansman.html'}
```
