---
sidebar_position: 0
translated: true
---

# 빠른 시작

이 페이지에서는 기본적인 엔드 투 엔드 예제를 통해 쿼리 분석을 사용하는 방법을 설명합니다. 여기서는 간단한 검색 엔진을 만들고, 해당 검색 엔진에 원시 사용자 질문을 전달할 때 발생하는 실패 모드를 보여준 후, 쿼리 분석이 이 문제를 어떻게 해결할 수 있는지에 대한 예제를 제공합니다. 다양한 쿼리 분석 기술이 있지만, 이 엔드 투 엔드 예제에서는 모두 다루지는 않습니다.

이 예제에서는 LangChain YouTube 비디오를 검색 대상으로 사용합니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma

```

#### 환경 변수 설정

이 예제에서는 OpenAI를 사용합니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 선택 사항, LangSmith로 실행 추적을 원하면 주석을 해제하세요. 여기에서 가입하세요: https://smith.langchain.com.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

### 문서 로드

`YouTubeLoader`를 사용하여 몇 가지 LangChain 비디오의 트랜스크립트를 로드할 수 있습니다:

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

# 비디오가 게시된 연도와 같은 추가 메타데이터를 추가합니다

for doc in docs:
    doc.metadata["publish_year"] = int(
        datetime.datetime.strptime(
            doc.metadata["publish_date"], "%Y-%m-%d %H:%M:%S"
        ).strftime("%Y")
    )
```

로드된 비디오의 제목은 다음과 같습니다:

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

각 비디오와 관련된 메타데이터는 다음과 같습니다. 각 문서에는 제목, 조회수, 게시 날짜, 길이 등의 정보가 포함되어 있습니다:

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

문서 내용 샘플은 다음과 같습니다:

```python
docs[0].page_content[:500]
```

```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```

### 문서 색인 생성

검색을 수행할 때는 쿼리할 수 있는 문서의 색인을 생성해야 합니다. 벡터 스토어를 사용하여 문서를 색인화하고, 검색 결과가 더 간결하고 정확해지도록 먼저 문서를 청크로 나눌 것입니다:

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

## 쿼리 분석 없이 검색

사용자 질문에 대해 직접 유사성 검색을 수행하여 질문과 관련된 청크를 찾을 수 있습니다:

```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```

```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```

이 방법은 꽤 잘 작동합니다! 첫 번째 결과는 질문과 매우 관련이 있습니다.

특정 기간 동안 게시된 결과를 검색하고 싶다면 어떻게 될까요?

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

첫 번째 결과는 2024년에서 나왔고(2023년 비디오를 요청했음에도 불구하고), 입력과도 별로 관련이 없습니다. 문서 내용만 검색하고 있기 때문에 결과를 문서 속성에 따라 필터링할 방법이 없습니다.

이것은 발생할 수 있는 실패 모드 중 하나에 불과합니다. 이제 쿼리 분석의 기본 형태가 이 문제를 어떻게 해결할 수 있는지 살펴보겠습니다!

## 쿼리 분석

쿼리 분석을 사용하여 검색 결과를 향상시킬 수 있습니다. 이를 위해 **쿼리 스키마**를 정의하고 함수 호출 모델을 사용하여 사용자 질문을 구조화된 쿼리로 변환할 것입니다.

### 쿼리 스키마

이 경우 게시 날짜를 필터링할 수 있도록 명시적인 최소 및 최대 속성을 포함할 것입니다.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스 검색."""

    query: str = Field(
        ...,
        description="비디오 트랜스크립트에 적용되는 유사성 검색 쿼리.",
    )
    publish_year: Optional[int] = Field(None, description="비디오가 게시된 연도")
```

### 쿼리 생성

사용자 질문을 구조화된 쿼리로 변환하기 위해 OpenAI의 도구 호출 API를 사용할 것입니다. 특히 새 [ChatModel.with_structured_output()](/docs/modules/model_io/chat/structured_output) 생성자를 사용하여 스키마를 모델에 전달하고 출력을 구문 분석할 것입니다.

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

앞서 검색한 질문에 대해 분석기가 생성한 쿼리를 확인해보겠습니다:

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

## 쿼리 분석을 통한 검색

쿼리 분석이 잘 작동하는 것 같습니다. 이제 생성된 쿼리를 사용하여 실제로 검색을 수행해보겠습니다.

**참고:** 이 예제에서는 `tool_choice="Search"`를 지정했습니다. 이는 LLM이 하나의 도구만 호출하도록 강제하며, 항상 하나의 최적화된 쿼리를 조회하도록 합니다. 이는 항상 그런 것은 아니며, 쿼리가 없거나 여러 개의 최적화된 쿼리가 반환될 때의 상황을 처리하는 방법에 대한 가이드를 참고하십시오.

```python
from typing import List

from langchain_core.documents import Document
```

```python
def retrieval(search: Search) -> List[Document]:
    if search.publish_year is not None:
        # 사용 중인 벡터 데이터베이스에 특화된 문법입니다.
        _filter = {"publish_year": {"$eq": search.publish_year}}
    else:
        _filter = None
    return vectorstore.similarity_search(search.query, filter=_filter)
```

```python
retrieval_chain = query_analyzer | retrieval
```

이제 앞서 문제를 일으켰던 입력에 대해 이 체인을 실행해보고 해당 연도의 결과만 반환되는지 확인해보겠습니다:

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