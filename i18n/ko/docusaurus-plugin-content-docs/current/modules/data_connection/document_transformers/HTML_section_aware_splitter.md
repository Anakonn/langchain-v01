---
translated: true
---

# HTML 섹션 분할

## 설명 및 동기

[HTMLHeaderTextSplitter](/docs/modules/data_connection/document_transformers/HTML_header_metadata)와 유사한 개념으로, `HTMLSectionSplitter`는 "구조 인식" 청크 분할기로, 요소 수준에서 텍스트를 분할하고 각 헤더에 관련된 메타데이터를 추가합니다. 요소별로 청크를 반환하거나 동일한 메타데이터를 가진 요소를 결합할 수 있으며, (a) 관련 텍스트를 (대략적으로) 의미론적으로 그룹화하고 (b) 문서 구조에 인코딩된 컨텍스트 풍부한 정보를 보존하는 것을 목표로 합니다. 청크 파이프라인의 일부로 다른 텍스트 분할기와 함께 사용할 수 있습니다. 내부적으로 섹션 크기가 청크 크기보다 큰 경우 `RecursiveCharacterTextSplitter`를 사용합니다. 또한 결정된 글꼴 크기 임계값을 기준으로 텍스트의 글꼴 크기를 고려하여 섹션인지 여부를 결정합니다. `xslt_path`를 사용하여 섹션 감지를 위해 HTML을 변환할 수 있는 절대 경로를 제공할 수 있습니다. 기본값은 `data_connection/document_transformers` 디렉토리의 `converting_to_header.xslt` 파일을 사용하는 것입니다. 이는 섹션 감지가 더 쉬운 형식/레이아웃으로 HTML을 변환하기 위한 것입니다. 예를 들어, 글꼴 크기에 따라 `span`을 헤더 태그로 변환할 수 있습니다.

## 사용 예

#### 1) HTML 문자열로:

```python
from langchain_text_splitters import HTMLSectionSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2")]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```

#### 2) 다른 분할기와 파이프라인으로, HTML 문자열 콘텐츠에서 로드:

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)

html_header_splits = html_splitter.split_text(html_string)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits
```
