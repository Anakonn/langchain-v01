---
translated: true
---

# RST

>A [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) 파일은 주로 Python 프로그래밍 언어 커뮤니티에서 기술 문서에 사용되는 텍스트 데이터 파일 형식입니다.

## `UnstructuredRSTLoader`

`UnstructuredRSTLoader`를 사용하여 RST 파일에서 데이터를 로드할 수 있습니다.

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
