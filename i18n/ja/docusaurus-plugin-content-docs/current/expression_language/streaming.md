---
sidebar_position: 1.5
title: ストリーミング
translated: true
---

# LangChainによるストリーミング

ストリーミングは、LLMに基づくアプリケーションをエンドユーザーにとって応答性の高いものにするために重要です。

LLM、パーサー、プロンプト、リトリーバー、エージェントなどの重要なLangChainプリミティブは、LangChainの[Runnable Interface](/docs/expression_language/interface)を実装しています。

このインターフェースは、コンテンツをストリーミングするための2つの一般的なアプローチを提供します。

1. sync `stream` と async `astream`: チェーンから**最終出力**をストリーミングする**デフォルト実装**。
2. async `astream_events` と async `astream_log`: チェーンから**中間ステップ**と**最終出力**の両方をストリーミングする方法を提供します。

両方のアプローチを見て、それらをどのように使用するかを理解してみましょう。 🥷

## Streamの使用

すべての`Runnable`オブジェクトは、`stream`という同期メソッドと、その非同期バリアントである`astream`を実装しています。

これらのメソッドは、チャンクごとに最終出力をストリーミングするように設計されており、チャンクが利用可能になるとすぐにそれを生成します。

ストリーミングは、プログラム内のすべてのステップが**入力ストリーム**を処理する方法を知っている場合にのみ可能です。つまり、入力チャンクを一度に1つずつ処理し、それに対応する出力チャンクを生成します。

この処理の複雑さは、LLMが生成したトークンを発行するような簡単なタスクから、完全なJSONが完成する前にJSON結果の一部をストリーミングするような難しいものまで様々です。

ストリーミングを探求するための最良の出発点は、LLMアプリの中で最も重要なコンポーネントであるLLM自体です！

### LLMとチャットモデル

大規模言語モデルとそのチャットバリアントは、LLMベースのアプリの主要なボトルネックです。 🙊

大規模言語モデルは、クエリに完全な応答を生成するのに**数秒**かかることがあります。これは、アプリケーションがエンドユーザーに応答性があると感じる**約200-300ミリ秒**の閾値よりもはるかに遅いです。

アプリケーションがより応答性を感じさせるための主要な戦略は、中間の進行状況を表示することです。つまり、モデルからの出力を**トークンごとに**ストリーミングすることです。

[Anthropic](/docs/integrations/platforms/anthropic)のチャットモデルを使用したストリーミングの例を示します。モデルを使用するには、`langchain-anthropic`パッケージをインストールする必要があります。次のコマンドでインストールできます：

```python
pip install -qU langchain-anthropic
```

```python
# Showing the example using anthropic, but you can use
# your favorite chat model!
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic()

chunks = []
async for chunk in model.astream("hello. tell me something about yourself"):
    chunks.append(chunk)
    print(chunk.content, end="|", flush=True)
```

```output
 Hello|!| My| name| is| Claude|.| I|'m| an| AI| assistant| created| by| An|throp|ic| to| be| helpful|,| harmless|,| and| honest|.||
```

チャンクの1つを調べてみましょう

```python
chunks[0]
```

```output
AIMessageChunk(content=' Hello')
```

`AIMessageChunk`と呼ばれるものが返されました。このチャンクは、`AIMessage`の一部を表します。

メッセージチャンクは追加的な設計になっており、単純にそれらを追加することでこれまでの応答の状態を取得できます。

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```output
AIMessageChunk(content=' Hello! My name is')
```

### チェーン

事実上すべてのLLMアプリケーションは、言語モデルへの呼び出しだけではなく、より多くのステップを含みます。

プロンプト、モデル、およびパーサーを組み合わせた`LangChain Expression Language`（`LCEL`）を使用してシンプルなチェーンを構築し、ストリーミングが機能することを確認しましょう。

`StrOutputParser`を使用してモデルからの出力を解析します。これは、`AIMessageChunk`の`content`フィールドを抽出し、モデルから返された`token`を取得する単純なパーサーです。

