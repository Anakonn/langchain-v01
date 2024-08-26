---
sidebar_position: 10
title: 사용자 정의 문서 로더
translated: true
---

# 사용자 정의 문서 로더

## 개요

LLM 기반 애플리케이션은 데이터베이스나 PDF 파일과 같은 파일에서 데이터를 추출하고 LLM이 사용할 수 있는 형식으로 변환하는 작업을 수반합니다. LangChain에서는 일반적으로 `Document` 객체를 생성하여 추출된 텍스트(`page_content`)와 메타데이터(저자 이름, 발행일 등의 문서 정보)를 캡슐화합니다.

`Document` 객체는 LLM에 입력되는 프롬프트로 형식화되어, LLM이 `Document`의 정보를 활용하여 원하는 응답(예: 문서 요약)을 생성할 수 있습니다. `Document`는 즉시 사용하거나 향후 검색 및 사용을 위해 벡터 저장소에 색인화할 수 있습니다.

문서 로딩의 주요 추상화는 다음과 같습니다:

| 구성 요소      | 설명                    |
|----------------|--------------------------------|
| Document       | `text`와 `metadata`를 포함 |
| BaseLoader     | 원시 데이터를 `Document`로 변환하는 데 사용  |
| Blob           | 파일 또는 메모리에 있는 이진 데이터의 표현 |
| BaseBlobParser | `Blob`을 분석하여 `Document` 객체를 생성하는 로직 |

이 가이드에서는 사용자 정의 문서 로딩 및 파일 구문 분석 로직을 작성하는 방법을 보여줍니다. 구체적으로 다음과 같은 내용을 다룹니다:

1. `BaseLoader`를 상속하여 표준 문서 로더 만들기.
2. `BaseBlobParser`, `Blob`, `BlobLoaders`를 사용하여 파서 만들기. 파일 작업 시 유용합니다.

## 표준 문서 로더

표준 문서 로더는 `BaseLoader`를 상속하여 구현할 수 있으며, 이는 문서 로딩을 위한 표준 인터페이스를 제공합니다.

### 인터페이스

| 메서드 이름 | 설명 |
|-------------|-------------|
| lazy_load   | **지연 로드**를 사용하여 문서를 하나씩 로드합니다. 프로덕션 코드에 사용합니다. |
| alazy_load  | `lazy_load`의 비동기 버전 |
| load        | **즉시 로드**를 사용하여 모든 문서를 메모리에 로드합니다. 프로토타이핑 또는 대화형 작업에 사용합니다. |
| aload       | **즉시 로드**를 사용하여 모든 문서를 메모리에 로드합니다. 프로토타이핑 또는 대화형 작업에 사용합니다. **2024-04에 LangChain에 추가되었습니다.** |

* `load` 메서드는 프로토타이핑 작업을 위한 편의 메서드이며, `list(self.lazy_load())`를 호출합니다.
* `alazy_load`는 기본 구현이 `lazy_load`에 위임합니다. 비동기를 사용하는 경우 기본 구현을 재정의하고 네이티브 비동기 구현을 제공하는 것이 좋습니다.

::: {.callout-important}
문서 로더를 구현할 때 `lazy_load` 또는 `alazy_load` 메서드에 매개변수를 제공하지 마세요.

모든 구성은 초기화기(`__init__`)를 통해 전달되어야 합니다. 이는 LangChain의 설계 선택으로, 문서 로더가 인스턴스화되면 문서를 로드하는 데 필요한 모든 정보를 가지고 있도록 하기 위함입니다.
:::

### 구현

파일의 각 줄에서 문서를 생성하는 표준 문서 로더의 예를 살펴보겠습니다.

```python
from typing import AsyncIterator, Iterator

from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document


class CustomDocumentLoader(BaseLoader):
    """An example document loader that reads a file line by line."""

    def __init__(self, file_path: str) -> None:
        """Initialize the loader with a file path.

        Args:
            file_path: The path to the file to load.
        """
        self.file_path = file_path

    def lazy_load(self) -> Iterator[Document]:  # <-- Does not take any arguments
        """A lazy loader that reads a file line by line.

        When you're implementing lazy load methods, you should use a generator
        to yield documents one by one.
        """
        with open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1

    # alazy_load is OPTIONAL.
    # If you leave out the implementation, a default implementation which delegates to lazy_load will be used!
    async def alazy_load(
        self,
    ) -> AsyncIterator[Document]:  # <-- Does not take any arguments
        """An async lazy loader that reads a file line by line."""
        # Requires aiofiles
        # Install with `pip install aiofiles`
        # https://github.com/Tinche/aiofiles
        import aiofiles

        async with aiofiles.open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            async for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1
```

### 테스트 🧪

문서 로더를 테스트하려면 좋은 콘텐츠가 있는 파일이 필요합니다.

```python
with open("./meow.txt", "w", encoding="utf-8") as f:
    quality_content = "meow meow🐱 \n meow meow🐱 \n meow😻😻"
    f.write(quality_content)

loader = CustomDocumentLoader("./meow.txt")
```

```python
## Test out the lazy load interface
for doc in loader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

```python
## Test out the async implementation
async for doc in loader.alazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

::: {.callout-tip}

`load()`는 Jupyter Notebook과 같은 대화형 환경에서 유용할 수 있습니다.

모든 콘텐츠가 메모리에 맞을 수 있다는 가정 하에 동작하므로, 프로덕션 코드에서는 사용하지 않는 것이 좋습니다.
:::

