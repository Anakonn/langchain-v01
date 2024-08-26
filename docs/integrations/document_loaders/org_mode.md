---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/org_mode
translated: false
---

# Org-mode

>A [Org Mode document](https://en.wikipedia.org/wiki/Org-mode) is a document editing, formatting, and organizing mode, designed for notes, planning, and authoring within the free software text editor Emacs.

## `UnstructuredOrgModeLoader`

You can load data from Org-mode files with `UnstructuredOrgModeLoader` using the following workflow.

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