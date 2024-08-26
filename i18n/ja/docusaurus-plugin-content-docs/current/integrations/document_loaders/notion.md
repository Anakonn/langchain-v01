---
translated: true
---

# Notion DB 1/2

>[Notion](https://www.notion.so/)は、カンバンボード、タスク、Wiki、データベースを統合した、修正されたMarkdownサポートを持つコラボレーションプラットフォームです。ノートテイキング、ナレッジ管理、データ管理、プロジェクト管理、タスク管理のための総合的なワークスペースです。

このノートブックでは、Notionデータベースダンプからドキュメントを読み込む方法を説明します。

独自のデータセットを取り込むには、以下の手順に従ってください:

## 🧑 データセットを取り込むための手順

Notionからデータセットをエクスポートします。右上の3つのドットをクリックし、`エクスポート`をクリックします。

エクスポートする際は、`Markdown & CSV`形式を選択してください。

これにより、ダウンロードフォルダーに`.zip`ファイルが作成されます。この`.zip`ファイルをこのリポジトリに移動してください。

以下のコマンドを実行してzipファイルを解凍してください(必要に応じて`Export...`の部分を自分のファイル名に置き換えてください)。

```shell
unzip Export-d3adfe0f-3131-4bf3-8987-a52017fc1bae.zip -d Notion_DB
```

以下のコマンドを実行してデータを取り込みます。

```python
from langchain_community.document_loaders import NotionDirectoryLoader
```

```python
loader = NotionDirectoryLoader("Notion_DB")
```

```python
docs = loader.load()
```
