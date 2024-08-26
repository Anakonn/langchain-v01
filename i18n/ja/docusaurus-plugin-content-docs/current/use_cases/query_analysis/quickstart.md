---
sidebar_position: 0
translated: true
---

# クイックスタート

このページでは、基本的なエンドツーエンドの例を使って、クエリ分析の使用方法を示します。これには、シンプルな検索エンジンの作成、生のユーザー質問をそのまま渡すと発生する障害モードの表示、そしてクエリ分析がその問題にどのように対処できるかの例が含まれます。クエリ分析には多くの異なる手法があり、このエンドツーエンドの例ではそれらすべてを示すことはできません。

この例では、LangChain YouTubeビデオの検索を行います。

## セットアップ

#### 依存関係のインストール

```python
# %pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma
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

### ドキュメントの読み込み

`YouTubeLoader` を使って、いくつかの LangChain ビデオのトランスクリプトを読み込むことができます:

```python
from langchain_community.document_loaders import YoutubeLoader

urls = [
    "https://www.youtube.com/watch?v=HAn9vnJy6S4",
    "https://www.youtube.com/watch?v=dA1cHGACXCo",
    "https://www.youtube.com/watch?v=ZcEMLz27sL4",
    "https://www.youtube.com/watch?v=hvAPnpSfSGo",
    "https://www.youtube.com/watch?v=EhlPDL4QrWY",
    "https://www.youtube.com/watch?v=mmBo8nlu2j0",
    "https://www.youtube.com/watch?v=rQdibOsL1ps",
    "https://www.youtube.com/watch?v=28lC4fqukoc",
    "https://www.youtube.com/watch?v=es-9MgxB-uc",
    "https://www.youtube.com/watch?v=wLRHwKuKvOE",
    "https://www.youtube.com/watch?v=ObIltMaRJvY",
    "https://www.youtube.com/watch?v=DjuXACWYkkU",
    "https://www.youtube.com/watch?v=o7C9ld6Ln-M",
]
docs = []
for url in urls:
    docs.extend(YoutubeLoader.from_youtube_url(url, add_video_info=True).load())
```

```python
import datetime

# Add some additional metadata: what year the video was published
for doc in docs:
    doc.metadata["publish_year"] = int(
        datetime.datetime.strptime(
            doc.metadata["publish_date"], "%Y-%m-%d %H:%M:%S"
        ).strftime("%Y")
    )
```

ロードしたビデオのタイトルは以下の通りです:

```python
[doc.metadata["title"] for doc in docs]
```

```output
['OpenGPTs',
 'Building a web RAG chatbot: using LangChain, Exa (prev. Metaphor), LangSmith, and Hosted Langserve',
 'Streaming Events: Introducing a new `stream_events` method',
 'LangGraph: Multi-Agent Workflows',
 'Build and Deploy a RAG app with Pinecone Serverless',
 'Auto-Prompt Builder (with Hosted LangServe)',
 'Build a Full Stack RAG App With TypeScript',
 'Getting Started with Multi-Modal LLMs',
 'SQL Research Assistant',
 'Skeleton-of-Thought: Building a New Template from Scratch',
 'Benchmarking RAG over LangChain Docs',
 'Building a Research Assistant from Scratch',
 'LangServe and LangChain Templates Webinar']
```

各ビデオのメタデータは以下の通りです。タイトル、視聴回数、公開日、長さが確認できます:

```python
docs[0].metadata
```

```output
{'source': 'HAn9vnJy6S4',
 'title': 'OpenGPTs',
 'description': 'Unknown',
 'view_count': 7210,
 'thumbnail_url': 'https://i.ytimg.com/vi/HAn9vnJy6S4/hq720.jpg',
 'publish_date': '2024-01-31 00:00:00',
 'length': 1530,
 'author': 'LangChain',
 'publish_year': 2024}
