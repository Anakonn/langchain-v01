---
translated: true
---

# iMessage

このノートブックでは、iMessageチャットローダーの使用方法を示します。このクラスは、iMessageの会話をLangChainのチャットメッセージに変換するのに役立ちます。

macOSでは、iMessageの会話は `~/Library/Messages/chat.db` にあるsqliteデータベースに保存されています(少なくともmacOS Ventura 13.4の場合)。
`IMessageChatLoader`はこのデータベースファイルから読み込みます。

1. `chat.db`データベースのファイルパスを指定して`IMessageChatLoader`を作成します。
2. `loader.load()`(または`loader.lazy_load()`)を呼び出して変換を行います。オプションで`merge_chat_runs`を使ってメッセージを同じ送信者のものを連続させたり、`map_ai_messages`を使って指定した送信者のメッセージを"AIMessage"クラスに変換したりできます。

## 1. チャットDBにアクセスする

`~/Library/Messages`へのターミナルアクセスは拒否される可能性があります。このクラスを使うには、DBをアクセス可能なディレクトリ(例えばDocuments)にコピーしてそこから読み込むことができます。あるいは(お勧めしませんが)、ターミナルエミュレーターに完全なディスクアクセスを許可することもできます。

使用できる例データベースを[このリンクのドライブファイル](https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing)に用意しました。

```python
# This uses some example data
import requests


def download_drive_file(url: str, output_path: str = "chat.db") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")


url = (
    "https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing"
)

# Download file to chat.db
download_drive_file(url)
```

```output
File chat.db downloaded.
```

## 2. チャットローダーを作成する

ローダーにzipディレクトリのファイルパスを指定します。オプションで、AIメッセージに対応するユーザーIDや、メッセージランの結合を行うかどうかを設定できます。

```python
from langchain_community.chat_loaders.imessage import IMessageChatLoader
```

```python
loader = IMessageChatLoader(
    path="./chat.db",
)
```

## 3. メッセージを読み込む

`load()`(または`lazy_load`)メソッドは、読み込まれた会話ごとのメッセージのリストを含む"ChatSessions"のリストを返します。すべてのメッセージは最初は"HumanMessage"オブジェクトにマップされます。

オプションで、メッセージ"ラン"(同じ送信者からの連続したメッセージ)を結合したり、"AI"を表す送信者を選択したりできます。微調整されたLLMはこれらのAIメッセージを生成するように学習します。

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
# Convert messages from "Tortoise" to AI messages. Do you have a guess who these conversations are between?
chat_sessions: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Tortoise")
)
```

```python
# Now all of the Tortoise's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
chat_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Slow and steady, that's my motto.", additional_kwargs={'message_time': 1693182723, 'sender': 'Tortoise'}, example=False),
 HumanMessage(content='Speed is key!', additional_kwargs={'message_time': 1693182753, 'sender': 'Hare'}, example=False),
 AIMessage(content='A balanced approach is more reliable.', additional_kwargs={'message_time': 1693182783, 'sender': 'Tortoise'}, example=False)]
```

## 3. 微調整のための準備

次は、チャットメッセージをOpenAI形式の辞書に変換します。`convert_messages_for_finetuning`ユーティリティを使って行います。

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(chat_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 10 dialogues for training
```

## 4. モデルを微調整する

モデルを微調整する時間です。`openai`がインストールされ、`OPENAI_API_KEY`が適切に設定されていることを確認してください。

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import json
import time
from io import BytesIO

import openai

# We will write the jsonl file in memory
my_file = BytesIO()
for m in training_data:
    my_file.write((json.dumps({"messages": m}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

# OpenAI audits each training file for compliance reasons.
# This make take a few minutes
status = openai.files.retrieve(training_file.id).status
start_time = time.time()
while status != "processed":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.files.retrieve(training_file.id).status
print(f"File {training_file.id} ready after {time.time() - start_time:.2f} seconds.")
```

```output
File file-zHIgf4r8LltZG3RFpkGd4Sjf ready after 10.19 seconds.
```

ファイルの準備ができたら、トレーニングジョブを開始しましょう。

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

お茶を飲みながらモデルの準備を待ちましょう。少し時間がかかるかもしれません!

```python
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    job = openai.fine_tuning.jobs.retrieve(job.id)
    status = job.status
```

```output
Status=[running]... 524.95s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::7sKoRdlz
```

## 5. LangChainで使用する

得られたモデルIDを直接`ChatOpenAI`モデルクラスで使用できます。

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=job.fine_tuned_model,
    temperature=1,
)
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are speaking to hare."),
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What's the golden thread?"}):
    print(tok, end="", flush=True)
```

```output
A symbol of interconnectedness.
```
