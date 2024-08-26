---
sidebar_position: 2
translated: true
---

# प्रॉम्प्ट में उदाहरण जोड़ें

जैसे-जैसे हमारा क्वेरी विश्लेषण अधिक जटिल होता जा रहा है, एलएलएम को कुछ परिदृश्यों में सही तरह से प्रतिक्रिया देने में संघर्ष कर सकता है। यहां प्रदर्शन में सुधार करने के लिए, हम प्रॉम्प्ट में उदाहरण जोड़ सकते हैं।

आइए देखें कि हम [त्वरित शुरुआत](/docs/use_cases/query_analysis/quickstart) में बनाए गए LangChain YouTube वीडियो क्वेरी विश्लेषक में उदाहरण कैसे जोड़ सकते हैं।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain-core langchain-openai
```

#### पर्यावरण चर सेट करें

इस उदाहरण में हम OpenAI का उपयोग करेंगे:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## क्वेरी स्कीमा

हम एक क्वेरी स्कीमा परिभाषित करेंगे जिसे हमारे मॉडल को आउटपुट करना चाहिए। अपने क्वेरी विश्लेषण को थोड़ा अधिक रोचक बनाने के लिए, हम एक `sub_queries` फ़ील्ड जोड़ेंगे जो मुख्य प्रश्न से व्युत्पन्न अधिक संकीर्ण प्रश्नों को शामिल करता है।

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field

sub_queries_description = """\
If the original question contains multiple distinct sub-questions, \
or if there are more generic questions that would be helpful to answer in \
order to answer the original question, write a list of all relevant sub-questions. \
Make sure this list is comprehensive and covers all parts of the original question. \
It's ok if there's redundancy in the sub-questions. \
Make sure the sub-questions are as narrowly focused as possible."""


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Primary similarity search query applied to video transcripts.",
    )
    sub_queries: List[str] = Field(
        default_factory=list, description=sub_queries_description
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

## क्वेरी जनरेशन

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

आइए प्रॉम्प्ट में किसी भी उदाहरण के बिना हमारे क्वेरी विश्लेषक को आज़माएं:

```python
query_analyzer.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='web voyager vs reflection agents', sub_queries=['difference between web voyager and reflection agents', 'do web voyager and reflection agents use langgraph'], publish_year=None)
```

## उदाहरण जोड़ना और प्रॉम्प्ट को ट्यून करना

यह काफी अच्छा काम करता है, लेकिन हम शायद इसे वेब वॉयेजर और रिफ्लेक्शन एजेंट के बारे में प्रश्नों को अलग करने के लिए और अधिक विघटित करना चाहते हैं।

हमारे क्वेरी जनरेशन परिणामों को ट्यून करने के लिए, हम प्रॉम्प्ट में इनपुट प्रश्नों और गोल्ड स्टैंडर्ड आउटपुट क्वेरीज़ के कुछ उदाहरण जोड़ सकते हैं।

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
query = Search(
    query="What is chat langchain and is it a langchain template?",
    sub_queries=["What is chat langchain", "What is a langchain template"],
)
examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
query = Search(
    query="How to build multi-agent system and stream intermediate steps from it",
    sub_queries=[
        "How to build multi-agent system",
        "How to stream intermediate steps from multi-agent system",
        "How to stream intermediate steps",
    ],
)

examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "LangChain agents vs LangGraph?"
query = Search(
    query="What's the difference between LangChain agents and LangGraph? How do you deploy them?",
    sub_queries=[
        "What are LangChain agents",
        "What is LangGraph",
        "How do you deploy LangChain agents",
        "How do you deploy LangGraph",
    ],
)
examples.append({"input": question, "tool_calls": [query]})
```

अब हमें अपने प्रॉम्प्ट टेम्प्लेट और श्रृंखला को इस तरह से अपडेट करना होगा कि उदाहरण प्रत्येक प्रॉम्प्ट में शामिल हों। चूंकि हम OpenAI फ़ंक्शन-कॉलिंग के साथ काम कर रहे हैं, इसलिए हमें इसे भेजने के लिए कुछ अतिरिक्त संरचना करनी होगी। हम `tool_example_to_messages` हेल्पर फ़ंक्शन बनाएंगे जो इस काम को हमारे लिए संभालेगा:

```python
import uuid
from typing import Dict

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
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

query_analyzer_with_examples = (
    {"question": RunnablePassthrough()}
    | prompt.partial(examples=example_msgs)
    | structured_llm
)
```

```python
query_analyzer_with_examples.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='Difference between web voyager and reflection agents, do they both use LangGraph?', sub_queries=['What is Web Voyager', 'What are Reflection agents', 'Do Web Voyager and Reflection agents use LangGraph'], publish_year=None)
```

हमारे उदाहरणों के कारण हमें थोड़ा अधिक विघटित खोज क्वेरी मिलती है। अधिक प्रॉम्प्ट इंजीनियरिंग और हमारे उदाहरणों को ट्यून करके हम क्वेरी जनरेशन को और भी बेहतर बना सकते हैं।

आप देख सकते हैं कि उदाहरण [LangSmith ट्रेस](https://smith.langchain.com/public/aeaaafce-d2b1-4943-9a61-bc954e8fc6f2/r) में संदेशों के रूप में मॉडल को भेजे जाते हैं।