:::tip
LCELは、異なるLangChainプリミティブを連鎖させることによって「プログラム」を指定する*宣言的な*方法です。LCELを使用して作成されたチェーンは、`stream`および`astream`の自動実装の恩恵を受け、最終出力のストリーミングを可能にします。実際、LCELを使用して作成されたチェーンは、標準のRunnableインターフェース全体を実装しています。
:::

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
parser = StrOutputParser()
chain = prompt | model | parser

async for chunk in chain.astream({"topic": "parrot"}):
    print(chunk, end="|", flush=True)
```

```output
 Here|'s| a| silly| joke| about| a| par|rot|:|

What| kind| of| teacher| gives| good| advice|?| An| ap|-|parent| (|app|arent|)| one|!||
```

上記のように、`parser`が実際にはモデルからのストリーミング出力をブロックせず、各チャンクを個別に処理していることに気付くかもしれません。多くの[LCELプリミティブ](/docs/expression_language/primitives)も、このような変換スタイルのパススルーストリーミングをサポートしており、アプリの構築時に非常に便利です。

[プロンプトテンプレート](/docs/modules/model_io/prompts)や[チャットモデル](/docs/modules/model_io/chat)などの特定のRunnableは、個々のチャンクを処理できず、代わりにすべての前のステップを集約します。これにより、ストリーミングプロセスが中断されます。カスタム関数は[ジェネレータを返すように設計](/docs/expression_language/primitives/functions#streaming)できます。

:::note
上記の機能が構築しているものに関連しない場合、`LangChain Expression Language`を使用せずにLangChainを使用し、各コンポーネントに対して`invoke`、`batch`、または`stream`を個別に呼び出し、結果を変数に割り当て、それを下流で使用する標準の**命令的**プログラミングアプローチに頼ることができます。

それがあなたのニーズに合っているなら、それで問題ありません 👌！
:::

### 入力ストリームの扱い

生成中の出力からJSONをストリーミングしたい場合はどうしますか？

部分的なjsonを解析するために`json.loads`に依存すると、部分的なjsonは有効なjsonではないため、解析は失敗します。

おそらく、何をすべきか全く分からず、JSONのストリーミングは不可能だと主張するでしょう。

実際には、方法があります。パーサーが**入力ストリーム**で動作し、部分的なjsonを有効な状態に「自動補完」しようとする必要があります。

この意味を理解するために、そのようなパーサーを実際に見てみましょう。

```python
from langchain_core.output_parsers import JsonOutputParser

chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models
async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, flush=True)
```

```output
{}
{'countries': []}
{'countries': [{}]}
{'countries': [{'name': ''}]}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 67}]}
{'countries': [{'name': 'France', 'population': 6739}]}
{'countries': [{'name': 'France', 'population': 673915}]}
{'countries': [{'name': 'France', 'population': 67391582}]}
{'countries': [{'name': 'France', 'population': 67391582}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Sp'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 4675}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 467547}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12647}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 1264764}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 126476461}]}
```

次に、ストリーミングを**壊して**みましょう。前の例を使用し、最終的なJSONから国名を抽出する抽出関数を末尾に追加します。

:::warning
**最終入力**よりも**入力ストリーム**で動作するチェーン内のステップは、`stream`または`astream`を介してストリーミング機能を壊す可能性があります。
:::

:::tip
後で**中間ステップ**から結果をストリーミングする`astream_events`APIについて説明します。このAPIは、チェーンに**最終入力**でのみ動作するステップが含まれていても、中間ステップから結果をストリーミングします。
:::

```python
from langchain_core.output_parsers import (
    JsonOutputParser,
)


# A function that operates on finalized inputs
# rather than on an input_stream
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = model | JsonOutputParser() | _extract_country_names

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
['France', 'Spain', 'Japan']|
```

#### ジェネレータ関数

**入力ストリーム**で動作できるジェネレータ関数を使用してストリーミングを修正しましょう。

:::tip
ジェネレータ関数（`yield`を使用する関数）は、**入力ストリーム**で動作するコードを書くことを可能にします。
:::

```python
from langchain_core.output_parsers import JsonOutputParser


async def _extract_country_names_streaming(input_stream):
    """A function that operates on input streams."""
    country_names_so_far = set()

    async for input in input_stream:
        if not isinstance(input, dict):
            continue

        if "countries" not in input:
            continue

        countries = input["countries"]

        if not isinstance(countries, list):
            continue

        for country in countries:
            name = country.get("name")
            if not name:
                continue
            if name not in country_names_so_far:
                yield name
                country_names_so_far.add(name)


chain = model | JsonOutputParser() | _extract_country_names_streaming

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
France|Sp|Spain|Japan|
```

:::note
上記のコードはJSON自動補完に依存しているため、国名の部分（例えば、`Sp`と`Spain`）が表示されることがあります。これは、抽出結果として望ましくないものです！

私たちはチェーンの結果ではなく、ストリーミングの概念に焦点を当てています。
:::

### 非ストリーミングコンポーネント

リトリーバーなどの組み込みコンポーネントの一部は、`ストリーミング`を提供していません。それらを`ストリーム`しようとするとどうなりますか？ 🤨

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho", "harrison likes spicy food"],
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()

chunks = [chunk for chunk in retriever.stream("where did harrison work?")]
chunks
```

```output
[[Document(page_content='harrison worked at kensho'),
  Document(page_content='harrison likes spicy food')]]
```

ストリームはそのコンポーネントから最終結果を生成しました。

これはOKです🥹！すべてのコンポーネントがストリーミングを実装する必要はありません。場合によっては、ストリーミングが不要、困難、または単に意味がないことがあります。

:::tip
非ストリーミングコンポーネントを使用して構築されたLCELチェーンは、多くの場合、チェーン内の最後の非ストリーミングステップの後に部分的な出力のストリーミングが始まることで、依然としてストリーミングを行うことができます。
:::

```python
retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in retrieval_chain.stream(
    "Where did harrison work? " "Write 3 made up sentences about this place."
):
    print(chunk, end="|", flush=True)
```

```output
 Based| on| the| given| context|,| the| only| information| provided| about| where| Harrison| worked| is| that| he| worked| at| Ken|sh|o|.| Since| there| are| no| other| details| provided| about| Ken|sh|o|,| I| do| not| have| enough| information| to| write| 3| additional| made| up| sentences| about| this| place|.| I| can| only| state| that| Harrison| worked| at| Ken|sh|o|.||
```

`stream`と`astream`の働きを見たので、ストリーミングイベントの世界に進んでみましょう。🏞️

## ストリームイベントの使用

イベントストリーミングは**ベータ**APIです。このAPIはフィードバックに基づいて少し変更される可能性があります。

:::note
langchain-core **0.1.14**で導入されました。
:::

```python
import langchain_core

langchain_core.__version__
```

```output
'0.1.18'
```

`astream_events` APIが正しく動作するためには：

* コード全体で可能な限り`async`を使用する（例えば、非同期ツールなど）
* カスタム関数/ランナブルを定義する場合はコールバックを伝播する
* LCELなしでランナブルを使用する場合は、LLMに`ainvoke`ではなく`.astream()`を呼び出すことでLLMがトークンをストリーミングするように強制する
* 何かが期待通りに動作しない場合はお知らせください！ :)

### イベントリファレンス

以下は、さまざまなRunnableオブジェクトによって発生する可能性のあるイベントを示すリファレンステーブルです。

:::note
ストリーミングが適切に実装されている場合、Runnableへの入力は入力ストリームが完全に消費された後でなければわかりません。つまり、`inputs`は通常、`start`イベントではなく`end`イベントにのみ含まれることがよくあります。
:::

| event                | name             | chunk                           | input                                         | output                                          |
|----------------------|------------------|---------------------------------|-----------------------------------------------|-------------------------------------------------|
| on_chat_model_start  | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                 |
| on_chat_model_stream | [model name]     | AIMessageChunk(content="hello") |                                               |                                                 |
| on_chat_model_end    | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start         | [model name]     |                                 | {'input': 'hello'}                            |                                                 |
| on_llm_stream        | [model name]     | 'Hello'                         |                                               |                                                 |
| on_llm_end           | [model name]     |                                 | 'Hello human!'                                |
| on_chain_start       | format_docs      |                                 |                                               |                                                 |
| on_chain_stream      | format_docs      | "hello world!, goodbye world!"  |                                               |                                                 |
| on_chain_end         | format_docs      |                                 | [Document(...)]                               | "hello world!, goodbye world!"                  |
| on_tool_start        | some_tool        |                                 | {"x": 1, "y": "2"}                            |                                                 |
| on_tool_stream       | some_tool        | {"x": 1, "y": "2"}              |                                               |                                                 |
| on_tool_end          | some_tool        |                                 |                                               | {"x": 1, "y": "2"}                              |
| on_retriever_start   | [retriever name] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever name] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever name] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template_name]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template_name]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

