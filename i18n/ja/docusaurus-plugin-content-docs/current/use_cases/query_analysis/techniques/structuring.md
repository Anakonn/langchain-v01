---
sidebar_position: 3
translated: true
---

# 構造化

検索における最も重要なステップの1つは、テキスト入力を適切な検索およびフィルター条件に変換することです。この、構造化されていない入力から構造化されたパラメーターを抽出するプロセスを、**クエリ構造化**と呼んでいます。

例として、[クイックスタート](/docs/use_cases/query_analysis/quickstart)で取り上げた LangChain YouTube ビデオの Q&A ボットの例に戻り、より複雑な構造化クエリがどのように見えるかを見てみましょう。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-openai youtube-transcript-api pytube
```

#### 環境変数の設定

この例では OpenAI を使用します:

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### サンプルドキュメントの読み込み

代表的なドキュメントを読み込みましょう

```python
from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=pbAd8O1Lvm4", add_video_info=True
).load()
```

ビデオのメタデータは以下の通りです:

```python
docs[0].metadata
```

```output
{'source': 'pbAd8O1Lvm4',
 'title': 'Self-reflective RAG with LangGraph: Self-RAG and CRAG',
 'description': 'Unknown',
 'view_count': 9006,
 'thumbnail_url': 'https://i.ytimg.com/vi/pbAd8O1Lvm4/hq720.jpg',
 'publish_date': '2024-02-07 00:00:00',
 'length': 1058,
 'author': 'LangChain'}
```

ドキュメントの内容の一部は以下の通りです:

```python
docs[0].page_content[:500]
```

```output
"hi this is Lance from Lang chain I'm going to be talking about using Lang graph to build a diverse and sophisticated rag flows so just to set the stage the basic rag flow you can see here starts with a question retrieval of relevant documents from an index which are passed into the context window of an llm for generation of an answer grounded in the ret documents so that's kind of the basic outline and we can see it's like a very linear path um in practice though you often encounter a few differ"
```

## クエリスキーマ

構造化クエリを生成するには、まずクエリスキーマを定義する必要があります。各ドキュメントにはタイトル、視聴回数、公開日、秒数があることがわかります。ドキュメントの内容とタイトルに対する非構造化検索を行い、視聴回数、公開日、ビデオ長さに対するレンジフィルタリングを使用できるインデックスを構築したと仮定しましょう。

まずは、視聴回数、公開日、ビデオ長さの各フィールドに対して明示的な最小値と最大値を持つスキーマを作成します。また、トランスクリプトの内容とビデオタイトルに対する個別の属性を追加します。

別の方法として、各フィルター可能なフィールドに対して個別の属性を持つ代わりに、`filters` 属性に (属性、条件、値) のタプルのリストを取るより一般的なスキーマを作成することもできます。これらの方法のどちらが適切かは、インデックスの複雑さによって異なります。フィルター可能なフィールドが多い場合は、単一の `filters` クエリ属性の方が良いでしょう。フィルター可能なフィールドが少なく、特定の方法でのみフィルタリングできるフィールドがある場合は、個別の属性を持つスキーマの方が適切です。

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None,
        description="Minimum view count filter, inclusive. Only use if explicitly specified.",
    )
    max_view_count: Optional[int] = Field(
        None,
        description="Maximum view count filter, exclusive. Only use if explicitly specified.",
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Earliest publish date filter, inclusive. Only use if explicitly specified.",
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Latest publish date filter, exclusive. Only use if explicitly specified.",
    )
    min_length_sec: Optional[int] = Field(
        None,
        description="Minimum video length in seconds, inclusive. Only use if explicitly specified.",
    )
    max_length_sec: Optional[int] = Field(
        None,
        description="Maximum video length in seconds, exclusive. Only use if explicitly specified.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

## クエリ生成

ユーザーの質問を構造化クエリに変換するには、ChatOpenAI のようなファンクション呼び出しモデルを使用します。LangChain には、Pydantic クラスを使ってファンクション呼び出しスキーマを簡単に指定できるコンストラクターがあります。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a database query optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

試してみましょう:

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag from scratch
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
earliest_publish_date: 2023-01-01
latest_publish_date: 2024-01-01
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes"
    }
).pretty_print()
```

