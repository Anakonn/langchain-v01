---
translated: true
---

# Modo Org

>Un [documento de Modo Org](https://en.wikipedia.org/wiki/Org-mode) es un modo de edición, formato y organización de documentos, diseñado para notas, planificación y autoría dentro del editor de texto de software libre Emacs.

## `UnstructuredOrgModeLoader`

Puede cargar datos desde archivos de Modo Org con `UnstructuredOrgModeLoader` utilizando el siguiente flujo de trabajo.

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
