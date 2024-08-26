---
sidebar_position: 1
translated: true
---

# 分解

ユーザーが質問をすると、単一のクエリで関連する結果を返すことができるとは限りません。時には質問を明確な部分質問に分割し、各部分質問の結果を取得し、累積したコンテキストを使って答える必要があります。

例えば、ユーザーが「Web Voyagerとリフレクションエージェントの違いは何ですか」と質問した場合、Web Voyagerを説明する文書とリフレクションエージェントを説明する文書はあるものの、両者を比較する文書がない場合、「Web Voyagerとは何か」と「リフレクションエージェントとは何か」を個別に検索し、取得した文書を組み合わせて答えるほうが良い結果が得られます。

入力を複数の明確な部分クエリに分割するこのプロセスを、**クエリ分解**と呼びます。これは時に**部分クエリ生成**とも呼ばれます。このガイドでは、[クイックスタート](/docs/use_cases/query_analysis/quickstart)のLangChain YouTubeビデオに関するQ&Aボットの例を使って、クエリ分解の方法を説明します。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-openai
```

#### 環境変数の設定

この例ではOpenAIを使用します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## クエリ生成

ユーザーの質問を部分クエリのリストに変換するために、OpenAIの関数呼び出しAPIを使用します。これにより、1回の呼び出しで複数の関数を返すことができます:

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class SubQuery(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    sub_query: str = Field(
        ...,
        description="A very specific query against the database.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into distinct sub questions that \
you need to answer in order to answer the original question.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([SubQuery])
parser = PydanticToolsParser(tools=[SubQuery])
query_analyzer = prompt | llm_with_tools | parser
```

試してみましょう:

```python
query_analyzer.invoke({"question": "how to do rag"})
```

```output
[SubQuery(sub_query='How to do rag')]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[SubQuery(sub_query='How to use multi-modal models in a chain?'),
 SubQuery(sub_query='How to turn a chain into a REST API?')]
```

```python
query_analyzer.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query='What is Web Voyager and how does it differ from Reflection Agents?'),
 SubQuery(sub_query='Do Web Voyager and Reflection Agents use Langgraph?')]
```

## 例の追加とプロンプトのチューニング

これでかなりうまくいきますが、最後の質問をさらに分解して、Web Voyagerとリフレクションエージェントに関する個別のクエリにしたいと思います。事前に、インデックスに最適なクエリの種類がわからない場合は、冗長性を意図的に含めることで、部分クエリと上位レベルのクエリの両方を返すことができます。

クエリ生成の結果をチューニングするために、入力質問と正解クエリの例を追加することができます。また、システムメッセージを改善することもできます。

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
queries = [
    SubQuery(sub_query="What is chat langchain"),
    SubQuery(sub_query="What is a langchain template"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How would I use LangGraph to build an automaton"
queries = [
    SubQuery(sub_query="How to build automaton with LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
queries = [
    SubQuery(sub_query="How to build multi-agent system"),
    SubQuery(sub_query="How to stream intermediate steps"),
    SubQuery(sub_query="How to stream intermediate steps from multi-agent system"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "What's the difference between LangChain agents and LangGraph?"
queries = [
    SubQuery(sub_query="What's the difference between LangChain agents and LangGraph?"),
    SubQuery(sub_query="What are LangChain agents"),
    SubQuery(sub_query="What is LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

次に、プロンプトテンプレートとチェーンを更新して、例を各プロンプトに含めるようにする必要があります。OpenAI関数呼び出しを使用しているので、入力と出力の例をモデルに送信するためにいくつかの追加の構造化が必要です。`tool_example_to_messages`ヘルパー関数を作成して、これを処理します:

```python
import uuid
from typing import Dict, List

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)


def tool_example_to_messages(example: Dict) -> List[BaseMessage]:
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "This is an example of a correct usage of this tool. Make sure to continue using the tool this way."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into the most specific sub questions you can \
which will help you answer the original question. Each sub question should be about a single concept/fact/idea.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
query_analyzer_with_examples = (
    prompt.partial(examples=example_msgs) | llm_with_tools | parser
)
```

```python
query_analyzer_with_examples.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query="What's the difference between web voyager and reflection agents"),
 SubQuery(sub_query='Do web voyager and reflection agents use LangGraph'),
 SubQuery(sub_query='What is web voyager'),
 SubQuery(sub_query='What are reflection agents')]
```
