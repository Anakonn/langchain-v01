---
sidebar_position: 3
title: ファイルの処理
translated: true
---

生のテキストデータの他に、PowerPointプレゼンテーションやPDFなどの他のファイルタイプから情報を抽出したい場合があります。

LangChain の[ドキュメントローダー](/docs/modules/data_connection/document_loaders/)を使用して、ファイルをLLMに入力できるテキスト形式に解析することができます。

LangChainには多数の[ドキュメントローダーの統合](/docs/integrations/document_loaders)が用意されています。

## MIMEタイプに基づく解析

基本的な解析例については、[ドキュメントローダー](/docs/modules/data_connection/document_loaders/)を参照してください。

ここでは、ユーザーがアップロードしたファイルを処理するサーバーコードを書く場合に便利なMIMEタイプに基づく解析について説明します。

この場合、ユーザーが提供したファイルの拡張子が間違っている可能性があるため、ファイルのバイナリコンテンツからMIMEタイプを推測するのが最善です。

いくつかのコンテンツをダウンロードしましょう。これはHTMLファイルですが、以下のコードは他のファイルタイプでも機能します。

```python
import requests

response = requests.get("https://en.wikipedia.org/wiki/Car")
data = response.content
data[:20]
```

```output
b'<!DOCTYPE html>\n<htm'
```

パーサーを設定します

```python
import magic
from langchain.document_loaders.parsers import BS4HTMLParser, PDFMinerParser
from langchain.document_loaders.parsers.generic import MimeTypeBasedParser
from langchain.document_loaders.parsers.txt import TextParser
from langchain_community.document_loaders import Blob

# Configure the parsers that you want to use per mime-type!
HANDLERS = {
    "application/pdf": PDFMinerParser(),
    "text/plain": TextParser(),
    "text/html": BS4HTMLParser(),
}

# Instantiate a mimetype based parser with the given parsers
MIMETYPE_BASED_PARSER = MimeTypeBasedParser(
    handlers=HANDLERS,
    fallback_parser=None,
)

mime = magic.Magic(mime=True)
mime_type = mime.from_buffer(data)

# A blob represents binary data by either reference (path on file system)
# or value (bytes in memory).
blob = Blob.from_data(
    data=data,
    mime_type=mime_type,
)

parser = HANDLERS[mime_type]
documents = parser.parse(blob=blob)
```

```python
print(documents[0].page_content[:30].strip())
```

```output
Car - Wikipedia
```
