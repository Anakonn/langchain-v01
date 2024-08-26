---
translated: true
---

# HTMLセクションの分割

## 説明と動機

[HTMLHeaderTextSplitter](/docs/modules/data_connection/document_transformers/HTML_header_metadata)と同様の概念で、`HTMLSectionSplitter`は"構造認識"チャンカーで、要素レベルでテキストを分割し、各ヘッダーに関連するメタデータを各チャンクに追加します。 要素ごとにチャンクを返したり、同じメタデータを持つ要素を組み合わせたりすることができます。その目的は、(a)関連するテキストをできるだけ意味的にグループ化し、(b)文書構造に encoded されたコンテキストに富んだ情報を保持することです。 他のテキストスプリッターと組み合わせて、チャンキングパイプラインの一部として使用できます。 内部的には、セクションサイズがチャンクサイズを超える場合、`RecursiveCharacterTextSplitter`を使用します。 また、テキストのフォントサイズに基づいて、セクションかどうかを判断するためのフォントサイズしきい値も考慮します。 `xslt_path`を使用して、HTMLを変換するための絶対パスを指定できます。デフォルトでは、`data_connection/document_transformers`ディレクトリの`converting_to_header.xslt`ファイルを使用します。これは、セクションを検出しやすいフォーマット/レイアウトにHTMLを変換するためのものです。たとえば、フォントサイズに基づいて`span`をヘッダータグに変換して、セクションとして検出できるようにします。

## 使用例

#### 1) HTMLの文字列を使用する:

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

#### 2) 別のスプリッターにパイプラインされ、HTMLの文字列コンテンツから読み込まれる:

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