```python
loader.load()
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 0, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 2, 'source': './meow.txt'})]
```

## 파일 작업

많은 문서 로더는 파일 구문 분석을 포함합니다. 이러한 로더 간의 차이는 파일이 로드되는 방식보다는 파일이 구문 분석되는 방식에서 발생합니다. 예를 들어 PDF 또는 Markdown 파일의 이진 콘텐츠를 읽기 위해 `open`을 사용할 수 있지만, 해당 이진 데이터를 텍스트로 변환하려면 다른 구문 분석 로직이 필요합니다.

따라서 구문 분석 로직을 로딩 로직과 분리하면 특정 파서를 데이터가 로드된 방식과 관계없이 재사용할 수 있습니다.

### BaseBlobParser

`BaseBlobParser`는 `blob`을 입력받아 `Document` 객체 목록을 출력하는 인터페이스입니다. `blob`은 메모리 또는 파일에 있는 데이터의 표현입니다. LangChain Python에는 [Blob WebAPI 사양](https://developer.mozilla.org/en-US/docs/Web/API/Blob)에서 영감을 받은 `Blob` 기본 클래스가 있습니다.

```python
from langchain_core.document_loaders import BaseBlobParser, Blob


class MyParser(BaseBlobParser):
    """A simple parser that creates a document from each line."""

    def lazy_parse(self, blob: Blob) -> Iterator[Document]:
        """Parse a blob into a document line by line."""
        line_number = 0
        with blob.as_bytes_io() as f:
            for line in f:
                line_number += 1
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": blob.source},
                )
```

```python
blob = Blob.from_path("./meow.txt")
parser = MyParser()
```

```python
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 2, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 3, 'source': './meow.txt'})]
```

**blob** API를 사용하면 파일에서 읽지 않고도 메모리에서 직접 콘텐츠를 로드할 수 있습니다!

```python
blob = Blob(data=b"some data from memory\nmeow")
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='some data from memory\n', metadata={'line_number': 1, 'source': None}),
 Document(page_content='meow', metadata={'line_number': 2, 'source': None})]
```

### Blob

Blob API에 대해 간단히 살펴보겠습니다.

```python
blob = Blob.from_path("./meow.txt", metadata={"foo": "bar"})
```

```python
blob.encoding
```

```output
'utf-8'
```

```python
blob.as_bytes()
```

```output
b'meow meow\xf0\x9f\x90\xb1 \n meow meow\xf0\x9f\x90\xb1 \n meow\xf0\x9f\x98\xbb\xf0\x9f\x98\xbb'
```

```python
blob.as_string()
```

```output
'meow meow🐱 \n meow meow🐱 \n meow😻😻'
```

```python
blob.as_bytes_io()
```

```output
<contextlib._GeneratorContextManager at 0x743f34324450>
```

```python
blob.metadata
```

```output
{'foo': 'bar'}
```

```python
blob.source
```

```output
'./meow.txt'
```

파서는 바이너리 데이터를 문서로 구문 분석하는 데 필요한 로직을 캡슐화하지만, *blob 로더*는 특정 스토리지 위치에서 blob을 로드하는 데 필요한 로직을 캡슐화합니다.

현재 `LangChain`은 `FileSystemBlobLoader`만 지원합니다.

`FileSystemBlobLoader`를 사용하여 blob을 로드한 다음 파서를 사용하여 구문 분석할 수 있습니다.

```python
from langchain_community.document_loaders.blob_loaders import FileSystemBlobLoader

blob_loader = FileSystemBlobLoader(path=".", glob="*.mdx", show_progress=True)
```

```python
parser = MyParser()
for blob in blob_loader.yield_blobs():
    for doc in parser.lazy_parse(blob):
        print(doc)
        break
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='# Markdown\n' metadata={'line_number': 1, 'source': 'markdown.mdx'}
page_content='# JSON\n' metadata={'line_number': 1, 'source': 'json.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'pdf.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'index.mdx'}
page_content='# File Directory\n' metadata={'line_number': 1, 'source': 'file_directory.mdx'}
page_content='# CSV\n' metadata={'line_number': 1, 'source': 'csv.mdx'}
page_content='# HTML\n' metadata={'line_number': 1, 'source': 'html.mdx'}
```

### 일반 로더

LangChain에는 `BlobLoader`와 `BaseBlobParser`를 구성하는 `GenericLoader` 추상화가 있습니다.

`GenericLoader`는 기존 `BlobLoader` 구현을 쉽게 사용할 수 있는 표준화된 클래스 메서드를 제공하는 것을 목적으로 합니다. 현재 `FileSystemBlobLoader`만 지원됩니다.

```python
from langchain_community.document_loaders.generic import GenericLoader

loader = GenericLoader.from_filesystem(
    path=".", glob="*.mdx", show_progress=True, parser=MyParser()
)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```

#### 사용자 정의 일반 로더

클래스를 만드는 것을 좋아한다면 하위 클래스를 만들어 로직을 함께 캡슐화할 수 있습니다.

이 클래스를 하위 클래스화하여 기존 로더를 사용하여 콘텐츠를 로드할 수 있습니다.

```python
from typing import Any


class MyCustomLoader(GenericLoader):
    @staticmethod
    def get_parser(**kwargs: Any) -> BaseBlobParser:
        """Override this method to associate a default parser with the class."""
        return MyParser()
```

```python
loader = MyCustomLoader.from_filesystem(path=".", glob="*.mdx", show_progress=True)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```
