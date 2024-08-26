---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/product/)は、大規模な低レイテンシーと高コンカレンシーの分析クエリを提供するリアルタイム分析データベースサービスです。構造化データと半構造化データに対して Converged Index™ を構築し、ベクトル埋め込みの効率的なストアをサポートしています。スキーマレスデータに対するSQLの実行をサポートしているため、メタデータフィルターを使ったベクトル検索に最適です。

このノートブックでは、[Rockset](https://rockset.com/docs)を使ってチャットメッセージの履歴を保存する方法について説明します。

## 設定

```python
%pip install --upgrade --quiet  rockset
```

まず、[Rockset コンソール](https://console.rockset.com/apikeys)からAPIキーを取得してください。Rockset [APIリファレンス](https://rockset.com/docs/rest-api#introduction)からAPIリージョンを確認してください。

## 例

```python
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

出力は次のようになるはずです:

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False),
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
