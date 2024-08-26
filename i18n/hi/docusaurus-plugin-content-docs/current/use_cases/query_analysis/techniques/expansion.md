---
sidebar_position: 2
translated: true
---

# विस्तार

सूचना पुनर्प्राप्ति प्रणालियां वाक्यांश और विशिष्ट कीवर्ड्स के प्रति संवेदनशील हो सकती हैं। इस को कम करने के लिए, एक क्लासिक पुनर्प्राप्ति तकनीक है कि एक क्वेरी के कई पैरा-फ्रेज किए गए संस्करण उत्पन्न करें और सभी क्वेरी संस्करणों के लिए परिणाम वापस करें। इसे **क्वेरी विस्तार** कहा जाता है। LLM क्वेरी के इन वैकल्पिक संस्करण उत्पन्न करने के लिए एक महान उपकरण हैं।

आइए देखें कि हम LangChain YouTube वीडियो पर हमारे प्रश्न और उत्तर बॉट के लिए क्वेरी विस्तार कैसे कर सकते हैं, जिसे हमने [त्वरित शुरुआत](/docs/use_cases/query_analysis/quickstart) में शुरू किया था।

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

## क्वेरी जनरेशन

कई पैरा-फ्रेज प्राप्त करने सुनिश्चित करने के लिए, हम OpenAI के फ़ंक्शन-कॉलिंग API का उपयोग करेंगे।

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class ParaphrasedQuery(BaseModel):
    """You have performed query expansion to generate a paraphrasing of a question."""

    paraphrased_query: str = Field(
        ...,
        description="A unique paraphrasing of the original question.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query expansion. If there are multiple common ways of phrasing a user question \
or common synonyms for key words in the question, make sure to return multiple versions \
of the query with the different phrasings.

If there are acronyms or words you are not familiar with, do not try to rephrase them.

Return at least 3 versions of the question."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([ParaphrasedQuery])
query_analyzer = prompt | llm_with_tools | PydanticToolsParser(tools=[ParaphrasedQuery])
```

आइए देखें कि हमने पहले खोजे गए प्रश्नों के लिए हमारा विश्लेषक क्या क्वेरी उत्पन्न करता है:

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[ParaphrasedQuery(paraphrased_query='How to utilize multi-modal models sequentially and convert the sequence into a REST API'),
 ParaphrasedQuery(paraphrased_query='Steps for using multi-modal models in a series and transforming the series into a RESTful API'),
 ParaphrasedQuery(paraphrased_query='Guide on employing multi-modal models in a chain and converting the chain into a RESTful API')]
```

```python
query_analyzer.invoke({"question": "stream events from llm agent"})
```

```output
[ParaphrasedQuery(paraphrased_query='How to stream events from LLM agent?'),
 ParaphrasedQuery(paraphrased_query='How can I receive events from LLM agent in real-time?'),
 ParaphrasedQuery(paraphrased_query='What is the process for capturing events from LLM agent?')]
```
