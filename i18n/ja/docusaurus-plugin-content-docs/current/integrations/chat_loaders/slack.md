---
translated: true
---

# Slack

このノートブックでは、Slackチャットローダーの使用方法を示します。このクラスは、エクスポートされたSlackの会話をLangChainのチャットメッセージにマッピングするのに役立ちます。

このプロセスには3つのステップがあります:
1. [ここの手順](https://slack.com/help/articles/1500001548241-Request-to-export-all-conversations)に従って、希望する会話スレッドをエクスポートします。
2. JSONファイルまたはJSONファイルのディレクトリへのファイルパスを指定して、`SlackChatLoader`を作成します。
3. `loader.load()`(または`loader.lazy_load()`)を呼び出して、変換を実行します。オプションで`merge_chat_runs`を使ってメッセージを同じ送信者のものを連続させたり、`map_ai_messages`を使って指定した送信者からのメッセージを"AIMessage"クラスに変換したりすることができます。

## 1. メッセージダンプの作成

現在(2023/08/23)、このローダーは、Slackから直接メッセージの会話をエクスポートして生成されたフォーマットのZIPディレクトリをベストサポートしています。最新の手順については、Slackのドキュメントを参照してください。

LangChainレポジトリに例があります。

```python
import requests

permalink = "https://raw.githubusercontent.com/langchain-ai/langchain/342087bdfa3ac31d622385d0f2d09cf5e06c8db3/libs/langchain/tests/integration_tests/examples/slack_export.zip"
response = requests.get(permalink)
with open("slack_dump.zip", "wb") as f:
    f.write(response.content)
```

## 2. チャットローダーの作成

ローダーにZIPディレクトリへのファイルパスを提供します。オプションで、AIメッセージにマッピングするユーザーIDや、メッセージランを結合するかどうかを指定することができます。

```python
from langchain_community.chat_loaders.slack import SlackChatLoader
```

```python
loader = SlackChatLoader(
    path="slack_dump.zip",
)
```

## 3. メッセージの読み込み

`load()`(または`lazy_load`)メソッドは、読み込まれた会話ごとにメッセージのリストを含む"ChatSessions"のリストを返します。

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "U0500003428" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="U0500003428")
)
```

### 次のステップ

これらのメッセージは、モデルのファインチューニング、few-shotの例の選択、または次のメッセージの直接予測など、さまざまな用途に使うことができます。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[1]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Hi,

I hope you're doing well. I wanted to reach out and ask if you'd be available to meet up for coffee sometime next week. I'd love to catch up and hear about what's been going on in your life. Let me know if you're interested and we can find a time that works for both of us.

Looking forward to hearing from you!

Best, [Your Name]
```
