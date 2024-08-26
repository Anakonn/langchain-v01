---
translated: true
---

# XML

`UnstructuredXMLLoader`は`XML`ファイルをロードするために使用されます。このローダーは`.xml`ファイルで動作します。ページコンテンツはXMLタグから抽出されたテキストになります。

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
