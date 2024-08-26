---
fixed: true
translated: true
---

# 🦜🕸️LangGraph

[![Downloads](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

⚡ 言語エージェントをグラフとして構築 ⚡

## 概要

[LangGraph](https://langchain-ai.github.io/langgraph/) は、LLMsを使用してステートフルなマルチアクターアプリケーションを構築するためのライブラリです。
[Pregel](https://research.google/pubs/pub37252/) と [Apache Beam](https://beam.apache.org/) に触発され、LangGraphは通常のPython関数（または [JS](https://github.com/langchain-ai/langgraphjs))）を使用して、サイクル計算ステップ全体にわたって複数のチェーン（またはアクター）を調整およびチェックポイントすることができます。公開インターフェースは [NetworkX](https://networkx.org/documentation/latest/) に触発されています。

主な用途は、LLMアプリケーションに**サイクル**と**持続性**を追加することです。迅速な有向非巡回グラフ（DAG）だけが必要な場合は、[LangChain Expression Language](https://python.langchain.com/docs/expression_language/) を使用してこれを達成できます。

サイクルはエージェントの行動に重要で、LLMをループ内で呼び出し、次に取るべきアクションを尋ねる場合に必要です。

## インストール

```shell
pip install -U langgraph
```

## クイックスタート

LangGraphの中心的な概念の一つは状態です。各グラフ実行は状態を作成し、グラフ内のノードが実行される際にその状態がノード間で渡されます。各ノードは実行後にその戻り値で内部状態を更新します。グラフが内部状態を更新する方法は、選択されたグラフの種類またはカスタム関数によって定義されます。

LangGraphの状態はかなり一般的にできますが、簡単に始めるために、組み込みの `MessageGraph` クラスを使用して、グラフの状態がチャットメッセージのリストに限定される例を示します。これは、LangGraphをLangChainチャットモデルと一緒に使用する場合に便利で、チャットモデルの出力を直接返すことができます。

まず、LangChain OpenAI統合パッケージをインストールします：

```python
pip install langchain_openai
```

また、いくつかの環境変数をエクスポートする必要があります：

```shell
export OPENAI_API_KEY=sk-...
```

そして、準備完了です！以下のグラフには、チャットモデルを実行し、結果を返す単一のノード `"oracle"` が含まれています：

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END, MessageGraph

model = ChatOpenAI(temperature=0)

graph = MessageGraph()

graph.add_node("oracle", model)
graph.add_edge("oracle", END)

graph.set_entry_point("oracle")

runnable = graph.compile()
```

実行してみましょう！

```python
runnable.invoke(HumanMessage("What is 1 + 1?"))
```

```python
[HumanMessage(content='What is 1 + 1?'), AIMessage(content='1 + 1 equals 2.')]
```

ここで何をしたのかをステップバイステップで説明します：

1. まず、モデルと `MessageGraph` を初期化します。
2. 次に、与えられた入力でモデルを呼び出すだけの単一のノード `"oracle"` をグラフに追加します。
3. この `"oracle"` ノードから特別な文字列 `END`（`"__end__"`）へのエッジを追加します。これにより、現在のノードの後に実行が終了します。
4. `"oracle"` をグラフのエントリーポイントとして設定します。
5. グラフをコンパイルし、低レベルの [Pregel操作](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/) に変換して実行可能にします。

次に、グラフを実行すると：

1. LangGraphは入力メッセージを内部状態に追加し、その状態をエントリーポイントノード `"oracle"` に渡します。
2. `"oracle"` ノードが実行され、チャットモデルを呼び出します。
3. チャットモデルが `AIMessage` を返します。LangGraphはこれを状態に追加します。
4. 実行が特別な `END` 値に進み、最終状態を出力します。

結果として、2つのチャットメッセージのリストが出力されます。

### LCELとの相互作用

LangChainに既に精通している方への参考として、`add_node` は実際には任意の関数または [runnable](https://python.langchain.com/docs/expression_language/interface/) を入力として受け取ります。上記の例では、モデルは "as-is" で使用されていますが、関数を渡すこともできます：

```python
def call_oracle(messages: list):
    return model.invoke(messages)

graph.add_node("oracle", call_oracle)
```

ただし、[runnable](https://python.langchain.com/docs/expression_language/interface/) への入力は**現在の全状態**であることを念頭に置いてください。したがって、これは失敗します：

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
# This will not work with MessageGraph!
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named {name} who always speaks in pirate dialect"),
    MessagesPlaceholder(variable_name="messages"),
])

chain = prompt | model

# State is a list of messages, but our chain expects a dict input:
#
# { "name": some_string, "messages": [] }
#
# Therefore, the graph will throw an exception when it executes here.
graph.add_node("oracle", chain)
```

## 条件付きエッジ

さて、もう少し複雑なものに進みましょう。LLMsは数学に苦労するので、LLMが条件付きで `"multiply"` ノードを呼び出し、[tool calling](https://python.langchain.com/docs/modules/model_io/chat/function_calling/) を使用して結果を計算できるようにします。

最近のメッセージがツールコールである場合、その結果を計算するために追加の `"multiply"` ノードを持つグラフを再作成します。
また、ツールを必要に応じて使用できるようにするために、OpenAIモデルに電卓のスキーマをツールとして[bind](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) します：

```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def multiply(first_number: int, second_number: int):
    """Multiplies two numbers together."""
    return first_number * second_number

model = ChatOpenAI(temperature=0)
model_with_tools = model.bind_tools([multiply])

builder = MessageGraph()

builder.add_node("oracle", model_with_tools)

tool_node = ToolNode([multiply])
builder.add_node("multiply", tool_node)

builder.add_edge("multiply", END)

builder.set_entry_point("oracle")
```

では、何が起こるべきか考えてみましょう。

- `"oracle"` ノードがツールコールを期待するメッセージを返す場合、`"multiply"` ノードを実行したい
- そうでない場合、実行を終了できます

これを**条件付きエッジ**を使用して達成できます。条件付きエッジは、現在の状態に関数を呼び出し、その関数の出力に基づいてノードへの実行をルーティングします。

その例がこちらです：

```python
from typing import Literal

def router(state: List[BaseMessage]) -> Literal["multiply", "__end__"]:
    tool_calls = state[-1].additional_kwargs.get("tool_calls", [])
    if len(tool_calls):
        return "multiply"
    else:
        return "__end__"

builder.add_conditional_edges("oracle", router)
```

モデルの出力にツールコールが含まれている場合、`"multiply"` ノードに移動します。そうでない場合、実行を終了します。

素晴らしい！残るはグラフをコンパイルして試してみることだけです。数学関連の質問は電卓ツールにルーティングされます：

```python
runnable = builder.compile()

runnable.invoke(HumanMessage("What is 123 * 456?"))
```

```output

[HumanMessage(content='What is 123 * 456?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_OPbdlm8Ih1mNOObGf3tMcNgb', 'function': {'arguments': '{"first_number":123,"second_number":456}', 'name': 'multiply'}, 'type': 'function'}]}),
 ToolMessage(content='56088', tool_call_id='call_OPbdlm8Ih1mNOObGf3tMcNgb')]
```

対話的な応答は直接出力されます：

```python
runnable.invoke(HumanMessage("What is your name?"))
```

```output
[HumanMessage(content='What is your name?'),
 AIMessage(content='My name is Assistant. How can I assist you today?')]
```

## サイクル

では、より一般的なサイクルの例を見てみましょう。LangChainの `AgentExecutor` クラスを再作成します。エージェント自体はチャットモデルとツールコールを使用します。
このエージェントはすべての状態をメッセージのリストとして表します。

いくつかのLangChainコミュニティパッケージと、例として使用するための [Tavily](https://app.tavily.com/sign-in) をインストールする必要があります。

```shell
pip install -U langgraph langchain_openai tavily-python
```

また、OpenAIとTavily APIアクセスのために追加の環境変数をエクスポートする必要があります。

```shell
export OPENAI_API_KEY=sk-...
export TAVILY_API_KEY=tvly-...
```

オプションとして、最高の観測性のために [LangSmith](https://docs.smith.langchain.com/) を設定できます。

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=ls__...
```

### ツールの設定

上記のように、まず使用したいツールを定義します。
このシンプルな例では、ウェブ検索ツールを使用します。
ただし、独自のツールを作成するのは非常に簡単です。方法については[こちら](https://python.langchain.com/docs/modules/agents/tools/custom_tools) のドキュメントを参照してください。

```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
```

これらのツールをシンプルなLangGraph [ToolNode](https://langchain-ai.github.io/langgraph/reference/prebuilt/#toolnode) にラップできます。
このクラスはメッセージのリスト（[tool_calls](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.tool_calls) を含む）を受け取り、LLMが実行するように要求したツールを呼び出し、出力を新しい [ToolMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolMessage.html#langchain_core.messages.tool.ToolMessage)(s) として返します。

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
```

### モデルの設定

次に、使用するチャットモデルをロードする必要があります。

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI

# We will set streaming=True so that we can stream tokens
# See the streaming section for more information on this.
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)
```

これを行った後、モデルがこれらのツールを呼び出せることを確認する必要があります。
これを行うには、LangChainツールをOpenAIツールコール用の形式に変換する [bind_tools()](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) メソッドを使用します。

```python
model = model.bind_tools(tools)
```

### エージェント状態の定義

今回は、より一般的な `StateGraph` を使用します。
このグラフは、各ノードに渡される状態オブジェクトによってパラメータ化されます。
各ノードは、その状態を更新するための操作を返します。
これらの操作は、状態の特定の属性を設定（SET）するか（既存の値を上書き）、既存の属性に追加（ADD）することができます。
設定または追加するかは、構築する状態オブジェクトに注釈を付けて示されます。

この例では、追跡する状態はメッセージのリストだけです。
各ノードがそのリストにメッセージを追加するだけです。
したがって、`TypedDict` を使用し、一つのキー（`messages`）を持ち、それを注釈して、更新時に常に **messages** キーに追加するようにします。二つ目のパラメータ（`operator.add`）を使用して追加されます。
（注：状態は任意の[型](https://docs.python.org/3/library/stdtypes.html#type-objects)にすることができ、[pydantic BaseModel's](https://docs.pydantic.dev/latest/api/base_model/)) を含みます）

```python
from typing import TypedDict, Annotated

def add_messages(left: list, right: list):
    """Add-don't-overwrite."""
    return left + right

class AgentState(TypedDict):
    # The `add_messages` function within the annotation defines
    # *how* updates should be merged into the state.
    messages: Annotated[list, add_messages]
```

初期の例で使用された `MessageGraph` を、このグラフの事前設定されたバージョンと考えることができます。このグラフでは、状態が直接メッセージの配列であり、更新ステップではノードの戻り値を内部状態に追加するだけです。

### ノードを定義する

次に、グラフ内でいくつかの異なるノードを定義する必要があります。
`langgraph`では、ノードは通常のPython関数または[runnable](https://python.langchain.com/docs/expression_language/)のいずれかです。

これには2つの主なノードが必要です：

1. エージェント: どのアクション（もしあれば）を取るかを決定します。
2. ツールを呼び出す関数: エージェントがアクションを取ると決定した場合、このノードがそのアクションを実行します。これはすでに上で定義しました。

また、いくつかのエッジを定義する必要があります。
これらのエッジの一部は条件付きである場合があります。
条件付きである理由は、目的地がグラフの`State`の内容に依存するためです。

取られるパスは、そのノードが実行されるまで（LLMが決定するまで）わかりません。私たちの使用例では、各種類のエッジが1つずつ必要です：

1. 条件付きエッジ: エージェントが呼び出された後、次のいずれかを実行する必要があります：

   a. エージェントがアクションを取るように指示した場合、ツールを実行する、または

   b. エージェントがツールを実行するように指示しなかった場合、終了（ユーザーに応答）

2. 通常のエッジ: ツールが呼び出された後、グラフは常に次に何をするかを決定するためにエージェントに戻る必要があります

ノードを定義し、条件付きエッジを定義する関数も定義しましょう。

```python
from typing import Literal

# Define the function that determines whether to continue or not
def should_continue(state: AgentState) -> Literal["action", "__end__"]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "action" node
    if last_message.tool_calls:
        return "action"
    # Otherwise, we stop (reply to the user)
    return "__end__"


# Define the function that calls the model
def call_model(state: AgentState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}
```

### グラフを定義する

これで、すべてをまとめてグラフを定義できます！

```python
from langgraph.graph import StateGraph, END
# Define a new graph
workflow = StateGraph(AgentState)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.set_entry_point("agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge('action', 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable
app = workflow.compile()
```

### 使ってみましょう！

これで使えるようになりました！
これで他のすべてのLangChainの[runnable](https://python.langchain.com/docs/expression_language/)と同じインターフェースが公開されます。
この[runnable](https://python.langchain.com/docs/expression_language/interface/)はメッセージのリストを受け取ります。

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.messages import HumanMessage

inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
app.invoke(inputs)
```

これは少し時間がかかるかもしれません - 裏でいくつかの呼び出しを行っています。
発生する中間結果をすぐに確認するために、ストリーミングを使用できます - 詳細は以下を参照してください。

## ストリーミング

LangGraphは、いくつかの異なる種類のストリーミングをサポートしています。

### ノード出力のストリーミング

LangGraphを使用する利点の1つは、各ノードによって生成される出力を簡単にストリーミングできることです。

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
for output in app.stream(inputs, stream_mode="updates"):
    # stream() yields dictionaries with output keyed by node name
    for key, value in output.items():
        print(f"Output from node '{key}':")
        print("---")
        print(value)
    print("\n---\n")
```

```output
Output from node 'agent':
---
{'messages': [AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}})]}

---

Output from node 'action':
---
{'messages': [FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json')]}

---

Output from node 'agent':
---
{'messages': [AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---

Output from node '__end__':
---
{'messages': [HumanMessage(content='what is the weather in sf'), AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}}), FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json'), AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---
```

### LLMトークンのストリーミング

各ノードによって生成されるLLMトークンにもアクセスできます。
この場合、「エージェント」ノードのみがLLMトークンを生成します。
これが正しく機能するためには、ストリーミングをサポートするLLMを使用し、LLMを構築する際に設定している必要があります（例：`ChatOpenAI(model="gpt-3.5-turbo-1106", streaming=True)`）

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
async for output in app.astream_log(inputs, include_types=["llm"]):
    # astream_log() yields the requested logs (here LLMs) in JSONPatch format
    for op in output.ops:
        if op["path"] == "/streamed_output/-":
            # this is the output from .stream()
            ...
        elif op["path"].startswith("/logs/") and op["path"].endswith(
            "/streamed_output/-"
        ):
            # because we chose to only include LLMs, these are LLM tokens
            print(op["value"])
```

```output
content='' additional_kwargs={'function_call': {'arguments': '', 'name': 'tavily_search_results_json'}}
content='' additional_kwargs={'function_call': {'arguments': '{\n', 'name': ''}}}
content='' additional_kwargs={'function_call': {'arguments': ' ', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': ' "', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': 'query', 'name': ''}}
...
```

## いつ使用するか

これを[LangChain Expression Language](https://python.langchain.com/docs/expression_language/)と比較していつ使用するべきでしょうか？

サイクルが必要な場合。

Langchain Expression Languageは、チェイン（DAG）を簡単に定義できますが、サイクルを追加するための良いメカニズムがありません。
`langgraph`はその構文を追加します。

## ドキュメント

これで何が構築できるかの味見ができたと思います！詳細を知るには、残りのドキュメントをチェックしてください。

### チュートリアル

[LangGraphチュートリアル](https://langchain-ai.github.io/langgraph/tutorials/)でガイド付きの例を通じてLangGraphの構築方法を学びましょう。

より高度なガイドを試す前に、[LangGraphの紹介](https://langchain-ai.github.io/langgraph/tutorials/introduction/)から始めることをお勧めします。

### ハウツーガイド

[LangGraphハウツーガイド](https://langchain-ai.github.io/langgraph/how-tos/)では、ストリーミングからメモリと永続性の追加、一般的なデザインパターン（分岐、サブグラフなど）まで、LangGraph内で特定のことを達成する方法を示しています。特定のコードスニペットをコピーして実行したい場合は、ここが最適です。

### リファレンス

LangGraphのAPIには、すべての重要なクラスとメソッドが[リファレンスドキュメント](https://langchain-ai.github.io/langgraph/reference/graphs/)でカバーされています。特定の関数引数や、グラフ＋チェックポイントAPIの使用方法の簡単な例、または高レベルのプリビルドコンポーネントのいくつかを確認するために、これらをチェックしてください。
