---
sidebar_position: 2
translated: true
---

# 拡張

情報検索システムは、語句や特定のキーワードに敏感な場合があります。これを緩和するために、古典的な検索手法の1つに、クエリの複数のパラフレーズバージョンを生成し、すべてのクエリバージョンの結果を返す「クエリ拡張」があります。LLMはこれらの代替クエリバージョンを生成するのに優れたツールです。

[クイックスタート](/docs/use_cases/query_analysis/quickstart)で始めた、LangChain YouTubeビデオに対するQ&Aボットのクエリ拡張について見ていきましょう。

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

複数のパラフレーズを確実に得るために、OpenAIの関数呼び出しAPIを使用します。

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class ParaphrasedQuery(BaseModel):
    """You have performed query expansion to generate a paraphrasing of a question."""

    paraphrased_query: str = Field(
        ...,
        description="A unique paraphrasing of the original question.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query expansion. If there are multiple common ways of phrasing a user question \
or common synonyms for key words in the question, make sure to return multiple versions \
of the query with the different phrasings.

If there are acronyms or words you are not familiar with, do not try to rephrase them.

Return at least 3 versions of the question."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([ParaphrasedQuery])
query_analyzer = prompt | llm_with_tools | PydanticToolsParser(tools=[ParaphrasedQuery])
```

先ほど検索した質問に対して、アナライザーが生成したクエリを見てみましょう:

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[ParaphrasedQuery(paraphrased_query='How to utilize multi-modal models sequentially and convert the sequence into a REST API'),
 ParaphrasedQuery(paraphrased_query='Steps for using multi-modal models in a series and transforming the series into a RESTful API'),
 ParaphrasedQuery(paraphrased_query='Guide on employing multi-modal models in a chain and converting the chain into a RESTful API')]
```

```python
query_analyzer.invoke({"question": "stream events from llm agent"})
```

```output
[ParaphrasedQuery(paraphrased_query='How to stream events from LLM agent?'),
 ParaphrasedQuery(paraphrased_query='How can I receive events from LLM agent in real-time?'),
 ParaphrasedQuery(paraphrased_query='What is the process for capturing events from LLM agent?')]
```
