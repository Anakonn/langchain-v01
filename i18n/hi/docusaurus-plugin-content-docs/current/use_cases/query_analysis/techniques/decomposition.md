---
sidebar_position: 1
translated: true
---

# विघटन

जब कोई उपयोगकर्ता कोई प्रश्न पूछता है, तो एक ही क्वेरी से प्रासंगिक परिणाम प्राप्त होने की गारंटी नहीं होती है। कभी-कभी किसी प्रश्न का उत्तर देने के लिए, उसे अलग-अलग उप-प्रश्नों में विभाजित करना पड़ता है, प्रत्येक उप-प्रश्न के लिए परिणाम प्राप्त करना पड़ता है, और फिर संचित संदर्भ का उपयोग करके उत्तर देना पड़ता है।

उदाहरण के लिए, यदि कोई उपयोगकर्ता पूछता है: "वेब वॉयेजर रिफ्लेक्शन एजेंटों से कैसे अलग है", और हमारे पास एक दस्तावेज है जो वेब वॉयेजर की व्याख्या करता है और एक जो रिफ्लेक्शन एजेंटों की व्याख्या करता है, लेकिन दोनों का तुलनात्मक विश्लेषण करने वाला कोई दस्तावेज नहीं है, तो "वेब वॉयेजर क्या है" और "रिफ्लेक्शन एजेंट क्या हैं" के लिए परिणाम प्राप्त करके और उन्हें संयुक्त करके बेहतर परिणाम मिल सकते हैं, जैसे कि उपयोगकर्ता के प्रश्न के आधार पर सीधे परिणाम प्राप्त करने से।

इनपुट को कई अलग-अलग उप-क्वेरियों में विभाजित करने की प्रक्रिया को **क्वेरी विघटन** कहा जाता है। इसे कभी-कभी उप-क्वेरी जनन भी कहा जाता है। इस गाइड में, हम [त्वरित शुरुआत](/docs/use_cases/query_analysis/quickstart) में से LangChain YouTube वीडियो पर Q&A बॉट का उदाहरण लेकर विघटन करने का तरीका दिखाएंगे।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain langchain-openai
```

#### पर्यावरण चर सेट करें

हम इस उदाहरण में OpenAI का उपयोग करेंगे:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## क्वेरी जनन

उपयोगकर्ता के प्रश्नों को उप-प्रश्नों की सूची में परिवर्तित करने के लिए, हम OpenAI के फ़ंक्शन-कॉलिंग API का उपयोग करेंगे, जो प्रत्येक बार कई फ़ंक्शन लौटा सकता है:

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class SubQuery(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    sub_query: str = Field(
        ...,
        description="A very specific query against the database.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into distinct sub questions that \
you need to answer in order to answer the original question.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([SubQuery])
parser = PydanticToolsParser(tools=[SubQuery])
query_analyzer = prompt | llm_with_tools | parser
```

चलो इसे आज़माते हैं:

```python
query_analyzer.invoke({"question": "how to do rag"})
```

```output
[SubQuery(sub_query='How to do rag')]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[SubQuery(sub_query='How to use multi-modal models in a chain?'),
 SubQuery(sub_query='How to turn a chain into a REST API?')]
```

```python
query_analyzer.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query='What is Web Voyager and how does it differ from Reflection Agents?'),
 SubQuery(sub_query='Do Web Voyager and Reflection Agents use Langgraph?')]
```

## उदाहरण जोड़ना और प्रोम्प्ट को ट्यून करना

यह काफी अच्छा काम करता है, लेकिन हम शायद इस अंतिम प्रश्न को वेब वॉयेजर और रिफ्लेक्शन एजेंटों के बारे में अलग-अलग क्वेरियों में और अधिक विघटित करना चाहते हैं। यदि हम पहले से ही नहीं जानते कि हमारे सूचकांक के साथ कौन से प्रकार के प्रश्न सबसे अच्छे काम करेंगे, तो हम अपनी क्वेरियों में कुछ अतिरिक्त संरेखण भी शामिल कर सकते हैं, ताकि हम उप-क्वेरियों और उच्च स्तरीय क्वेरियों दोनों को वापस प्राप्त कर सकें।

हमारे क्वेरी जनन परिणामों को ट्यून करने के लिए, हम इनपुट प्रश्नों और गोल्ड स्टैंडर्ड आउटपुट क्वेरियों के कुछ उदाहरण अपने प्रोम्प्ट में जोड़ सकते हैं। हम अपने सिस्टम संदेश को भी बेहतर बना सकते हैं।

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
queries = [
    SubQuery(sub_query="What is chat langchain"),
    SubQuery(sub_query="What is a langchain template"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How would I use LangGraph to build an automaton"
queries = [
    SubQuery(sub_query="How to build automaton with LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
queries = [
    SubQuery(sub_query="How to build multi-agent system"),
    SubQuery(sub_query="How to stream intermediate steps"),
    SubQuery(sub_query="How to stream intermediate steps from multi-agent system"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "What's the difference between LangChain agents and LangGraph?"
queries = [
    SubQuery(sub_query="What's the difference between LangChain agents and LangGraph?"),
    SubQuery(sub_query="What are LangChain agents"),
    SubQuery(sub_query="What is LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

अब हमें अपने प्रोम्प्ट टेम्प्लेट और श्रृंखला को इस तरह अपडेट करना होगा कि उदाहरण इन प्रत्येक प्रोम्प्ट में शामिल हों। चूंकि हम OpenAI फ़ंक्शन-कॉलिंग के साथ काम कर रहे हैं, इसलिए हमें इसे भेजने के लिए कुछ अतिरिक्त संरचना करनी होगी। हम `tool_example_to_messages` हेल्पर फ़ंक्शन बनाएंगे जो इसे हमारे लिए संभाल लेगा:

```python
import uuid
from typing import Dict, List

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
        "This is an example of a correct usage of this tool. Make sure to continue using the tool this way."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into the most specific sub questions you can \
which will help you answer the original question. Each sub question should be about a single concept/fact/idea.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
query_analyzer_with_examples = (
    prompt.partial(examples=example_msgs) | llm_with_tools | parser
)
```

```python
query_analyzer_with_examples.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query="What's the difference between web voyager and reflection agents"),
 SubQuery(sub_query='Do web voyager and reflection agents use LangGraph'),
 SubQuery(sub_query='What is web voyager'),
 SubQuery(sub_query='What are reflection agents')]
```
