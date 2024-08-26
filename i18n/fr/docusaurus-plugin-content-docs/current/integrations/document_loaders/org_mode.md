---
translated: true
---

# Mode Org

>Un [document en mode Org](https://en.wikipedia.org/wiki/Org-mode) est un mode d'édition, de formatage et d'organisation de documents, conçu pour les notes, la planification et la rédaction dans l'éditeur de texte libre Emacs.

## `UnstructuredOrgModeLoader`

Vous pouvez charger des données à partir de fichiers en mode Org avec `UnstructuredOrgModeLoader` en utilisant le workflow suivant.

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