```output
content_search: multi-modal models agent
title_search: multi-modal models agent
max_length_sec: 300
```

## 代替案: 簡潔なスキーマ

フィルター可能なフィールドが多い場合、冗長なスキーマではパフォーマンスが低下したり、ファンクションスキーマのサイズ制限により実現できない可能性があります。そのような場合は、指定の明確さを少し犠牲にして簡潔なクエリスキーマを試すことができます。

```python
from typing import List, Literal, Union


class Filter(BaseModel):
    field: Literal["view_count", "publish_date", "length_sec"]
    comparison: Literal["eq", "lt", "lte", "gt", "gte"]
    value: Union[int, datetime.date] = Field(
        ...,
        description="If field is publish_date then value must be a ISO-8601 format date",
    )


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description="Filters over specific fields. Final condition is a logical conjunction of all filters.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

```python
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

試してみましょう:

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag
filters: []
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: 2023
filters: [Filter(field='publish_date', comparison='eq', value=datetime.date(2023, 1, 1))]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes and with over 276 views"
    }
).pretty_print()
```

```output
content_search: multi-modal models in an agent
title_search: multi-modal models agent
filters: [Filter(field='length_sec', comparison='lt', value=300), Filter(field='view_count', comparison='gte', value=276)]
```

アナライザーは整数を上手く扱えますが、日付範囲の処理には苦戦しているようです。スキーマの説明やプロンプトを調整して、この問題を修正することができます。

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description=(
            "Filters over specific fields. Final condition is a logical conjunction of all filters. "
            "If a time period longer than one day is specified then it must result in filters that define a date range. "
            f"Keep in mind the current date is {datetime.date.today().strftime('%m-%d-%Y')}."
        ),
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
filters: [Filter(field='publish_date', comparison='gte', value=datetime.date(2023, 1, 1)), Filter(field='publish_date', comparison='lte', value=datetime.date(2023, 12, 31))]
```

これで上手く動作するようです!

## ソート: 検索を超えて

特定のインデックスでは、フィールドによる検索だけでなく、フィールドによるソートも可能です。構造化クエリを使えば、結果をソートするためのクエリフィールドを簡単に追加できます。

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        "",
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        "",
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None, description="Minimum view count filter, inclusive."
    )
    max_view_count: Optional[int] = Field(
        None, description="Maximum view count filter, exclusive."
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None, description="Earliest publish date filter, inclusive."
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None, description="Latest publish date filter, exclusive."
    )
    min_length_sec: Optional[int] = Field(
        None, description="Minimum video length in seconds, inclusive."
    )
    max_length_sec: Optional[int] = Field(
        None, description="Maximum video length in seconds, exclusive."
    )
    sort_by: Literal[
        "relevance",
        "view_count",
        "publish_date",
        "length",
    ] = Field("relevance", description="Attribute to sort by.")
    sort_order: Literal["ascending", "descending"] = Field(
        "descending", description="Whether to sort in ascending or descending order."
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "What has LangChain released lately?"}
).pretty_print()
```

```output
title_search: LangChain
sort_by: publish_date
```

```python
query_analyzer.invoke({"question": "What are the longest videos?"}).pretty_print()
```

```output
sort_by: length
```

検索とソートを組み合わせることもできます。これは、関連性の閾値を超えるすべての結果を最初に取得し、その後指定された属性に従ってソートするといった具合です。

```python
query_analyzer.invoke(
    {"question": "What are the shortest videos about agents?"}
).pretty_print()
```

```output
content_search: agents
sort_by: length
sort_order: ascending
```
