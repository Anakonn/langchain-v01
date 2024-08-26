---
translated: true
---

# गुटेनबर्ग

>[Project Gutenberg](https://www.gutenberg.org/about/) एक मुक्त ई-पुस्तकों का ऑनलाइन पुस्तकालय है।

यह नोटबुक कवर करता है कि कैसे `Gutenberg` ई-पुस्तकों के लिंक को एक दस्तावेज़ प्रारूप में लोड किया जा सकता है जिसका हम आगे उपयोग कर सकते हैं।

```python
from langchain_community.document_loaders import GutenbergLoader
```

```python
loader = GutenbergLoader("https://www.gutenberg.org/cache/epub/69972/pg69972.txt")
```

```python
data = loader.load()
```

```python
data[0].page_content[:300]
```

```output
'The Project Gutenberg eBook of The changed brides, by Emma Dorothy\r\n\n\nEliza Nevitte Southworth\r\n\n\n\r\n\n\nThis eBook is for the use of anyone anywhere in the United States and\r\n\n\nmost other parts of the world at no cost and with almost no restrictions\r\n\n\nwhatsoever. You may copy it, give it away or re-u'
```

```python
data[0].metadata
```

```output
{'source': 'https://www.gutenberg.org/cache/epub/69972/pg69972.txt'}
```
