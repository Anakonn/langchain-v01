---
sidebar_position: 3
translated: true
---

# संरचना

पुनर्प्राप्ति में सबसे महत्वपूर्ण कदमों में से एक है एक पाठ इनपुट को सही खोज और फ़िल्टर पैरामीटर में बदलना। इस अव्यवस्थित इनपुट से संरचित पैरामीटर को निकालने की प्रक्रिया को हम **क्वेरी संरचना** कहते हैं।

उदाहरण के लिए, आइए [त्वरित शुरुआत](/docs/use_cases/query_analysis/quickstart) में से LangChain YouTube वीडियो पर Q&A बॉट के उदाहरण पर वापस जाएं और देखें कि और अधिक जटिल संरचित क्वेरी कैसे दिखती हैं।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain langchain-openai youtube-transcript-api pytube
```

#### पर्यावरण चर सेट करें

हम इस उदाहरण में OpenAI का उपयोग करेंगे:

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### उदाहरण दस्तावेज़ लोड करें

आइए एक प्रतिनिधि दस्तावेज़ लोड करें

```python
from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=pbAd8O1Lvm4", add_video_info=True
).load()
```

यहाँ एक वीडियो से जुड़ा मेटाडेटा है:

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

और यहाँ एक दस्तावेज़ के सामग्री का एक नमूना है:

```python
docs[0].page_content[:500]
```

```output
"hi this is Lance from Lang chain I'm going to be talking about using Lang graph to build a diverse and sophisticated rag flows so just to set the stage the basic rag flow you can see here starts with a question retrieval of relevant documents from an index which are passed into the context window of an llm for generation of an answer grounded in the ret documents so that's kind of the basic outline and we can see it's like a very linear path um in practice though you often encounter a few differ"
```

## क्वेरी स्कीमा

संरचित क्वेरी उत्पन्न करने के लिए, हमें पहले अपनी क्वेरी स्कीमा को परिभाषित करना होगा। हम देख सकते हैं कि प्रत्येक दस्तावेज़ में एक शीर्षक, दृश्य गणना, प्रकाशन तिथि और सेकंड में लंबाई होती है। मान लें कि हमने एक ऐसा सूचकांक बनाया है जो प्रत्येक दस्तावेज़ के सामग्री और शीर्षक पर अव्यवस्थित खोज करने की अनुमति देता है, और दृश्य गणना, प्रकाशन तिथि और लंबाई पर रेंज फ़िल्टरिंग का उपयोग करता है।

शुरू करने के लिए, हम दृश्य गणना, प्रकाशन तिथि और वीडियो लंबाई के लिए स्पष्ट न्यूनतम और अधिकतम गुण के साथ एक स्कीमा बनाएंगे ताकि उन पर फ़िल्टर किया जा सके। और हम प्रतिलिपि सामग्री और वीडियो शीर्षक के खिलाफ खोज के लिए अलग-अलग गुण जोड़ेंगे।

वैकल्पिक रूप से, हम एक और सामान्य स्कीमा बना सकते हैं जहां बजाय प्रत्येक फ़िल्टरयोग्य फ़ील्ड के लिए एक या अधिक फ़िल्टर गुण होने के, हमारे पास एक एकल `filters` गुण होता है जो (गुण, स्थिति, मान) ट्यूपल की सूची लेता है। हम इस तरह करने का भी प्रदर्शन करेंगे। किस दृष्टिकोण का उपयोग करना सबसे अच्छा है, यह आपके सूचकांक की जटिलता पर निर्भर करता है। यदि आपके पास कई फ़िल्टरयोग्य फ़ील्ड हैं तो एकल `filters` क्वेरी गुण होना बेहतर हो सकता है। यदि आपके पास केवल कुछ फ़िल्टरयोग्य फ़ील्ड हैं और/या ऐसी फ़ील्ड हैं जिन्हें केवल बहुत विशिष्ट तरीकों से फ़िल्टर किया जा सकता है, तो प्रत्येक के लिए अलग-अलग क्वेरी गुण होना उपयोगी हो सकता है, प्रत्येक का अपना विवरण।

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

## क्वेरी उत्पादन

उपयोगकर्ता के प्रश्नों को संरचित क्वेरी में बदलने के लिए, हम एक फ़ंक्शन-कॉलिंग मॉडल का उपयोग करेंगे, जैसे ChatOpenAI। LangChain में कुछ अच्छे निर्माता हैं जो एक Pydantic वर्ग के माध्यम से इच्छित फ़ंक्शन कॉल स्कीमा को निर्दिष्ट करना आसान बनाते हैं:

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

आइए इसे आज़माते हैं:

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

## वैकल्पिक: संक्षिप्त स्कीमा

यदि हमारे पास कई फ़िल्टरयोग्य फ़ील्ड हैं तो एक विस्तृत स्कीमा होने से प्रदर्शन प्रभावित हो सकता है, या यहां तक कि फ़ंक्शन स्कीमा की सीमाओं के कारण संभव भी नहीं हो सकता है। इन मामलों में हम अधिक संक्षिप्त क्वेरी स्कीमाओं का प्रयास कर सकते हैं जो दिशा की कुछ स्पष्टता को संक्षिप्तता के लिए बदल देते हैं:

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

आइए इसे आज़माते हैं:

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

हम देख सकते हैं कि विश्लेषक पूर्णांक के साथ अच्छा काम करता है लेकिन तिथि रेंज के साथ संघर्ष करता है। हम अपने स्कीमा विवरण और/या हमारे प्रोम्प्ट को समायोजित करने का प्रयास कर सकते हैं ताकि इसे ठीक किया जा सके:

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

यह काम करता प्रतीत होता है!

## क्रमबद्धता: खोज से परे जाना

कुछ सूचकांकों के साथ, फ़ील्ड द्वारा खोजना एकमात्र तरीका नहीं है - हम दस्तावेजों को एक फ़ील्ड द्वारा क्रमबद्ध भी कर सकते हैं और शीर्ष क्रमबद्ध परिणाम प्राप्त कर सकते हैं। संरचित क्वेरीकरण के साथ, इसे समायोजित करना आसान है क्योंकि हम परिणामों को क्रमबद्ध करने के लिए क्वेरी फ़ील्ड को अलग से जोड़ते हैं।

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

हम खोज और क्रमबद्धता दोनों का समर्थन कर सकते हैं। यह कुछ इस तरह दिख सकता है कि पहले हम प्रासंगिकता के एक थ्रेशोल्ड से ऊपर के सभी परिणाम प्राप्त करते हैं और फिर उन्हें निर्दिष्ट गुण के अनुसार क्रमबद्ध करते हैं:

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
