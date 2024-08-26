---
translated: true
---

# Telegram

このノートブックでは、Telegramチャットローダーの使用方法を示します。このクラスは、エクスポートされたTelegramの会話をLangChainのチャットメッセージにマッピングするのに役立ちます。

このプロセスには3つのステップがあります:
1. Telegramアプリからチャットをコピーし、ローカルコンピューターのファイルに貼り付けることで、チャット.txtファイルをエクスポートする
2. JSONファイルまたはJSONファイルのディレクトリへのファイルパスを指定して、`TelegramChatLoader`を作成する
3. `loader.load()`(または`loader.lazy_load()`)を呼び出して変換を実行する。オプションで`merge_chat_runs`を使ってメッセージを同じ送信者のシーケンスに結合したり、`map_ai_messages`を使って指定した送信者からのメッセージを"AIMessage"クラスに変換したりすることができます。

## 1. メッセージダンプの作成

現在(2023/08/23)、このローダーは[Telegram Desktop App](https://desktop.telegram.org/)からチャット履歴をエクスポートして生成されたJSONファイル形式をベストサポートしています。

**重要:** "Telegram for MacOS"などのライトバージョンのTelegramにはエクスポート機能がありません。正しいアプリを使ってファイルをエクスポートしてください。

エクスポートするには:
1. Telegramデスクトップをダウンロードして開く
2. 会話を選択する
3. 会話の設定(現在は右上の3つのドット)に移動する
4. "チャット履歴をエクスポート"をクリックする
5. 写真やその他のメディアを選択解除する。"機械可読のJSON"形式でエクスポートする。

以下に例を示します:

```python
%%writefile telegram_conversation.json
{
 "name": "Jiminy",
 "type": "personal_chat",
 "id": 5965280513,
 "messages": [
  {
   "id": 1,
   "type": "message",
   "date": "2023-08-23T13:11:23",
   "date_unixtime": "1692821483",
   "from": "Jiminy Cricket",
   "from_id": "user123450513",
   "text": "You better trust your conscience",
   "text_entities": [
    {
     "type": "plain",
     "text": "You better trust your conscience"
    }
   ]
  },
  {
   "id": 2,
   "type": "message",
   "date": "2023-08-23T13:13:20",
   "date_unixtime": "1692821600",
   "from": "Batman & Robin",
   "from_id": "user6565661032",
   "text": "What did you just say?",
   "text_entities": [
    {
     "type": "plain",
     "text": "What did you just say?"
    }
   ]
  }
 ]
}
```

```output
Overwriting telegram_conversation.json
```

## 2. チャットローダーの作成

必要なのはファイルパスだけです。オプションで、AIメッセージにマッピングするユーザー名や、メッセージランを結合するかどうかを指定することもできます。

```python
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```

```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
)
```

## 3. メッセージの読み込み

`load()`(または`lazy_load`)メソッドは、読み込まれた会話ごとのメッセージのリストを含む"ChatSessions"のリストを返します。

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
# Convert messages from "Jiminy Cricket" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Jiminy Cricket")
)
```

### 次のステップ

これらのメッセージは、モデルのファインチューニング、few-shotの例の選択、または次のメッセージの直接予測など、さまざまな用途に使うことができます。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
I said, "You better trust your conscience."
```
