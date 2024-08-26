---
translated: true
---

# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html)는 CoNLL-X 형식의 개정된 버전입니다. 주석은 일반 텍스트 파일(UTF-8, NFC로 정규화, LF 문자만 줄 바꿈 문자로 사용, 파일 끝에 LF 문자 포함)에 인코딩되며 세 가지 유형의 줄로 구성됩니다:
>- 단어 줄에는 단일 탭 문자로 구분된 10개의 필드에 단어/토큰의 주석이 포함됩니다.
>- 빈 줄은 문장 경계를 표시합니다.
>- 해시(#)로 시작하는 줄은 주석입니다.

이것은 [CoNLL-U](https://universaldependencies.org/format.html) 형식의 파일을 로드하는 방법의 예입니다. 전체 파일은 하나의 문서로 처리됩니다. 예제 데이터(`conllu.conllu`)는 표준 UD/CoNLL-U 예제 중 하나를 기반으로 합니다.

```python
from langchain_community.document_loaders import CoNLLULoader
```

```python
loader = CoNLLULoader("example_data/conllu.conllu")
```

```python
document = loader.load()
```

```python
document
```

```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```

