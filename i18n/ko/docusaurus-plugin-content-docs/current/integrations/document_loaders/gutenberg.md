---
translated: true
---

# 구텐베르크

>[Project Gutenberg](https://www.gutenberg.org/about/)는 무료 전자책 온라인 도서관입니다.

이 노트북은 `Gutenberg` 전자책 링크를 문서 형식으로 로드하는 방법을 다룹니다.

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
