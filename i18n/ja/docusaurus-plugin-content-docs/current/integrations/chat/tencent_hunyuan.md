---
sidebar_label: Tencent Hunyuan
translated: true
---

# Tencent Hunyuan

>[TencentのハイブリッドモデルAPI](https://cloud.tencent.com/document/product/1729) (`Hunyuan API`)
> は、対話コミュニケーション、コンテンツ生成、
> 分析と理解を実装し、インテリジェント
> カスタマーサービス、インテリジェントマーケティング、ロールプレイ、広告コピーライティング、製品説明、
> スクリプト作成、履歴書生成、記事執筆、コード生成、データ分析、コンテンツ
> 分析などのさまざまなシナリオで広く使用できます。

詳しくは[こちら](https://cloud.tencent.com/document/product/1729)をご覧ください。

```python
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```

```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'aime programmer.")
```

## ストリーミング付きChatHunyuanについて

```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessageChunk(content="J'aime programmer.")
```
