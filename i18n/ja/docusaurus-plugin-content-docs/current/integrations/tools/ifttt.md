---
translated: true
---

# IFTTT ウェブフック

このノートブックでは、IFTTT ウェブフックの使用方法を示します。

https://github.com/SidU/teams-langchain-js/wiki/Connecting-IFTTT-Services から引用。

## ウェブフックの作成

- https://ifttt.com/create にアクセスします。

## "If This" の設定

- IFTTT インターフェイスの "If This" ボタンをクリックします。
- 検索バーで "Webhooks" を検索します。
- "JSON ペイロードを持つウェブリクエストを受信する" という最初のオプションを選択します。
- 接続するサービスに固有のイベント名を選択します。
これにより、ウェブフック URL を管理しやすくなります。
例えば、Spotify に接続する場合は、イベント名を "Spotify" とすることができます。
- "Create Trigger" ボタンをクリックして、設定を保存し、ウェブフックを作成します。

## "Then That" の設定

- IFTTT インターフェイスの "Then That" ボタンをタップします。
- 接続したいサービス、例えば Spotify を検索します。
- サービスからアクションを選択します。例えば "プレイリストにトラックを追加する" など。
- アクションを設定し、必要な詳細を指定します。例えば、プレイリスト名 "AI からの曲" など。
- ウェブフックから受け取った JSON ペイロードをアクションで参照します。Spotify のシナリオでは、検索クエリとして "{{JsonPayload}}" を選択します。
- "Create Action" ボタンをタップして、アクションの設定を保存します。
- アクションの設定が完了したら、"Finish" ボタンをクリックして設定を完了します。
- おめでとうございます! ウェブフックをお望みのサービスに接続し、データの受信とアクションのトリガーの準備ができました 🎉

## 最後に

- ウェブフック URL を取得するには、https://ifttt.com/maker_webhooks/settings にアクセスします。
- そこから IFTTT キーの値をコピーします。URL の形式は https://maker.ifttt.com/use/YOUR_IFTTT_KEY です。YOUR_IFTTT_KEY の値を取得します。

```python
from langchain_community.tools.ifttt import IFTTTWebhook
```

```python
import os

key = os.environ["IFTTTKey"]
url = f"https://maker.ifttt.com/trigger/spotify/json/with/key/{key}"
tool = IFTTTWebhook(
    name="Spotify", description="Add a song to spotify playlist", url=url
)
```

```python
tool.run("taylor swift")
```

```output
"Congratulations! You've fired the spotify JSON event"
```
