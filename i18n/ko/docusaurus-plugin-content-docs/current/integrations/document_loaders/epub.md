---
translated: true
---

# EPub

>[EPUB](https://en.wikipedia.org/wiki/EPUB)은 ".epub" 파일 확장자를 사용하는 전자책 파일 형식입니다. 이 용어는 전자 출판(electronic publication)의 약어이며 때로는 ePub으로 표기됩니다. `EPUB`은 많은 전자책 리더기에서 지원되며 대부분의 스마트폰, 태블릿, 컴퓨터에서 호환되는 소프트웨어를 사용할 수 있습니다.

이것은 `.epub` 문서를 우리가 사용할 수 있는 문서 형식으로 로드하는 방법을 다룹니다. 이 로더가 작동하려면 [`pandoc`](https://pandoc.org/installing.html) 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  pandoc
```

```python
from langchain_community.document_loaders import UnstructuredEPubLoader
```

```python
loader = UnstructuredEPubLoader("winter-sports.epub")
```

```python
data = loader.load()
```

## 요소 유지

내부적으로 Unstructured는 텍스트의 다른 부분에 대해 다른 "요소"를 만듭니다. 기본적으로 우리는 이를 결합하지만 `mode="elements"`를 지정하여 이 구분을 쉽게 유지할 수 있습니다.

```python
loader = UnstructuredEPubLoader("winter-sports.epub", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='The Project Gutenberg eBook of Winter Sports in\nSwitzerland, by E. F. Benson', lookup_str='', metadata={'source': 'winter-sports.epub', 'page_number': 1, 'category': 'Title'}, lookup_index=0)
```
