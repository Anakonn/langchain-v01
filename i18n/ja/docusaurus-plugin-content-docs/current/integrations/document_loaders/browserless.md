---
translated: true
---

# ブラウザレス

ブラウザレスは、クラウド上でヘッドレスChrome インスタンスを実行できるサービスです。インフラストラクチャの管理を気にせずに、スケールでブラウザベースの自動化を実行する優れた方法です。

ドキュメントローダーとしてブラウザレスを使用するには、このノートブックに示されているように、`BrowserlessLoader` インスタンスを初期化します。デフォルトでは、`BrowserlessLoader` はページの `body` 要素の `innerText` を返します。生のHTMLを取得するには、`text_content` を `False` に設定します。

```python
from langchain_community.document_loaders import BrowserlessLoader
```

```python
BROWSERLESS_API_TOKEN = "YOUR_BROWSERLESS_API_TOKEN"
```

```python
loader = BrowserlessLoader(
    api_token=BROWSERLESS_API_TOKEN,
    urls=[
        "https://en.wikipedia.org/wiki/Document_classification",
    ],
    text_content=True,
)

documents = loader.load()

print(documents[0].page_content[:1000])
```

```output
Jump to content
Main menu
Search
Create account
Log in
Personal tools
Toggle the table of contents
Document classification
17 languages
Article
Talk
Read
Edit
View history
Tools
From Wikipedia, the free encyclopedia

Document classification or document categorization is a problem in library science, information science and computer science. The task is to assign a document to one or more classes or categories. This may be done "manually" (or "intellectually") or algorithmically. The intellectual classification of documents has mostly been the province of library science, while the algorithmic classification of documents is mainly in information science and computer science. The problems are overlapping, however, and there is therefore interdisciplinary research on document classification.

The documents to be classified may be texts, images, music, etc. Each kind of document possesses its special classification problems. When not otherwise specified, text classification is implied.

Do
```
