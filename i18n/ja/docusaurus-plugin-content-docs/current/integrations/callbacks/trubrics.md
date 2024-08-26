---
translated: true
---

# Trubrics

>[Trubrics](https://trubrics.com)は、ユーザープロンプトとAIモデルへのフィードバックを収集、分析、管理できるLLMユーザー分析プラットフォームです。
>
>[Trubrics repo](https://github.com/trubrics/trubrics-sdk)で、`Trubrics`の詳細を確認できます。

このガイドでは、`TrubricsCallbackHandler`のセットアップ方法を説明します。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  trubrics
```

### Trubrics資格情報の取得

Trubrics アカウントをお持ちでない場合は、[こちら](https://trubrics.streamlit.app/)で作成してください。このチュートリアルでは、アカウント作成時に構築された`default`プロジェクトを使用します。

資格情報を環境変数として設定します:

```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```

```python
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### 使用方法

`TrubricsCallbackHandler`には、さまざまなオプション引数を指定できます。Trubrics プロンプトに渡すことができるkwargsについては、[こちら](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics)を参照してください。

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.

    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## 例

Langchain の[LLMs](/docs/modules/model_io/llms/)または[Chat Models](/docs/modules/model_io/chat/)で`TrubricsCallbackHandler`を使用する2つの例を示します。OpenAIモデルを使用するため、`OPENAI_API_KEY`を設定します:

```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. LLMを使用する場合

```python
from langchain_openai import OpenAI
```

```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```

```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```

```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```

```output
--> GPT's joke:

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```

### 2. チャットモデルを使用する場合

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```

```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```

```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```

```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```
