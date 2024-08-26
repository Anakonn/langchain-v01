---
translated: true
---

# ReadTheDocs ドキュメンテーション

>[Read the Docs](https://readthedocs.org/) は、オープンソースの無料ソフトウェアドキュメンテーションホスティングプラットフォームです。 `Sphinx` ドキュメンテーションジェネレーターで書かれたドキュメンテーションを生成します。

このノートブックでは、`Read-The-Docs` ビルドの一部として生成されたHTMLからコンテンツを読み込む方法について説明します。

この例については、[こちら](https://github.com/langchain-ai/chat-langchain)を参照してください。

HTMLがすでにフォルダにスクレイピングされていることを前提としています。 次のコマンドのコメントを外して実行することで、これを行うことができます。

```python
%pip install --upgrade --quiet  beautifulsoup4
```

```python
#!wget -r -A.html -P rtdocs https://python.langchain.com/en/latest/
```

```python
from langchain_community.document_loaders import ReadTheDocsLoader
```

```python
loader = ReadTheDocsLoader("rtdocs", features="html.parser")
```

```python
docs = loader.load()
```
