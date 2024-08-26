---
translated: true
---

# RST

>एक [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) फ़ाइल एक फ़ाइल प्रारूप है जो मुख्य रूप से पायथन प्रोग्रामिंग भाषा समुदाय में तकनीकी प्रलेखन के लिए उपयोग किया जाता है।

## `UnstructuredRSTLoader`

आप `UnstructuredRSTLoader` का उपयोग करके RST फ़ाइलों से डेटा लोड कर सकते हैं।

```python
from langchain_community.document_loaders import UnstructuredRSTLoader
```

```python
loader = UnstructuredRSTLoader(file_path="example_data/README.rst", mode="elements")
docs = loader.load()
```

```python
print(docs[0])
```

```output
page_content='Example Docs' metadata={'source': 'example_data/README.rst', 'filename': 'README.rst', 'file_directory': 'example_data', 'filetype': 'text/x-rst', 'page_number': 1, 'category': 'Title'}
```
