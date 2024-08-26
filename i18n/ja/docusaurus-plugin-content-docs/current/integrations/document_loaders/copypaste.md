---
translated: true
---

# コピー＆ペースト

このノートブックでは、コピー＆ペーストしたいドキュメントオブジェクトをロードする方法について説明します。この場合、DocumentLoaderを使う必要はなく、Documentを直接構築できます。

```python
from langchain_community.docstore.document import Document
```

```python
text = "..... put the text you copy pasted here......"
```

```python
doc = Document(page_content=text)
```

## メタデータ

このテキストの出所に関するメタデータを追加したい場合は、metadataキーを使用できます。

```python
metadata = {"source": "internet", "date": "Friday"}
```

```python
doc = Document(page_content=text, metadata=metadata)
```
