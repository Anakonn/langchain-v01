---
sidebar_position: 3
translated: true
---

# クエリが生成されない場合の対処

場合によっては、クエリ分析手法によって、クエリが生成されない場合もあります。この場合、全体のチェーンでは、クエリ分析の結果を確認してから、リトリーバーを呼び出すかどうかを決める必要があります。

この例では、モックデータを使用します。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

#### 環境変数の設定

この例では OpenAI を使用します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### インデックスの作成

架空の情報に対してベクトルストアを作成します。

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## クエリ分析

関数呼び出しを使ってアウトプットを構造化します。ただし、LLM が検索クエリを表す関数を呼び出す必要がない場合は、それを設定します。また、クエリ分析のプロンプトを使って、いつ検索を行うべきかを明示的に指定します。

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    query: str = Field(
        ...,
        description="Similarity search query applied to job record.",
    )
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You have the ability to issue search queries to get information to help answer user information.

You do not NEED to look things up. If you don't need to, then just respond normally."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

これを呼び出すと、時々 - ただし常に - ツールの呼び出しが返されることがわかります。

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_ZnoVX4j9Mn8wgChaORyd1cvq', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}]})
```

```python
query_analyzer.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## クエリ分析を使ったリトリーバル

では、このようなチェーンにどのように組み込むことができるでしょうか。以下の例を見てみましょう。

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # Could add more logic - like another LLM call - here
        return docs
    else:
        return response
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```
