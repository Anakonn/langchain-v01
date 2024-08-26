---
sidebar_position: 2
translated: true
---

# ルーティング

時には、異なるドメインのための複数のインデックスがあり、異なる質問に対して、これらのインデックスのサブセットを照会したい場合があります。例えば、LangChain Pythonドキュメント全体の1つのベクトアストアインデックスと、LangChain JSドキュメント全体の1つのインデックスがあるとします。LangChainの使用に関する質問の場合、質問が参照しているプログラミング言語を推測し、適切なドキュメントを照会したいと思います。**クエリルーティング**は、クエリを実行するインデックスまたはインデックスのサブセットを分類するプロセスです。

## セットアップ

#### 依存関係のインストール

```python
%pip install -qU langchain-core langchain-openai
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

## 関数呼び出しモデルを使ったルーティング

関数呼び出しモデルを使えば、ルーティングに相当する分類を簡単に行うことができます:

```python
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["python_docs", "js_docs", "golang_docs"] = Field(
        ...,
        description="Given a user question choose which datasource would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)

system = """You are an expert at routing a user question to the appropriate data source.

Based on the programming language the question is referring to, route it to the relevant data source."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

router = prompt | structured_llm
```

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

```python
question = """Why doesn't the following code work:

from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(["human", "speak in {language}"])
prompt.invoke("french")
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='python_docs')
```

```python
question = """Why doesn't the following code work:


import { ChatPromptTemplate } from "@langchain/core/prompts";


const chatPrompt = ChatPromptTemplate.fromMessages([
  ["human", "speak in {language}"],
]);

const formattedChatPrompt = await chatPrompt.invoke({
  input_language: "french"
});
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='js_docs')
```

## 複数のインデックスへのルーティング

複数のインデックスを照会したい場合は、スキーマを更新して、データソースのリストを受け入れるようにすることができます:

```python
from typing import List


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasources: List[Literal["python_docs", "js_docs", "golang_docs"]] = Field(
        ...,
        description="Given a user question choose which datasources would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)
router = prompt | structured_llm
router.invoke(
    {
        "question": "is there feature parity between the Python and JS implementations of OpenAI chat models"
    }
)
```

```output
RouteQuery(datasources=['python_docs', 'js_docs'])
```
