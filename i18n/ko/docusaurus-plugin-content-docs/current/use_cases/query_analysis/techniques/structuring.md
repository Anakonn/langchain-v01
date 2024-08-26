---
sidebar_position: 3
translated: true
---

# 구조화

검색에서 가장 중요한 단계 중 하나는 텍스트 입력을 올바른 검색 및 필터 매개변수로 변환하는 것입니다. 이 비구조적 입력에서 구조적 매개변수를 추출하는 과정을 **쿼리 구조화**라고 합니다.

이를 설명하기 위해 [빠른 시작](/docs/use_cases/query_analysis/quickstart)에서 사용한 LangChain YouTube 비디오에 대한 Q&A 봇 예시로 돌아가서 더 복잡한 구조적 쿼리가 이 경우 어떻게 보일지 살펴보겠습니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-openai youtube-transcript-api pytube

```

#### 환경 변수 설정

이 예제에서는 OpenAI를 사용하겠습니다:

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 선택 사항, LangSmith로 실행을 추적하려면 주석을 해제하십시오. 여기에 가입하십시오: https://smith.langchain.com.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

### 예제 문서 로드

대표 문서를 로드하겠습니다.

```python
from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=pbAd8O1Lvm4", add_video_info=True
).load()
```

비디오와 관련된 메타데이터는 다음과 같습니다:

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

문서 내용 샘플은 다음과 같습니다:

```python
docs[0].page_content[:500]
```

```output
"hi this is Lance from Lang chain I'm going to be talking about using Lang graph to build a diverse and sophisticated rag flows so just to set the stage the basic rag flow you can see here starts with a question retrieval of relevant documents from an index which are passed into the context window of an llm for generation of an answer grounded in the ret documents so that's kind of the basic outline and we can see it's like a very linear path um in practice though you often encounter a few differ"
```

## 쿼리 스키마

구조적 쿼리를 생성하려면 먼저 쿼리 스키마를 정의해야 합니다. 각 문서에는 제목, 조회수, 게시 날짜, 길이(초) 등의 메타데이터가 있습니다. 우리는 각 문서의 내용과 제목에 대해 비구조적 검색을 수행하고 조회수, 게시 날짜 및 길이에 대한 범위 필터링을 사용할 수 있는 인덱스를 구축했다고 가정하겠습니다.

우선, 조회수, 게시 날짜 및 비디오 길이에 대한 최소 및 최대 속성을 명시적으로 포함하는 스키마를 만들고, 이러한 속성들을 필터링할 수 있도록 하겠습니다. 그리고 비디오 제목과 트랜스크립트 내용에 대한 별도의 검색 속성을 추가하겠습니다.

우리는 또한 각 필터 가능 필드에 하나 이상의 필터 속성을 갖는 대신 (속성, 조건, 값) 튜플 목록을 받는 단일 `filters` 속성을 갖는 더 일반적인 스키마를 만들 수 있습니다. 이 방법도 시연할 것입니다. 어떤 접근 방식이 가장 적합한지는 인덱스의 복잡성에 따라 다릅니다. 필터링할 수 있는 필드가 많으면 단일 `filters` 쿼리 속성을 사용하는 것이 더 나을 수 있습니다. 필터링할 수 있는 필드가 적거나 특정 방식으로만 필터링할 수 있는 필드가 있는 경우에는 각 필드에 대해 별도의 쿼리 속성을 갖는 것이 유용할 수 있습니다.

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class TutorialSearch(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스 검색."""

    content_search: str = Field(
        ...,
        description="비디오 트랜스크립트에 적용된 유사성 검색 쿼리.",
    )
    title_search: str = Field(
        ...,
        description=(
            "비디오 제목에 적용할 콘텐츠 검색 쿼리의 대체 버전입니다. "
            "비디오 제목에 있을 수 있는 키워드만 포함하여 간결하게 작성하십시오."
        ),
    )
    min_view_count: Optional[int] = Field(
        None,
        description="최소 조회수 필터, 포함. 명시적으로 지정된 경우에만 사용하십시오.",
    )
    max_view_count: Optional[int] = Field(
        None,
        description="최대 조회수 필터, 제외. 명시적으로 지정된 경우에만 사용하십시오.",
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None,
        description="최초 게시 날짜 필터, 포함. 명시적으로 지정된 경우에만 사용하십시오.",
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None,
        description="최신 게시 날짜 필터, 제외. 명시적으로 지정된 경우에만 사용하십시오.",
    )
    min_length_sec: Optional[int] = Field(
        None,
        description="비디오 길이의 최소 초, 포함. 명시적으로 지정된 경우에만 사용하십시오.",
    )
    max_length_sec: Optional[int] = Field(
        None,
        description="비디오 길이의 최대 초, 제외. 명시적으로 지정된 경우에만 사용하십시오.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

## 쿼리 생성

사용자 질문을 구조적 쿼리로 변환하려면 ChatOpenAI와 같은 함수 호출 모델을 사용합니다. LangChain에는 Pydantic 클래스를 통해 원하는 함수 호출 스키마를 쉽게 지정할 수 있는 좋은 생성자가 있습니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """사용자 질문을 데이터베이스 쿼리로 변환하는 전문가입니다. \
당신은 LLM 기반 애플리케이션을 구축하기 위한 소프트웨어 라이브러리 튜토리얼 비디오 데이터베이스에 접근할 수 있습니다. \
질문을 받으면 가장 관련성 높은 결과를 검색할 수 있는 데이터베이스 쿼리를 반환하십시오.

약어나 모르는 단어가 있는 경우, 이를 다시 표현하려고 하지 마십시오."""
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

시험해보겠습니다:

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

## 대안: 간결한 스키마

필터링할 수 있는 필드가 많으면 상세한 스키마가 성능에 영향을 줄 수 있으며, 함수 스키마 크기 제한으로 인해 불가능할 수도 있습니다. 이러한 경우 명시성의 일부를 포기하고 간결함을 위해 더 간결한 쿼리 스키마를 사용할 수 있습니다.

```python
from typing import List, Literal, Union


