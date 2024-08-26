---
translated: true
---

# オープン ドキュメント フォーマット (ODT)

>[オフィス アプリケーション用オープン ドキュメント フォーマット (ODF)](https://en.wikipedia.org/wiki/OpenDocument)、通称 `OpenDocument` は、ワープロ文書、スプレッドシート、プレゼンテーション、グラフィックスのためのオープンなファイル形式で、ZIP 圧縮された XML ファイルを使用しています。オフィス アプリケーション用のオープンで XML ベースのファイル形式仕様を提供することを目的として開発されました。

>この規格は、OASIS (Organization for the Advancement of Structured Information Standards) コンソーシアムの技術委員会によって開発および維持されています。これは、`OpenOffice.org` および `LibreOffice` のデフォルトフォーマットである `OpenOffice.org XML` の Sun Microsystems 仕様に基づいています。当初は `StarOffice` 用に「オフィス文書のオープン標準を提供する」ために開発されました。

`UnstructuredODTLoader` は `Open Office ODT` ファイルを読み込むために使用されます。

```python
from langchain_community.document_loaders import UnstructuredODTLoader
```

```python
loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'filename': 'example_data/fake.odt', 'category': 'Title'})
```
