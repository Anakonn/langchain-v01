---
sidebar_class_name: hidden
sidebar_position: 4
translated: true
---

# ツール

ツールとは、エージェント、チェーン、またはLLMが世界と対話するために使用できるインターフェイスです。
ツールには以下のようなものが含まれます:

1. ツールの名称
2. ツールの説明
3. ツールへの入力のJSONスキーマ
4. 呼び出す関数
5. ツールの結果をユーザーに直接返すべきかどうか

これらの情報を持つことは有用です。これらの情報を使ってアクションを取るシステムを構築できるためです。名称、説明、JSONスキーマはLLMにプロンプトとして使用でき、呼び出す関数はそのアクションを実行することに相当します。

ツールへの入力が単純であるほど、LLMがそれを使いやすくなります。
多くのエージェントは単一の文字列入力のツールしか使えません。
エージェントの種類とどのようなツールが使えるかについては、[このドキュメント](../agents/agent_types)を参照してください。

重要なのは、名称、説明、JSONスキーマ(使用する場合)がすべてプロンプトに使用されることです。したがって、それらが明確で、ツールの使い方を正確に説明することが非常に重要です。LLMがツールの使い方を理解できない場合は、デフォルトの名称、説明、JSONスキーマを変更する必要があります。

## デフォルトのツール

ツールの使い方を見ていきましょう。そのために、組み込みのツールを使ってみます。

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```

次にツールを初期化します。ここでは好きなように設定できます。

```python
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
```

これがデフォルトの名称です。

```python
tool.name
```

```output
'Wikipedia'
```

これがデフォルトの説明です。

```python
tool.description
```

```output
'A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.'
```

これがデフォルトの入力のJSONスキーマです。

```python
tool.args
```

```output
{'query': {'title': 'Query', 'type': 'string'}}
```

ツールの結果をユーザーに直接返すべきかどうかを確認できます。

```python
tool.return_direct
```

```output
False
```

辞書型の入力でツールを呼び出すことができます。

```python
tool.run({"query": "langchain"})
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

単一の文字列入力でもツールを呼び出すことができます。
このツールは単一の入力を期待しているため、これができます。
複数の入力を必要とする場合は、そうすることはできません。

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## デフォルトのツールのカスタマイズ

組み込みのツールの名称、説明、JSONスキーマを変更することもできます。

引数のJSONスキーマを定義する際は、関数の入力を変更してはいけません。ただし、各入力の説明をカスタマイズすることはできます。

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
```

```python
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
```

```python
tool.name
```

```output
'wiki-tool'
```

```python
tool.description
```

```output
'look up things in wikipedia'
```

```python
tool.args
```

```output
{'query': {'title': 'Query',
  'description': 'query to look up in Wikipedia, should be 3 or less words',
  'type': 'string'}}
```

```python
tool.return_direct
```

```output
True
```

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## その他のトピック

これはLangChainのツールの簡単な紹介でしたが、さらに学ぶことがたくさんあります。

**[組み込みのツール](/docs/integrations/tools/)**: 組み込みのツールの一覧は[このページ](/docs/integrations/tools/)を参照してください。

**[カスタムツール](./custom_tools)**: 組み込みのツールは便利ですが、独自のツールを定義する必要がほとんどでしょう。その方法は[このガイド](./custom_tools)を参照してください。

**[ツールキット](./toolkits)**: ツールキットとは、うまく連携するツールの集まりです。詳しい説明と組み込みのツールキットの一覧は[このページ](./toolkits)を参照してください。

**[OpenAI Functions としてのツール](./tools_as_openai_functions)**: ツールはOpenAI Functionsとよく似ており、簡単に変換できます。その方法は[このノートブック](./tools_as_openai_functions)を参照してください。
