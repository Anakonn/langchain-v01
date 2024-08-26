---
translated: true
---

# XML

`UnstructuredXMLLoader` का उपयोग `XML` फ़ाइलों को लोड करने के लिए किया जाता है। लोडर `.xml` फ़ाइलों के साथ काम करता है। पृष्ठ सामग्री XML टैगों से निकाली गई पाठ होगी।

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
