---
translated: true
---

# Discord

>[Discord](https://discord.com/) は、VoIP およびインスタントメッセージングのソーシャルプラットフォームです。ユーザーは、プライベートチャットや「サーバー」と呼ばれるコミュニティの一部として、音声通話、ビデオ通話、テキストメッセージ、メディア、ファイルを使用して通信することができます。サーバーは、招待リンクを介してアクセスできる、永続的なチャットルームとボイスチャンネルのコレクションです。

以下の手順に従って、`Discord` データをダウンロードしてください:

1. **ユーザー設定**に移動します
2. **プライバシーと安全性**に移動します
3. **すべてのデータを要求する**に移動し、**データを要求する**ボタンをクリックします

データを受け取るまでに最大 30 日かかる可能性があります。Discord に登録されているメールアドレスに、ダウンロードボタンが記載されたメールが届きます。このボタンを使用して、個人の Discord データをダウンロードできます。

```python
import os

import pandas as pd
```

```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```

```python
from langchain_community.document_loaders.discord import DiscordChatLoader
```

```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```
