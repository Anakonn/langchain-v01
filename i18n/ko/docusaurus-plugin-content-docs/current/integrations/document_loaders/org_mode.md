---
translated: true
---

# Org 모드

>Org 모드 문서는 Emacs 자유 소프트웨어 텍스트 편집기 내에서 메모, 계획, 저작을 위해 설계된 문서 편집, 포맷팅, 구성 모드입니다.

## `UnstructuredOrgModeLoader`

다음 워크플로를 사용하여 Org 모드 파일에서 데이터를 로드할 수 있습니다.

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