### チャットモデル

チャットモデルによって生成されるイベントを見てみましょう。

```python
events = []
async for event in model.astream_events("hello", version="v1"):
    events.append(event)
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

:::note

APIにあるあの変なversion="v1"パラメータは何ですか?! 😾

これは**ベータAPI**であり、ほぼ確実にいくつかの変更を加える予定です。

このバージョンパラメータにより、コードへの破壊的な変更を最小限に抑えることができます。

要するに、今あなたを煩わせることで、後で煩わせる必要がないようにしています。
:::

いくつかのstartイベントといくつかのendイベントを見てみましょう。

```python
events[:3]
```

```output
[{'event': 'on_chat_model_start',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {},
  'data': {'input': 'hello'}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content=' Hello')}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='!')}}]
```

```python
events[-2:]
```

```output
[{'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='')}},
 {'event': 'on_chat_model_end',
  'name': 'ChatAnthropic',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'data': {'output': AIMessageChunk(content=' Hello!')}}]
```

### チェーン

ストリーミングJSONを解析する例のチェーンを再訪して、ストリーミングイベントAPIを探索してみましょう。

```python
chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models

events = [
    event
    async for event in chain.astream_events(
        'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
        version="v1",
    )
]
```

最初のいくつかのイベントを調べると、**2**つのstartイベントではなく、**3**つのstartイベントがあることに気づくでしょう。

3つのstartイベントは次のものに対応しています：

1. チェーン（モデル＋パーサー）
2. モデル
3. パーサー

```python
events[:3]
```

```output
[{'event': 'on_chain_start',
  'run_id': 'b1074bff-2a17-458b-9e7b-625211710df4',
  'name': 'RunnableSequence',
  'tags': [],
  'metadata': {},
  'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}},
 {'event': 'on_chat_model_start',
  'name': 'ChatAnthropic',
  'run_id': '6072be59-1f43-4f1c-9470-3b92e8406a99',
  'tags': ['seq:step:1'],
  'metadata': {},
  'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}},
 {'event': 'on_parser_start',
  'name': 'JsonOutputParser',
  'run_id': 'bf978194-0eda-4494-ad15-3a5bfe69cd59',
  'tags': ['seq:step:2'],
  'metadata': {},
  'data': {}}]
```

最後の3つのイベントを見たら何が見えると思いますか？中間のイベントはどうでしょうか？

このAPIを使用して、モデルとパーサーからのストリームイベントを出力しましょう。startイベント、endイベント、およびチェーンからのイベントは無視します。

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
...
```

モデルとパーサーの両方がストリーミングをサポートしているため、両方のコンポーネントからリアルタイムでストリーミングイベントが見られます！ちょっとクールじゃないですか？🦜

### イベントのフィルタリング

このAPIは非常に多くのイベントを生成するため、イベントをフィルタリングできると便利です。

コンポーネントの`name`、コンポーネントの`tags`、またはコンポーネントの`type`でフィルタリングできます。

#### 名前でフィルタリング

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_names=["my_parser"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_parser_start', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': []}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': ''}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 6739}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 673915}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}, {}]}}}
...
```

#### タイプでフィルタリング

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_types=["chat_model"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chat_model_start', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' and')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' their')}}
...
```

#### タグでフィルタリング

:::caution

タグは特定のRunnableの子コンポーネントに引き継がれます。

タグを使用してフィルタリングする場合、これが望む結果であることを確認してください。
:::

```python
chain = (model | JsonOutputParser()).with_config({"tags": ["my_chain"]})

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_tags=["my_chain"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chain_start', 'run_id': '190875f3-3fb7-49ad-9b6e-f49da22f3e49', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}}
{'event': 'on_chat_model_start', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_parser_start', 'name': 'JsonOutputParser', 'run_id': '3b5e4ca1-40fe-4a02-9a19-ba2a43a6115c', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
...
```

### 非ストリーミングコンポーネント

一部のコンポーネントが**入力ストリーム**で動作しないため、ストリーミングがうまくいかないことを覚えていますか？

そのようなコンポーネントは`astream`を使用する際に最終出力のストリーミングを壊す可能性がありますが、`astream_events`はストリーミングをサポートする中間ステップからのストリーミングイベントを引き続き生成します！

```python
# Function that does not support streaming.
# It operates on the finalizes inputs rather than
# operating on the input stream.
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = (
    model | JsonOutputParser() | _extract_country_names
)  # This parser only works with OpenAI right now
```

予想どおり、`astream` APIは正しく動作しません。なぜなら`_extract_country_names`はストリーム上で動作しないからです。

```python
async for chunk in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
):
    print(chunk, flush=True)
```

```output
['France', 'Spain', 'Japan']
```

さて、`astream_events`を使用してモデルとパーサーからのストリーミング出力がまだ見られることを確認しましょう。

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
Chat model chunk: '\n     '
Chat model chunk: ' "'
...
```

### コールバックの伝播

:::caution
ツール内でRunnableを呼び出す場合、コールバックをRunnableに伝播させる必要があります。そうしないと、ストリームイベントが生成されません。
:::

:::note
RunnableLambdasや@chainデコレーターを使用する場合、コールバックは自動的に裏で伝播されます。
:::

```python
from langchain_core.runnables import RunnableLambda
from langchain_core.tools import tool


def reverse_word(word: str):
    return word[::-1]


reverse_word = RunnableLambda(reverse_word)


@tool
def bad_tool(word: str):
    """Custom tool that doesn't propagate callbacks."""
    return reverse_word.invoke(word)


async for event in bad_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'name': 'bad_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_tool_stream', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'name': 'bad_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'bad_tool', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

コールバックを正しく伝播させる再実装です。今度は`reverse_word` Runnableからもイベントが取得できていることに気づくでしょう。

```python
@tool
def correct_tool(word: str, callbacks):
    """A tool that correctly propagates callbacks."""
    return reverse_word.invoke(word, {"callbacks": callbacks})


async for event in correct_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'name': 'correct_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello', 'output': 'olleh'}}
{'event': 'on_tool_stream', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'name': 'correct_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'correct_tool', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

Runnable Lambdasや@chains内でRunnableを呼び出す場合、コールバックは自動的にあなたの代わりに渡されます。

```python
from langchain_core.runnables import RunnableLambda


async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


reverse_and_double = RunnableLambda(reverse_and_double)

await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```

そして、@chainデコレーターを使用した場合：

```python
from langchain_core.runnables import chain


@chain
async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```
