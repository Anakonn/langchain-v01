---
translated: true
---

# LangSmith Chat Datasets

このノートブックでは、LangSmith chatデータセットを簡単に読み込み、そのデータでモデルを微調整する方法を示します。
このプロセスは簡単で、3つのステップで構成されています。

1. chatデータセットを作成する。
2. LangSmithDatasetChatLoaderを使用してサンプルを読み込む。
3. モデルを微調整する。

その後、微調整したモデルをLangChainアプリで使用できます。

始める前に、前提条件をインストールしましょう。

## 前提条件

langchain >= 0.0.311をインストールし、LangSmith APIキーを使用して環境を構成していることを確認してください。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
```

## 1. データセットを選択する

このノートブックでは、微調整するランを選択することで、直接モデルを微調整します。これらは追跡されたランから選別することが多いでしょう。LangSmithデータセットの詳細については、[docs](https://docs.smith.langchain.com/evaluation/concepts#datasets)を参照できます。

このチュートリアルのために、ここで既存のデータセットをアップロードしましょう。

```python
from langsmith.client import Client

client = Client()
```

```python
import requests

url = "https://raw.githubusercontent.com/langchain-ai/langchain/master/docs/docs/integrations/chat_loaders/example_data/langsmith_chat_dataset.json"
response = requests.get(url)
response.raise_for_status()
data = response.json()
```

```python
dataset_name = f"Extraction Fine-tuning Dataset {uid}"
ds = client.create_dataset(dataset_name=dataset_name, data_type="chat")
```

```python
_ = client.create_examples(
    inputs=[e["inputs"] for e in data],
    outputs=[e["outputs"] for e in data],
    dataset_id=ds.id,
)
```

## 2. データを準備する

次に、LangSmithRunChatLoaderのインスタンスを作成し、lazy_load()メソッドを使ってチャットセッションを読み込みます。

```python
from langchain_community.chat_loaders.langsmith import LangSmithDatasetChatLoader

loader = LangSmithDatasetChatLoader(dataset_name=dataset_name)

chat_sessions = loader.lazy_load()
```

#### チャットセッションが読み込まれたら、微調整に適した形式に変換します。

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. モデルを微調整する

OpenAIライブラリを使用して、微調整プロセスを開始します。

```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# Wait for the fine-tuning to complete (this may take some time)
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# Now your model is fine-tuned!
```

```output
Status=[running]... 429.55s. 46.34s
```

## 4. LangChainで使用する

微調整が完了したら、結果のモデルIDをLangChainアプリのChatOpenAIモデルクラスで使用します。

```python
# Get the fine-tuned model ID
job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# Use the fine-tuned model in LangChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```

```python
model.invoke("There were three ravens sat on a tree.")
```

```output
AIMessage(content='[{"s": "There were three ravens", "object": "tree", "relation": "sat on"}, {"s": "three ravens", "object": "a tree", "relation": "sat on"}]')
```

これで、LangSmith LLMランのデータを使ってモデルを正常に微調整できました!
