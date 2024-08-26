---
sidebar_position: 5
translated: true
---

# 複数のリトリーバーの処理

場合によっては、クエリ分析の手法によって使用するリトリーバーを選択できるようになります。これを使用するには、リトリーバーの選択ロジックを追加する必要があります。ここでは、(モックデータを使用した)簡単な例を示します。

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

偽の情報に対してベクトルストアを作成します。

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="harrison")
retriever_harrison = vectorstore.as_retriever(search_kwargs={"k": 1})

texts = ["Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="ankush")
retriever_ankush = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## クエリ分析

関数呼び出しを使ってアウトプットを構造化します。複数のクエリを返すようにします。

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search for information about a person."""

    query: str = Field(
        ...,
        description="Query to look up",
    )
    person: str = Field(
        ...,
        description="Person to look things up for. Should be `HARRISON` or `ANKUSH`.",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

これにより、リトリーバー間のルーティングが可能になることがわかります。

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(query='workplace', person='HARRISON')
```

```python
query_analyzer.invoke("where did ankush Work")
```

```output
Search(query='workplace', person='ANKUSH')
```

## クエリ分析によるリトリーバル

では、これをチェーンに含めるにはどうすればよいでしょうか? リトリーバーを選択し、検索クエリを渡すための簡単なロジックが必要です。

```python
from langchain_core.runnables import chain
```

```python
retrievers = {
    "HARRISON": retriever_harrison,
    "ANKUSH": retriever_ankush,
}
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    retriever = retrievers[response.person]
    return retriever.invoke(response.query)
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("where did ankush Work")
```

```output
[Document(page_content='Ankush worked at Facebook')]
```
