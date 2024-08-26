---
translated: true
---

# RST

>A [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) ファイルは、主にPythonプログラミング言語コミュニティで技術ドキュメンテーションに使用されるテキストデータのファイル形式です。

## `UnstructuredRSTLoader`

`UnstructuredRSTLoader`を使用してRSTファイルからデータをロードできます。以下のワークフローを使用します。

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