class Filter(BaseModel):
    field: Literal["view_count", "publish_date", "length_sec"]
    comparison: Literal["eq", "lt", "lte", "gt", "gte"]
    value: Union[int, datetime.date] = Field(
        ...,
        description="field가 publish_date인 경우 값은 ISO-8601 형식 날짜여야 합니다.",
    )


class TutorialSearch(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스 검색."""

    content_search: str = Field(
        ...,
        description="비디오 트랜스크립트에 적용된 유사성 검색 쿼리.",
    )
    title_search: str = Field(
        ...,
        description=(
            "비디오 제목에 적용할 콘텐츠 검색 쿼리의 대체 버전입니다. "
            "비디오 제목에 있을 수 있는 키워드만 포함하여 간결하게 작성하십시오."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description="특정 필드에 대한 필터. 최종 조건은 모든 필터의 논리적 결합입니다.",
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

시험해보겠습니다:

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

쿼리 분석기는 정수 필터를 잘 처리하지만 날짜 범위 필터링에는 어려움을 겪고 있음을 알 수 있습니다. 스키마 설명 및/또는 프롬프트를 조정하여 이를 개선할 수 있습니다:

```python
class TutorialSearch(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스 검색."""

    content_search: str = Field(
        ...,
        description="비디오 트랜스크립트에 적용된 유사성 검색 쿼리.",
    )
    title_search: str = Field(
        ...,
        description=(
            "비디오 제목에 적용할 콘텐츠 검색 쿼리의 대체 버전입니다. "
            "비디오 제목에 있을 수 있는 키워드만 포함하여 간결하게 작성하십시오."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description=(
            "특정 필드에 대한 필터. 최종 조건은 모든 필터의 논리적 결합입니다. "
            "하루보다 긴 기간을 지정한 경우 날짜 범위를 정의하는 필터가 있어야 합니다. "
            f"현재 날짜는 {datetime.date.today().strftime('%m-%d-%Y')}입니다."
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

이 방법은 잘 작동하는 것 같습니다!

## 정렬: 검색을 넘어

특정 인덱스에서는 필드를 기준으로 검색하는 것 외에도 필드를 기준으로 문서를 정렬하고 상위 정렬 결과를 검색할 수 있습니다. 구조적 쿼리를 통해 결과를 어떻게 정렬할지를 지정하는 별도의 쿼리 필드를 추가하여 이를 쉽게 수용할 수 있습니다.

```python
class TutorialSearch(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스 검색."""

    content_search: str = Field(
        "",
        description="비디오 트랜스크립트에 적용된 유사성 검색 쿼리.",
    )
    title_search: str = Field(
        "",
        description=(
            "비디오 제목에 적용할 콘텐츠 검색 쿼리의 대체 버전입니다. "
            "비디오 제목에 있을 수 있는 키워드만 포함하여 간결하게 작성하십시오."
        ),
    )
    min_view_count: Optional[int] = Field(
        None, description="최소 조회수 필터, 포함."
    )
    max_view_count: Optional[int] = Field(
        None, description="최대 조회수 필터, 제외."
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None, description="최초 게시 날짜 필터, 포함."
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None, description="최신 게시 날짜 필터, 제외."
    )
    min_length_sec: Optional[int] = Field(
        None, description="비디오 길이의 최소 초, 포함."
    )
    max_length_sec: Optional[int] = Field(
        None, description="비디오 길이의 최대 초, 제외."
    )
    sort_by: Literal[
        "relevance",
        "view_count",
        "publish_date",
        "length",
    ] = Field("relevance", description="정렬할 속성.")
    sort_order: Literal["ascending", "descending"] = Field(
        "descending", description="오름차순 또는 내림차순으로 정렬할지 여부."
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

우리는 검색과 정렬을 함께 지원할 수도 있습니다. 이는 특정 속성을 기준으로 정렬된 상위 결과를 검색한 다음 결과를 정렬하는 것처럼 보일 수 있습니다.

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