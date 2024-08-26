---
translated: false
---

# モメントキャッシュ

>[Momento Cache](https://docs.momentohq.com/)は、世界初の真のサーバーレスキャッシングサービスです。瞬時の弾力性、ゼロへのスケーラビリティ、および非常に高速なパフォーマンスを提供します。

このノートブックでは、`MomentoChatMessageHistory`クラスを使用してチャットメッセージ履歴を保存する方法について説明します。セットアップの詳細については、Momentoの[ドキュメント](https://docs.momentohq.com/getting-started)を参照してください。

デフォルトでは、指定された名前のキャッシュが既に存在しない場合、新しいキャッシュが作成されることに注意してください。

このクラスを使用するには、Momento APIキーを取得する必要があります。これを直接momento.CacheClientに渡すか、名前付きパラメーター`api_key`として`MomentoChatMessageHistory.from_client_params`に渡すか、環境変数`MOMENTO_API_KEY`として設定することができます。

```python
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
