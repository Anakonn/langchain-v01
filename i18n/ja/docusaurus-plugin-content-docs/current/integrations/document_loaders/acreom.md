---
translated: true
---

# acreom

[acreom](https://acreom.com)は、ローカルのMarkdownファイルで動作するタスクを持つ、開発者中心のナレッジベースです。

以下は、Langchainにacreomのローカルボールトを読み込む方法の例です。acreomのローカルボールトはプレーンテキストの.mdファイルのフォルダーなので、ローダーにはディレクトリへのパスが必要です。

ボールトファイルにはメタデータが含まれている場合があり、`collect_metadata`が`true`に設定されていると、これらの値がドキュメントのメタデータに追加されます。

```python
from langchain_community.document_loaders import AcreomLoader
```

```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```

```python
docs = loader.load()
```
