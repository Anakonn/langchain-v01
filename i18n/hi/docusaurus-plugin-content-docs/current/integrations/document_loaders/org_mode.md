---
translated: true
---

# Org-mode

>एक [Org Mode दस्तावेज](https://en.wikipedia.org/wiki/Org-mode) एक दस्तावेज संपादन, प्रारूपण और संगठन मोड है, जो नोट्स, योजना और Emacs मुक्त सॉफ्टवेयर पाठ संपादक के भीतर लेखन के लिए डिज़ाइन किया गया है।

## `UnstructuredOrgModeLoader`

आप निम्नलिखित कार्यप्रवाह का उपयोग करके Org-mode फ़ाइलों से डेटा लोड कर सकते हैं `UnstructuredOrgModeLoader`।

```python
from langchain_community.document_loaders import UnstructuredOrgModeLoader
```

```python
loader = UnstructuredOrgModeLoader(file_path="example_data/README.org", mode="elements")
docs = loader.load()
```

```python
print(docs[0])
```

```output
page_content='Example Docs' metadata={'source': 'example_data/README.org', 'filename': 'README.org', 'file_directory': 'example_data', 'filetype': 'text/org', 'page_number': 1, 'category': 'Title'}
```
