---
keywords:
- gemini
- vertex
- ChatVertexAI
- gemini-pro
sidebar_label: Google Cloud Vertex AI
translated: true
---

# ChatVertexAI

注意: これは Google PaLM統合とは別のものです。Google は GCP を通じて PaLM のエンタープライズ版を提供することを選択しており、そこで提供されるモデルをサポートしています。

ChatVertexAI は Google Cloud で利用可能なすべての基盤モデルを公開しています:

- Gemini (`gemini-pro` および `gemini-pro-vision`)
- テキスト用の PaLM 2 (`text-bison`)
- コード生成用の Codey (`codechat-bison`)

利用可能なモデルの完全で最新のリストは、[VertexAI ドキュメンテーション](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview)をご覧ください。

デフォルトでは、Google Cloud は[顧客データを使用して](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) Google Cloud の AI/ML プライバシーコミットメントの一環として基盤モデルをトレーニングしません。Google がデータを処理する方法の詳細は、[Google のカスタマーデータ処理アドデンダム (CDPA)](https://cloud.google.com/terms/data-processing-addendum)にも記載されています。

`Google Cloud Vertex AI` PaLM を使用するには、`langchain-google-vertexai` Python パッケージをインストールし、次のいずれかを行う必要があります:
- 環境の資格情報を設定する (gcloud、ワークロードアイデンティティなど)
- GOOGLE_APPLICATION_CREDENTIALS 環境変数にサービスアカウントの JSON ファイルのパスを保存する

このコードベースは `google.auth` ライブラリを使用しており、まず上記の認証変数を探し、次にシステムレベルの認証を探します。

詳細については、次のリンクを参照してください:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet  langchain-google-vertexai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI
```

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content=" J'aime la programmation.")
```

Gemini は現在 SystemMessage をサポートしていませんが、最初の人間のメッセージに追加することができます。そのような動作を希望する場合は、`convert_system_message_to_human` を `True` に設定してください:

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="gemini-pro", convert_system_message_to_human=True)

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content="J'aime la programmation.")
```

ユーザー指定のパラメーターを受け取る単純なチェーンを構築したい場合:

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat

chain.invoke(
    {
        "input_language": "English",
        "output_language": "Japanese",
        "text": "I love programming",
    }
)
```

```output
AIMessage(content=' プログラミングが大好きです')
```

## コード生成チャットモデル

Vertex AI 内で Codey API を利用してコードチャットを活用できるようになりました。利用可能なモデルは以下の通りです:
- `codechat-bison`: コードアシスト用

```python
chat = ChatVertexAI(model="codechat-bison", max_tokens=1000, temperature=0.5)

message = chat.invoke("Write a Python function generating all prime numbers")
print(message.content)
```

```output
 ```python
def is_prime(n):
  """
  Check if a number is prime.

  Args:
    n: The number to check.

  Returns:
    True if n is prime, False otherwise.
  """

  # If n is 1, it is not prime.
  if n == 1:
    return False

  # Iterate over all numbers from 2 to the square root of n.
  for i in range(2, int(n ** 0.5) + 1):
    # If n is divisible by any number from 2 to its square root, it is not prime.
    if n % i == 0:
      return False

  # If n is divisible by no number from 2 to its square root, it is prime.
  return True


def find_prime_numbers(n):
  """
  Find all prime numbers up to a given number.

  Args:
    n: The upper bound for the prime numbers to find.

  Returns:
    A list of all prime numbers up to n.
  """

  # Create a list of all numbers from 2 to n.
  numbers = list(range(2, n + 1))

  # Iterate over the list of numbers and remove any that are not prime.
  for number in numbers:
    if not is_prime(number):
      numbers.remove(number)

  # Return the list of prime numbers.
  return numbers
  ```
```

## 完全な生成情報

`generate` メソッドを使用すると、チャット補完だけでなく、[安全性属性](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring)などのメタデータも取得できます。

`generation_info` は使用するモデルによって異なることに注意してください。

### Gemini モデル

`generation_info` には以下が含まれます:

- `is_blocked`: 生成がブロックされたかどうか
- `safety_ratings`: 安全性評価のカテゴリーとラベル

```python
from pprint import pprint

from langchain_core.messages import HumanMessage
from langchain_google_vertexai import HarmBlockThreshold, HarmCategory
```

```python
human = "Translate this sentence from English to French. I love programming."
messages = [HumanMessage(content=human)]


chat = ChatVertexAI(
    model_name="gemini-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
)

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'citation_metadata': None,
 'is_blocked': False,
 'safety_ratings': [{'blocked': False,
                     'category': 'HARM_CATEGORY_HATE_SPEECH',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_HARASSMENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                     'probability_label': 'NEGLIGIBLE'}],
 'usage_metadata': {'candidates_token_count': 6,
                    'prompt_token_count': 12,
                    'total_token_count': 18}}
```

