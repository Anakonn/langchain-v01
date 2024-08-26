---
translated: true
---

# RST

>Un fichier [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) est un format de fichier pour les données textuelles utilisé principalement dans la communauté du langage de programmation Python pour la documentation technique.

## `UnstructuredRSTLoader`

Vous pouvez charger des données à partir de fichiers RST avec `UnstructuredRSTLoader` en utilisant le workflow suivant.

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
