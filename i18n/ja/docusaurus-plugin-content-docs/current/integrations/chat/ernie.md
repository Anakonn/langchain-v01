---
sidebar_label: Ernie Bot Chat
translated: true
---

# ErnieBotChat

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11) は、Baidu によって開発された大規模な言語モデルであり、膨大な量の中国語データをカバーしています。
このノートブックでは、ErnieBot チャットモデルの使い方について説明します。

**廃止予定の警告**

ユーザーには `langchain_community.chat_models.ErnieBotChat` の代わりに `langchain_community.chat_models.QianfanChatEndpoint` を使用することをお勧めします。

`QianfanChatEndpoint` のドキュメントは[こちら](/docs/integrations/chat/baidu_qianfan_endpoint/)です。

`QianfanChatEndpoint` を使用することをお勧めする理由は4つあります：

1. `QianfanChatEndpoint` は Qianfan プラットフォーム上のより多くの LLM をサポートします。
2. `QianfanChatEndpoint` はストリーミングモードをサポートします。
3. `QianfanChatEndpoint` は関数呼び出しの使用をサポートします。
4. `ErnieBotChat` はメンテナンスが不足しており、廃止予定です。

移行のためのヒント：

- `ernie_client_id` を `qianfan_ak` に、`ernie_client_secret` を `qianfan_sk` に変更します。
- `qianfan` パッケージをインストールします。例：`pip install qianfan`
- `ErnieBotChat` を `QianfanChatEndpoint` に変更します。

```python
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## 使用方法

```python
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

または、環境変数に `client_id` と `client_secret` を設定することもできます

```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

```python
chat([HumanMessage(content="hello there, who are you?")])
```

```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```
