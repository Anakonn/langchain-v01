---
translated: true
---

# Slack

>[Slack](https://slack.com/)は即時メッセージングプログラムです。

このノートブックでは、`Slack`エクスポートから生成された Zipファイルからドキュメントを読み込む方法について説明します。

`Slack`エクスポートを取得するには、以下の手順に従ってください:

## 🧑 自分のデータセットを取り込むための手順

Slackデータをエクスポートします。これは、ワークスペース管理ページに移動し、「インポート/エクスポート」オプションをクリックすることで行えます({your_slack_domain}.slack.com/services/export)。次に、適切な日付範囲を選択し、「エクスポートの開始」をクリックします。Slackから、エクスポートが完了したときにメールとDMが送信されます。

ダウンロードにより、ダウンロードフォルダー(またはお使いのOSの設定に応じて、ダウンロードの保存場所)に `.zip`ファイルが生成されます。

`.zip`ファイルのパスをコピーし、以下の `LOCAL_ZIPFILE`に割り当ててください。

```python
from langchain_community.document_loaders import SlackDirectoryLoader
```

```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```

```python
docs = loader.load()
docs
```
