---
translated: true
---

# RST

>Un archivo [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) es un formato de archivo para datos textuales utilizado principalmente en la comunidad del lenguaje de programación Python para documentación técnica.

## `UnstructuredRSTLoader`

Puede cargar datos de archivos RST con `UnstructuredRSTLoader` utilizando el siguiente flujo de trabajo.

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
