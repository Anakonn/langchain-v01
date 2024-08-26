---
sidebar_position: 2
title: ツール/関数呼び出し
translated: true
---

# ツール呼び出し

:::info
私たちは「ツール呼び出し」という用語を「関数呼び出し」と交換可能に使用します。関数呼び出しが時々単一の関数の呼び出しを指すこともありますが、私たちはすべてのモデルが各メッセージで複数のツールまたは関数呼び出しを返すことができるかのように扱います。
:::

:::tip
ツール呼び出しをサポートするすべてのモデルのリストは[こちら](/docs/integrations/chat/)をご覧ください。
:::

ツール呼び出しにより、モデルはユーザー定義のスキーマに一致する出力を生成して特定のプロンプトに応答することができます。名前が示すようにモデルが何らかのアクションを実行しているわけではありません！モデルはツールの引数を考え出し、実際にツールを実行するかどうかはユーザーに委ねられます。例えば、非構造化テキストから[特定のスキーマに一致する出力を抽出する](/docs/use_cases/extraction/)場合、「抽出」ツールをモデルに与え、それが望むスキーマに一致するパラメータを取り、生成された出力を最終結果として扱うことができます。

ツール呼び出しには名前、引数辞書、およびオプションの識別子が含まれます。引数辞書は `{argument_name: argument_value}` の形式で構成されます。

