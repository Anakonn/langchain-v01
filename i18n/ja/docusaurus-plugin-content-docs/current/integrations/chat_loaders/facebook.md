---
translated: true
---

# Facebook Messenger

このノートブックでは、ファインチューニングできる形式でFacebookのデータをロードする方法を示します。全体の手順は以下の通りです:

1. メッセンジャーデータをディスクにダウンロードする。
2. `ChatLoader`を作成し、`loader.load()`(または`loader.lazy_load()`)を呼び出してコンバージョンを実行する。
3. 必要に応じて`merge_chat_runs`を使ってメッセージを同じ送信者のものを連続させたり、`map_ai_messages`を使って指定した送信者のメッセージを"AIMessage"クラスに変換したりする。これらを行った後、`convert_messages_for_finetuning`を呼び出してファインチューニング用のデータを準備する。

これらの作業が完了したら、モデルのファインチューニングを行うことができます。以下の手順に従ってください:

4. メッセージをOpenAIにアップロードし、ファインチューニングジョブを実行する。
6. 得られたモデルをLangChainアプリで使用する!

それでは始めましょう。

## 1. データのダウンロード

自分のメッセンジャーデータをダウンローするには、[ここ](https://www.zapptales.com/en/download-facebook-messenger-chat-history-how-to/)の手順に従ってください。重要 - JSONフォーマットでダウンロードしてください(HTMLではありません)。

このウォークスルーでは、[このGoogleドライブのリンク](https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing)にあるサンプルデータを使用します。

```python
# This uses some example data
import zipfile

import requests


def download_and_unzip(url: str, output_path: str = "file.zip") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")

    with zipfile.ZipFile(output_path, "r") as zip_ref:
        zip_ref.extractall()
        print(f"File {output_path} has been unzipped.")


# URL of the file to download
url = (
    "https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing"
)

# Download and unzip
download_and_unzip(url)
```

```output
File file.zip downloaded.
File file.zip has been unzipped.
```

## 2. ChatLoaderの作成

`FacebookMessengerChatLoader`クラスには2種類あり、1つはチャットディレクトリ全体用、もう1つは個別のファイル用です。

```python
directory_path = "./hogwarts"
```

```python
from langchain_community.chat_loaders.facebook_messenger import (
    FolderFacebookMessengerChatLoader,
    SingleFileFacebookMessengerChatLoader,
)
```

```python
loader = SingleFileFacebookMessengerChatLoader(
    path="./hogwarts/inbox/HermioneGranger/messages_Hermione_Granger.json",
)
```

```python
chat_session = loader.load()[0]
chat_session["messages"][:3]
```

```output
[HumanMessage(content="Hi Hermione! How's your summer going so far?", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="Harry! Lovely to hear from you. My summer is going well, though I do miss everyone. I'm spending most of my time going through my books and researching fascinating new topics. How about you?", additional_kwargs={'sender': 'Hermione Granger'}),
 HumanMessage(content="I miss you all too. The Dursleys are being their usual unpleasant selves but I'm getting by. At least I can practice some spells in my room without them knowing. Let me know if you find anything good in your researching!", additional_kwargs={'sender': 'Harry Potter'})]
```

```python
loader = FolderFacebookMessengerChatLoader(
    path="./hogwarts",
)
```

```python
chat_sessions = loader.load()
len(chat_sessions)
```

```output
9
```

## 3. ファインチューニングの準備

`load()`を呼び出すと、抽出できたチャットメッセージがすべて人間のメッセージとして返されます。チャットボットとの会話では、実際の会話に比べてより厳密な対話パターンが見られます。

メッセージ"ラン"(同じ送信者からの連続したメッセージ)をマージしたり、"AI"を表す送信者を選択したりすることができます。ファインチューニングされたLLMはこれらのAIメッセージを生成するように学習します。

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
```

```python
merged_sessions = merge_chat_runs(chat_sessions)
alternating_sessions = list(map_ai_messages(merged_sessions, "Harry Potter"))
```

```python
# Now all of Harry Potter's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
alternating_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately.", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="What is it, Potter? I'm quite busy at the moment.", additional_kwargs={'sender': 'Severus Snape'}),
 AIMessage(content="I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister.", additional_kwargs={'sender': 'Harry Potter'})]
```

#### OpenAI形式の辞書に変換できるようになりました

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(alternating_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 9 dialogues for training
```

```python
training_data[0][:3]
```

```output
[{'role': 'assistant',
  'content': "Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately."},
 {'role': 'user',
  'content': "What is it, Potter? I'm quite busy at the moment."},
 {'role': 'assistant',
  'content': "I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister."}]
```

OpenAIでは現在、ファインチューニングジョブに最低10個の訓練例が必要ですが、ほとんどのタスクでは50〜100個が推奨されています。今回は9つのチャットセッションしかないので、それらを(オプションで重複させて)分割して、各訓練例が会話の一部で構成されるようにします。

Facebookのチャットセッション(1人につき1つ)は、しばしば複数日にわたり会話が続くため、長期的な依存関係をモデル化する必要はそれほど重要ではないかもしれません。

```python
# Our chat is alternating, we will make each datapoint a group of 8 messages,
# with 2 messages overlapping
chunk_size = 8
overlap = 2

training_examples = [
    conversation_messages[i : i + chunk_size]
    for conversation_messages in training_data
    for i in range(0, len(conversation_messages) - chunk_size + 1, chunk_size - overlap)
]

len(training_examples)
```

```output
100
```

## 4. モデルのファインチューニング

モデルのファインチューニングの時間です。`openai`がインストールされ、`OPENAI_API_KEY`が適切に設定されていることを確認してください。

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
for m in training_examples:
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
File file-ULumAXLEFw3vB6bb9uy6DNVC ready after 0.00 seconds.
```

ファイルの準備ができたら、トレーニングジョブを開始しましょう。

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

お茶でも飲みながら、モデルの準備を待ちましょう。少し時間がかかるかもしれません!

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
Status=[running]... 874.29s. 56.93s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::8QnAzWMr
```

## 5. LangChainでの使用

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
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What classes are you taking?"}):
    print(tok, end="", flush=True)
```

```output
I'm taking Charms, Defense Against the Dark Arts, Herbology, Potions, Transfiguration, and Ancient Runes. How about you?
```