### Non-gemini モデル

`generation_info` には以下が含まれます:

- `is_blocked`: 生成がブロックされたかどうか
- `safety_attributes`: 安全性属性とそのスコアを示す辞書

```python
chat = ChatVertexAI()  # default is `chat-bison`

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'errors': (),
 'grounding_metadata': {'citations': [], 'search_queries': []},
 'is_blocked': False,
 'safety_attributes': [{'Derogatory': 0.1, 'Insult': 0.1, 'Sexual': 0.2}],
 'usage_metadata': {'candidates_billable_characters': 88.0,
                    'candidates_token_count': 24.0,
                    'prompt_billable_characters': 58.0,
                    'prompt_token_count': 12.0}}
```

## Gemini によるツール呼び出し (関数呼び出し)

Gemini モデルにツール定義を渡すことで、適切なときにモデルがそれらのツールを呼び出すことができます。これは LLM 駆動のツール使用だけでなく、より一般的にモデルから構造化された出力を得るのにも役立ちます。

`ChatVertexAI.bind_tools()` を使うと、Pydantic クラス、辞書スキーマ、LangChain ツール、あるいは関数をツールとしてモデルに簡単に渡すことができます。内部的にはこれらが Gemini ツールスキーマに変換されます。

```python
{
    "name": "...",  # tool name
    "description": "...",  # tool description
    "parameters": {...}  # tool input schema as JSONSchema
}
```

```python
from langchain.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm = ChatVertexAI(model="gemini-pro", temperature=0)
llm_with_tools = llm.bind_tools([GetWeather])
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'GetWeather', 'arguments': '{"location": "San Francisco, CA"}'}}, response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'citation_metadata': None, 'usage_metadata': {'prompt_token_count': 41, 'candidates_token_count': 7, 'total_token_count': 48}}, id='run-05e760dc-0682-4286-88e1-5b23df69b083-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}])
```

ツールの呼び出しは `AIMessage.tool_calls` 属性から取得でき、モデル非依存の形式で抽出されます:

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

ツール呼び出しの完全なガイドは[こちら](/docs/modules/model_io/chat/function_calling/)をご覧ください。

## 構造化された出力

多くのアプリケーションでは、構造化されたモデル出力が必要です。ツール呼び出しを使うと、これを確実に行うことができます。[with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) コンストラクターは、モデルから構造化された出力を取得するための簡単なインターフェイスを提供しています。構造化された出力の完全なガイドは[こちら](/docs/modules/model_io/chat/structured_output/)をご覧ください。

### ChatVertexAI.with_structured_outputs()

Gemini モデルから構造化された出力を取得するには、Pydantic クラスまたは JSON スキーマとして目的のスキーマを指定するだけです。

```python
class Person(BaseModel):
    """Save information about a person."""

    name: str = Field(..., description="The person's name.")
    age: int = Field(..., description="The person's age.")


structured_llm = llm.with_structured_output(Person)
structured_llm.invoke("Stefan is already 13 years old")
```

```output
Person(name='Stefan', age=13)
```

### [Legacy] `create_structured_runnable()` の使用

構造化された出力を取得する従来の方法は `create_structured_runnable` コンストラクターを使うことです:

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("My name is Erick and I'm 27 years old")
```

## 非同期呼び出し

Runnables の[非同期インターフェイス](/docs/expression_language/interface)を使って非同期呼び出しを行うことができます。

```python
# for running these examples in the notebook:
import asyncio

import nest_asyncio

nest_asyncio.apply()
```

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="chat-bison", max_tokens=1000, temperature=0.5)
chain = prompt | chat

asyncio.run(
    chain.ainvoke(
        {
            "input_language": "English",
            "output_language": "Sanskrit",
            "text": "I love programming",
        }
    )
)
```

```output
AIMessage(content=' अहं प्रोग्रामनं प्रेमामि')
```

## ストリーミング呼び出し

`stream` メソッドを使ってストリーミング出力を行うこともできます:

```python
import sys

prompt = ChatPromptTemplate.from_messages(
    [("human", "List out the 5 most populous countries in the world")]
)

chat = ChatVertexAI()

chain = prompt | chat

for chunk in chain.stream({}):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
 The five most populous countries in the world are:
1. China (1.4 billion)
2. India (1.3 billion)
3. United States (331 million)
4. Indonesia (273 million)
5. Pakistan (220 million)
```
