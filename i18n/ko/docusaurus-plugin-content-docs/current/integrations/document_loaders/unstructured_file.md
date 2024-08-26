---
translated: true
---

# 비정형 파일

이 노트북은 `Unstructured` 패키지를 사용하여 다양한 유형의 파일을 로드하는 방법을 다룹니다. `Unstructured`는 현재 텍스트 파일, 파워포인트, HTML, PDF, 이미지 등을 로드할 수 있습니다.

```python
# # Install package
%pip install --upgrade --quiet  "unstructured[all-docs]"
```

```python
# # Install other dependencies
# # https://github.com/Unstructured-IO/unstructured/blob/main/docs/source/installing.rst
# !brew install libmagic
# !brew install poppler
# !brew install tesseract
# # If parsing xml / html documents:
# !brew install libxml2
# !brew install libxslt
```

```python
# import nltk
# nltk.download('punkt')
```

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader("./example_data/state_of_the_union.txt")
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

```output
'Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.\n\nLast year COVID-19 kept us apart. This year we are finally together again.\n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.\n\nWith a duty to one another to the American people to the Constit'
```

### 파일 목록 로드

```python
files = ["./example_data/whatsapp_chat.txt", "./example_data/layout-parser-paper.pdf"]
```

```python
loader = UnstructuredFileLoader(files)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

## 요소 유지

내부적으로 Unstructured는 텍스트의 다른 "요소"를 만듭니다. 기본적으로 이를 결합하지만 `mode="elements"`를 지정하여 이 구분을 쉽게 유지할 수 있습니다.

```python
loader = UnstructuredFileLoader(
    "./example_data/state_of_the_union.txt", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Last year COVID-19 kept us apart. This year we are finally together again.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='With a duty to one another to the American people to the Constitution.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='And with an unwavering resolve that freedom will always triumph over tyranny.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0)]
```

## 파티셔닝 전략 정의

Unstructured 문서 로더를 사용하면 `strategy` 매개변수를 전달하여 `unstructured`에 문서를 어떻게 분할할지 알려줄 수 있습니다. 현재 지원되는 전략은 `"hi_res"`(기본값) 및 `"fast"`입니다. Hi res 파티셔닝 전략은 더 정확하지만 처리 시간이 더 오래 걸립니다. 빠른 전략은 문서를 더 빨리 분할하지만 정확도가 낮습니다. 모든 문서 유형에 별도의 hi res 및 빠른 파티셔닝 전략이 있는 것은 아닙니다. 이러한 문서 유형의 경우 `strategy` 매개변수가 무시됩니다. 일부 경우에는 고해상도 전략이 종속성이 없는 경우(즉, 문서 분할을 위한 모델) 빠른 전략으로 대체됩니다. 아래에서 `UnstructuredFileLoader`에 전략을 적용하는 방법을 확인할 수 있습니다.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader(
    "layout-parser-paper-fast.pdf", strategy="fast", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='1', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='0', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='n', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'Title'}, lookup_index=0)]
```

## PDF 예제

PDF 문서 처리도 동일한 방식으로 작동합니다. Unstructured는 파일 유형을 감지하고 동일한 유형의 요소를 추출합니다. 작동 모드는 다음과 같습니다.
- `single` 모든 요소의 텍스트가 하나로 결합됩니다(기본값)
- `elements` 개별 요소가 유지됩니다
- `paged` 각 페이지의 텍스트만 결합됩니다

```python
!wget  https://raw.githubusercontent.com/Unstructured-IO/unstructured/main/example-docs/layout-parser-paper.pdf -P "../../"
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser : A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Zejiang Shen 1 ( (ea)\n ), Ruochen Zhang 2 , Melissa Dell 3 , Benjamin Charles Germain Lee 4 , Jacob Carlson 3 , and Weining Li 5', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Allen Institute for AI shannons@allenai.org', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Brown University ruochen zhang@brown.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Harvard University { melissadell,jacob carlson } @fas.harvard.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0)]
```

추출 후 `unstructured` 요소를 사후 처리해야 하는 경우 `UnstructuredFileLoader`를 인스턴스화할 때 `post_processors` 매개변수에 `str` -> `str` 함수 목록을 전달할 수 있습니다. 다른 Unstructured 로더에도 적용됩니다. 아래에 예제가 있습니다.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
from unstructured.cleaners.core import clean_extra_whitespace
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf",
    mode="elements",
    post_processors=[clean_extra_whitespace],
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((157.62199999999999, 114.23496279999995), (157.62199999999999, 146.5141628), (457.7358962799999, 146.5141628), (457.7358962799999, 114.23496279999995)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'}),
 Document(page_content='Zejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain Lee4, Jacob Carlson3, and Weining Li5', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((134.809, 168.64029940800003), (134.809, 192.2517444), (480.5464199080001, 192.2517444), (480.5464199080001, 168.64029940800003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 Allen Institute for AI shannons@allenai.org 2 Brown University ruochen zhang@brown.edu 3 Harvard University {melissadell,jacob carlson}@fas.harvard.edu 4 University of Washington bcgl@cs.washington.edu 5 University of Waterloo w422li@uwaterloo.ca', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((207.23000000000002, 202.57205439999996), (207.23000000000002, 311.8195408), (408.12676, 311.8195408), (408.12676, 202.57205439999996)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 2 0 2', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='n u J', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 258.36), (16.34, 286.14), (36.34, 286.14), (36.34, 258.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'})]
```

## Unstructured API

설정이 적게 필요한 경우 `pip install unstructured`를 실행하고 `UnstructuredAPIFileLoader` 또는 `UnstructuredAPIFileIOLoader`를 사용할 수 있습니다. 이렇게 하면 호스팅된 Unstructured API를 사용하여 문서를 처리할 수 있습니다. 무료 Unstructured API 키는 [여기](https://www.unstructured.io/api-key/)에서 생성할 수 있습니다. [Unstructured 문서](https://unstructured-io.github.io/unstructured/) 페이지에서 API 키 생성 방법에 대한 지침을 확인할 수 있습니다. Unstructured API를 직접 호스팅하거나 로컬에서 실행하려면 [여기](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image)의 지침을 확인하세요.

```python
from langchain_community.document_loaders import UnstructuredAPIFileLoader
```

```python
filenames = ["example_data/fake.docx", "example_data/fake-email.eml"]
```

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames[0],
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})
```

`UnstructuredAPIFileLoader`를 사용하면 단일 API를 통해 여러 파일을 일괄 처리할 수도 있습니다.

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames,
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.\n\nThis is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': ['example_data/fake.docx', 'example_data/fake-email.eml']})
```
