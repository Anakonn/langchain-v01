---
sidebar_label: Friendli
translated: true
---

# ChatFriendli

> [Friendli](https://friendli.ai/) は、高需要のAIワークロードに合わせて設計された、スケーラブルで効率的な展開オプションにより、AIアプリケーションのパフォーマンスを向上させ、コスト削減を最適化します。

このチュートリアルでは、LangChainを使用して`ChatFriendli`をチャットアプリケーションに統合する方法を説明します。`ChatFriendli`は、同期および非同期の呼び出しをサポートする、会話型AIレスポンスの生成に柔軟なアプローチを提供します。

## セットアップ

`langchain_community`と`friendli-client`がインストールされていることを確認してください。

```sh
pip install -U langchain-comminity friendli-client.
```

[Friendli Suite](https://suite.friendli.ai/)にサインインして個人アクセストークンを作成し、`FRIENDLI_TOKEN`環境変数に設定します。

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

使用するモデルを選択して、Friendliチャットモデルを初期化できます。デフォルトのモデルは`mixtral-8x7b-instruct-v0-1`です。利用可能なモデルは[docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models)で確認できます。

```python
from langchain_community.chat_models.friendli import ChatFriendli

chat = ChatFriendli(model="llama-2-13b-chat", max_tokens=100, temperature=0)
```

## 使用方法

`FrienliChat`は、[`ChatModel`](/docs/modules/model_io/chat/)のすべてのメソッドをサポートしており、非同期APIも使用できます。

`invoke`、`batch`、`generate`、`stream`の機能も使用できます。

```python
from langchain_core.messages.human import HumanMessage
from langchain_core.messages.system import SystemMessage

system_message = SystemMessage(content="Answer questions as short as you can.")
human_message = HumanMessage(content="Tell me a joke.")
messages = [system_message, human_message]

chat.invoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
chat.batch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
chat.generate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('a0c2d733-6971-4ae7-beea-653856f4e57c')), RunInfo(run_id=UUID('f3d35e44-ac9a-459a-9e4b-b8e3a73a91e1'))])
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```

非同期APIの`ainvoke`、`abatch`、`agenerate`、`astream`の機能も使用できます。

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
await chat.abatch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
await chat.agenerate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('f2255321-2d8e-41cc-adbd-3f4facec7573')), RunInfo(run_id=UUID('fcc297d0-6ca9-48cb-9d86-e6f78cade8ee'))])
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```
