---
translated: true
---

# 非構造化ファイル

このノートブックでは、`Unstructured`パッケージを使ってさまざまなタイプのファイルを読み込む方法について説明します。`Unstructured`は現在、テキストファイル、PowerPoint、HTML、PDF、画像などのファイルの読み込みをサポートしています。

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

### ファイルのリストを読み込む

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

## 要素を保持する

内部的に、Unstructuredは異なるテキストの塊に対して異なる "要素"を作成します。デフォルトでは、それらを結合しますが、`mode="elements"`を指定することで、その分離を簡単に維持できます。

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

## パーティショニング戦略を定義する

Unstructuredドキュメントローダーでは、`strategy`パラメーターを渡すことで、`unstructured`にドキュメントのパーティショニング方法を指示できます。現在サポートされている戦略は `"hi_res"`(デフォルト)と`"fast"`です。Hi-res パーティショニング戦略は精度が高いですが、処理に時間がかかります。Fastな戦略はドキュメントをより素早くパーティショニングしますが、精度を犠牲にします。すべてのドキュメントタイプに別々のhi-resとfastなパーティショニング戦略があるわけではありません。そのようなドキュメントタイプでは、`strategy`引数は無視されます。場合によっては、hi-res戦略がモデルの依存関係が足りないためにfastにフォールバックします(つまり、ドキュメントのパーティショニングに必要なモデルがありません)。`UnstructuredFileLoader`にどのように戦略を適用するかを以下に示します。

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

## PDFの例

PDFドキュメントの処理は全く同じ方法で行います。Unstructuredはファイルタイプを検出し、同じタイプの要素を抽出します。動作モードは以下の通りです。
- `single` すべての要素のテキストが1つにまとめられる(デフォルト)
- `elements` 個々の要素が維持される
- `paged` 各ページのテキストのみが結合される

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

`unstructured`要素を抽出後に後処理する必要がある場合は、`UnstructuredFileLoader`のインスタンス化時に`post_processors`引数にリスト`str` -> `str`関数を渡すことができます。他のUnstructuredローダーにも適用されます。以下に例を示します。

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

セットアップが少なくて済むようにするには、単に`pip install unstructured`を実行し、`UnstructuredAPIFileLoader`または`UnstructuredAPIFileIOLoader`を使うことができます。これにより、ホスト型のUnstructured APIを使ってドキュメントを処理できます。無料のUnstructured APIキーは[ここ](https://www.unstructured.io/api-key/)で生成できます。[Unstructured documentation](https://unstructured-io.github.io/unstructured/)ページには、APIキーの生成方法が記載されています。Unstructured APIをセルフホストするか、ローカルで実行したい場合は、[ここ](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image)の手順を確認してください。

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

Unstructured APIを使って、複数のファイルをバッチで処理することもできます。

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
