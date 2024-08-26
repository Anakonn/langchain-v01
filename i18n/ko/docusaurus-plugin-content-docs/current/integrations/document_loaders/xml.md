---
translated: true
---

# XML

`UnstructuredXMLLoader`는 `XML` 파일을 로드하는 데 사용됩니다. 로더는 `.xml` 파일로 작동합니다. 페이지 내용은 XML 태그에서 추출된 텍스트가 됩니다.

```python
from langchain_community.document_loaders import UnstructuredXMLLoader
```

```python
loader = UnstructuredXMLLoader(
    "example_data/factbook.xml",
)
docs = loader.load()
docs[0]
```

```output
Document(page_content='United States\n\nWashington, DC\n\nJoe Biden\n\nBaseball\n\nCanada\n\nOttawa\n\nJustin Trudeau\n\nHockey\n\nFrance\n\nParis\n\nEmmanuel Macron\n\nSoccer\n\nTrinidad & Tobado\n\nPort of Spain\n\nKeith Rowley\n\nTrack & Field', metadata={'source': 'example_data/factbook.xml'})
```