多くのLLMプロバイダー、例えば[Anthropic](https://www.anthropic.com/)、[Cohere](https://cohere.com/)、[Google](https://cloud.google.com/vertex-ai)、[Mistral](https://mistral.ai/)、[OpenAI](https://openai.com/)などが、ツール呼び出し機能のバリエーションをサポートしています。これらの機能は通常、LLMへのリクエストに利用可能なツールとそのスキーマを含めることができ、応答にこれらのツールの呼び出しを含めることができます。例えば、検索エンジンツールが与えられた場合、LLMは最初に検索エンジンへの呼び出しを発行することでクエリを処理するかもしれません。LLMを呼び出すシステムはツール呼び出しを受け取り、それを実行し、その出力をLLMに返して応答に反映させることができます。LangChainは[組み込みツール](/docs/integrations/tools/)の一式を含んでおり、自分の[カスタムツール](/docs/modules/tools/custom_tools)を定義するためのいくつかの方法をサポートしています。ツール呼び出しは、[ツール使用チェーンおよびエージェント](/docs/use_cases/tool_use)の構築や、モデルからの構造化出力を得るために非常に有用です。

プロバイダーはツールスキーマとツール呼び出しをフォーマットするために異なる規約を採用しています。例えば、Anthropicはツール呼び出しを大きなコンテンツブロック内の解析された構造として返します：

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

一方、OpenAIはツール呼び出しを別のパラメータに分離し、引数をJSON文字列として含めます：

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChainはツールを定義し、それらをLLMに渡し、ツール呼び出しを表現するための標準インターフェースを実装しています。

## リクエスト: モデルにツールを渡す

モデルがツールを呼び出せるようにするためには、チャットリクエストを行う際にツールスキーマをモデルに渡す必要があります。ツール呼び出し機能をサポートするLangChain ChatModelsは、リストのLangChain[ツールオブジェクト](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool)、Pydanticクラス、またはJSONスキーマを受け取り、それらをプロバイダー固有の期待される形式でチャットモデルにバインドする `.bind_tools` メソッドを実装しています。バインドされたチャットモデルの後続の呼び出しは、モデルAPIへの各呼び出しにツールスキーマを含めます。

### ツールスキーマの定義: LangChain Tool

例えば、Python関数に `@tool` デコレーターを使用してカスタムツールのスキーマを定義できます：

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### ツールスキーマの定義: Pydanticクラス

同様にPydanticを使用してスキーマを定義することもできます。Pydanticはツール入力がより複雑な場合に便利です：

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

これらをチャットモデルにバインドする方法は次のとおりです：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### ツールスキーマのバインド

`bind_tools()` メソッドを使用して `Multiply` を「ツール」として変換し、モデルにバインド（つまり、モデルが呼び出されるたびに渡す）することができます。

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## リクエスト: ツール呼び出しの強制

`bind_tools(tools)` を使用するだけでは、モデルは1つのツール呼び出し、複数のツール呼び出し、またはツール呼び出しをまったく返さないことを選択できます。一部のモデルは、モデルにツールを呼び出させる能力を与える `tool_choice` パラメータをサポートしています。これをサポートするモデルに対して、モデルが常に呼び出すツールの名前を `tool_choice="xyz_tool_name"` として渡すことができます。または、特定のツールを指定せずに少なくとも1つのツールを呼び出させるために `tool_choice="any"` を渡すことができます。

:::note
現在、`tool_choice="any"` 機能はOpenAI、MistralAI、FireworksAI、Groqがサポートしています。

現在Anthropicは `tool_choice` をまったくサポートしていません。
:::

モデルが常に掛け算ツールを呼び出すようにする場合は次のようにします：

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

加算または掛け算のいずれかを少なくとも1つ呼び出すようにする場合は次のようにします：

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## レスポンス: モデル出力からツール呼び出しを読み取る

ツール呼び出しがLLM応答に含まれている場合、それらは対応する[AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage)または[AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)（ストリーミング時）の `.tool_calls` 属性に [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall) オブジェクトのリストとして添付されます。`ToolCall` は、ツール名、引数値の辞書、および（オプションで）識別子を含む型付き辞書です。ツール呼び出しがないメッセージはこの属性のデフォルトとして空のリストを使用します。

例：

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

`.tool_calls` 属性には有効なツール呼び出しが含まれている必要があります。モデルプロバイダーが時折、形式が正しくないツール呼び出し（例：有効なJSONでない引数）を出力することがあります。これらの場合の解析に失敗すると、[InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall) のインスタンスが `.invalid_tool_calls` 属性に格納されます。`InvalidToolCall` には名前、文字列引数、識別子、およびエラーメッセージが含まれることがあります。

必要に応じて、[出力パーサー](/docs/modules/model_io/output_parsers) を使用して出力をさらに処理できます。例えば、元のPydanticクラスに戻すことができます：

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## レスポンス: ストリーミング

ストリーミングコンテキストでツールが呼び出された場合、
[メッセージチャンク](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) は `.tool_call_chunks` 属性を介してリスト内の [tool call chunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk) オブジェクトでポピュレートされます。`ToolCallChunk` には、ツールの `name`、`args`、`id` のためのオプションの文字列フィールドが含まれ、チャンクを結合するために使用できるオプションの整数フィールド `index` が含まれます。ツール呼び出しの部分が異なるチャンクにストリームされる可能性があるため（例：引数の部分文字列を含むチャンクにはツール名とIDの値がnullである場合がある）、フィールドはオプションです。

メッセージチャンクは親メッセージクラスから継承するため、ツール呼び出しチャンクを持つ [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) には `.tool_calls` および `.invalid_tool_calls` フィールドも含まれます。これらのフィールドはメッセージのツール呼び出しチャンクからベストエフォートで解析されます。

現在、すべてのプロバイダーがツール呼び出しのストリーミングをサポートしているわけではありません。

例：

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

メッセージチャンクを追加すると、それに対応するツール呼び出しチャンクがマージされることに注意してください。これがLangChainのさまざまな[ツール出力パーサー](/docs/modules/model_io/output_parsers/types/openai_tools/)がストリーミングをサポートする原理です。

例えば、以下ではツール呼び出しチャンクを蓄積します：

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

以下ではツール呼び出しを蓄積して部分的な解析を示します：

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## リクエスト: モデルにツール出力を渡す

モデル生成のツール呼び出しを実際にツールを呼び出すために使用し、ツールの結果をモデルに返したい場合は、`ToolMessage` を使用して行うことができます。

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## リクエスト: 少数ショットプロンプティング

より複雑なツールの使用には、プロンプトに少数ショットの例を追加することが非常に有用です。これを行うには、`ToolCall` と対応する `ToolMessage` を持つ `AIMessage` をプロンプトに追加します。

:::note
ほとんどのモデルにとっては、ToolCallとToolMessageのIDが一致することが重要です。つまり、ToolCallsを持つ各AIMessageの後に対応するIDを持つToolMessagesが続くようにする必要があります。

例えば、特別な指示をいくつか追加しても、順序に引っかかることがあります：

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

モデルはまだ何も追加しようとすべきではありません。技術的には119 * 8の結果をまだ知ることはできません。

いくつかの例を含むプロンプトを追加することで、この動作を修正できます：

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

今回は正しい出力が得られるようです。

以下は [LangSmith trace](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r) の結果です。

## 次のステップ

- **Output parsing**: [OpenAI Tools output
    parsers](/docs/modules/model_io/output_parsers/types/openai_tools/)
    および [OpenAI Functions output
    parsers](/docs/modules/model_io/output_parsers/types/openai_functions/) を参照して、関数呼び出しAPIの応答を様々な形式に抽出する方法を学びます。
- **Structured output chains**: [いくつかのモデルにはコンストラクタがあります](/docs/modules/model_io/chat/structured_output/) が、あなたのために構造化された出力チェーンを作成します。
- **Tool use**: [これらのガイド](/docs/use_cases/tool_use/) で呼び出されたツールを使用するチェーンとエージェントを構築する方法を確認します。
