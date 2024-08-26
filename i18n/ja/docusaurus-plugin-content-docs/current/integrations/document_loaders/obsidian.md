---
translated: true
---

# Obsidian

>[Obsidian](https://obsidian.md/)は、プレーンテキストファイルのローカルフォルダの上に構築された強力で拡張性のある知識ベースです。

このノートブックでは、`Obsidian`データベースからドキュメントを読み込む方法について説明します。

`Obsidian`はディスク上にMarkdownファイルのフォルダとして保存されているため、ローダーはこのディレクトリへのパスを取るだけです。

`Obsidian`ファイルには時々[メタデータ](https://help.obsidian.md/Editing+and+formatting/Metadata)が含まれており、これはファイルの先頭にあるYAMLブロックです。これらの値はドキュメントのメタデータに追加されます。(`ObsidianLoader`には`collect_metadata=False`引数を渡して、この動作を無効にすることもできます。)

```python
from langchain_community.document_loaders import ObsidianLoader
```

```python
loader = ObsidianLoader("<path-to-obsidian>")
```

```python
docs = loader.load()
```
