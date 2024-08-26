---
sidebar_position: 10
title: カスタムドキュメントローダー
translated: true
---

# カスタムドキュメントローダー

## 概要

LLMベースのアプリケーションでは、データベースやPDFなどのファイルからデータを抽出し、LLMが利用できる形式に変換することが一般的です。LangChainでは、通常、Documentオブジェクトを作成します。Documentオブジェクトには、抽出したテキスト(`page_content`)とメタデータ(著者名や公開日など)が含まれています。

Documentオブジェクトは、LLMに入力されるプロンプトの形式で整形されます。これにより、LLMはDocumentの情報を使ってユーザーの要求に応えることができます(例えば、ドキュメントの要約など)。
Documentsは即座に使用したり、将来の検索と利用のためにベクトルストアにインデックス化したりできます。

ドキュメントロードの主な抽象化は以下の通りです:

| コンポーネント | 説明                                |
|---------------|-------------------------------------|
| Document      | `text`と`metadata`を含む            |
| BaseLoader    | 生データをDocumentに変換するために使用 |
| Blob          | ファイルまたはメモリ内にある、バイナリデータの表現 |
| BaseBlobParser| BlobをパースしてDocumentオブジェクトを生成するロジック |

このガイドでは、カスタムのドキュメントロードとファイルパーシングロジックの作成方法を説明します。具体的には以下の内容を扱います:

1. `BaseLoader`を継承してスタンダードなドキュメントローダーを作成する
2. `BaseBlobParser`を使ってパーサーを作成し、`Blob`と`BlobLoaders`と組み合わせて使う。ファイル処理に特に役立ちます。

## スタンダードドキュメントローダー

ドキュメントローダーは、標準インターフェイスを提供する`BaseLoader`を継承して実装できます。

### インターフェイス

| メソッド名 | 説明 |
|-----------|------|
| lazy_load | **遅延的に**ドキュメントを1つずつ読み込む。本番コードで使用する。 |
| alazy_load| `lazy_load`の非同期版 |
| load      | **積極的に**すべてのドキュメントをメモリに読み込む。プロトタイピングや対話的な作業で使用する。 |
| aload     | **積極的に**すべてのドキュメントをメモリに読み込む。プロトタイピングや対話的な作業で使用する。**2024-04にLangChainに追加** |

* `load`メソッドは、プロトタイピング作業のための便利なメソッドで、単に`list(self.lazy_load())`を呼び出しているだけです。
* `alazy_load`にはデフォルトの実装があり、`lazy_load`に委譲します。非同期を使う場合は、デフォルトの実装をオーバーライドし、ネイティブの非同期実装を提供することをお勧めします。

::: {.callout-important}
ドキュメントローダーを実装する際は、`lazy_load`または`alazy_load`メソッドにパラメーターを渡さないでください。

すべての設定は初期化子(`__init__`)を通じて渡す必要があります。これはLangChainの設計上の選択で、ドキュメントローダーがインスタンス化された後に、ドキュメントを読み込むために必要な情報がすべて揃っていることを保証するためです。
:::

### 実装

ファイルの各行からドキュメントを作成するスタンダードなドキュメントローダーの例を示します。

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

### テスト 🧪

ドキュメントローダーをテストするには、良質なコンテンツを含むファイルが必要です。

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
`load()`は対話型の環境(Jupyter Notebookなど)で便利です。

メモリに収まるすべてのコンテンツを積極的に読み込むため、本番コードでは使用しないでください。特に企業データの場合、そのようなアプローチは適切ではありません。
:::

```python
loader.load()
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 0, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 2, 'source': './meow.txt'})]
```

## ファイルの扱い

多くのドキュメントローダーはファイルの解析を伴います。ローダーの違いは、ファイルの読み込み方ではなく、ファイルのパース方法にあります。例えば、PDFやMarkdownファイルのバイナリコンテンツを読み込むのに`open`を使えますが、そのバイナリデータをテキストに変換するためのパースロジックは異なります。

そのため、パースロジックをロード処理から切り離すと、データの読み込み方法に関わらずパーサーを再利用しやすくなります。

### BaseBlobParser

`BaseBlobParser`は、`blob`を受け取り、`Document`オブジェクトのリストを出力するインターフェイスです。`blob`は、メモリ内またはファイル内にあるデータの表現です。LangChain Pythonには、[Blob WebAPI spec](https://developer.mozilla.org/en-US/docs/Web/API/Blob)に着想を得た`Blob`プリミティブがあります。

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

**blob** APIを使うと、ファイルから読み込まずにメモリ上のコンテンツを直接ロードできるという利点もあります。

```python
blob = Blob(data=b"some data from memory\nmeow")
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='some data from memory\n', metadata={'line_number': 1, 'source': None}),
 Document(page_content='meow', metadata={'line_number': 2, 'source': None})]
```

### Blob

BlobのAPIについて簡単に見ていきましょう。

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

### Blobローダー

パーサーがバイナリデータをドキュメントにパースするために必要なロジックをカプセル化するのに対し、*Blobローダー*は特定のストレージ場所からBlobをロードするために必要なロジックをカプセル化します。

現時点で、`LangChain`は`FileSystemBlobLoader`のみをサポートしています。

`FileSystemBlobLoader`を使ってBlobをロードし、パーサーを使ってそれらを解析することができます。

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

### 汎用ローダー

LangChainには`GenericLoader`抽象化があり、これは`BlobLoader`と`BaseBlobParser`を合成したものです。

`GenericLoader`は、既存の`BlobLoader`実装を簡単に使用できるようにする標準化されたクラスメソッドを提供することを目的としています。現時点では、`FileSystemBlobLoader`のみがサポートされています。

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

#### カスタムジェネリックローダー

クラスを作成することが好きな場合は、サブクラス化してロジックをカプセル化することができます。

このクラスをサブクラス化して、既存のローダーを使ってコンテンツをロードすることができます。

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
