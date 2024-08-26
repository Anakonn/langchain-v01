---
translated: true
---

# Org-mode

>A [Org Mode document](https://en.wikipedia.org/wiki/Org-mode) は、無料のソフトウェアテキストエディタEmacs内でノート、計画、作成のために設計されたドキュメント編集、フォーマット、および整理モードです。

## `UnstructuredOrgModeLoader`

以下のワークフローを使用して、`UnstructuredOrgModeLoader`を使用してOrg-modeファイルからデータをロードできます。

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