```

ドキュメントの内容の一部は以下の通りです:

```python
docs[0].page_content[:500]
```

```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```

### ドキュメントのインデックス化

検索を行うには、クエリできるドキュメントのインデックスを作成する必要があります。ベクトルストアを使ってドキュメントをインデックス化し、より簡潔で正確な検索ができるようにチャンクに分割します:

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
chunked_docs = text_splitter.split_documents(docs)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    chunked_docs,
    embeddings,
)
```

## クエリ分析なしの検索

ユーザーの質問を直接類似性検索することで、質問に関連するチャンクを見つけることができます:

```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```

```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```

これはうまくいきます! 最初の結果は質問に非常に関連性があります。

特定の期間のビデオを検索したい場合はどうでしょうか?

```python
search_results = vectorstore.similarity_search("videos on RAG published in 2023")
print(search_results[0].metadata["title"])
print(search_results[0].metadata["publish_date"])
print(search_results[0].page_content[:500])
```

```output
OpenGPTs
2024-01-31
hardcoded that it will always do a retrieval step here the assistant decides whether to do a retrieval step or not sometimes this is good sometimes this is bad sometimes it you don't need to do a retrieval step when I said hi it didn't need to call it tool um but other times you know the the llm might mess up and not realize that it needs to do a retrieval step and so the rag bot will always do a retrieval step so it's more focused there because this is also a simpler architecture so it's always
```

最初の結果は 2024 年のものですが (2023 年を求めたにもかかわらず)、入力にはあまり関連性がありません。ドキュメントの内容だけを検索しているため、ドキュメントの属性でフィルタリングすることはできません。

これは発生し得る障害モードの1つにすぎません。では、基本的なクエリ分析がこれをどのように修正できるかを見てみましょう!

## クエリ分析

クエリ分析を使って、検索結果を改善することができます。これには、公開日のフィルタリングを含む **クエリスキーマ** を定義し、ユーザーの質問を構造化クエリに変換するための関数呼び出しモデルを使用します。

### クエリスキーマ

この場合、公開日の最小値と最大値を明示的に属性として持つことにします。

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

### クエリ生成

ユーザーの質問を構造化クエリに変換するために、OpenAIのツール呼び出しAPIを使用します。具体的には、[ChatModel.with_structured_output()](/docs/modules/model_io/chat/structured_output)コンストラクタを使って、スキーマをモデルに渡し、出力を解析します。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
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

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

先ほど検索した質問に対して、アナライザーが生成するクエリを見てみましょう:

```python
query_analyzer.invoke("how do I build a RAG agent")
```

```output
Search(query='build RAG agent', publish_year=None)
```

```python
query_analyzer.invoke("videos on RAG published in 2023")
```

```output
Search(query='RAG', publish_year=2023)
```

## クエリ分析を使った検索

クエリ分析の結果はかなり良好です。では、生成されたクエリを使って実際に検索を行ってみましょう。

**注意:** 例では `tool_choice="Search"` を指定しています。これにより、LLMに1つのツールのみを呼び出させるため、常に最適化されたクエリが1つ得られます。これが常に当てはまるわけではないことに注意してください - 最適化されたクエリが得られない、または複数得られる場合の対処方法については、他のガイドを参照してください。

```python
from typing import List

from langchain_core.documents import Document
```

```python
def retrieval(search: Search) -> List[Document]:
    if search.publish_year is not None:
        # This is syntax specific to Chroma,
        # the vector database we are using.
        _filter = {"publish_year": {"$eq": search.publish_year}}
    else:
        _filter = None
    return vectorstore.similarity_search(search.query, filter=_filter)
```

```python
retrieval_chain = query_analyzer | retrieval
```

先ほどの問題のある入力に対してこのチェーンを実行すると、その年のみの結果が得られます!

```python
results = retrieval_chain.invoke("RAG tutorial published in 2023")
```

```python
[(doc.metadata["title"], doc.metadata["publish_date"]) for doc in results]
```

```output
[('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('LangServe and LangChain Templates Webinar', '2023-11-02 00:00:00'),
 ('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('Building a Research Assistant from Scratch', '2023-11-16 00:00:00')]
```
