---
sidebar_position: 3
translated: true
---

# कोई क्वेरी उत्पन्न नहीं होने वाले मामलों से निपटना

कभी-कभी, क्वेरी विश्लेषण तकनीक किसी भी संख्या में क्वेरी उत्पन्न करने की अनुमति दे सकती है - कोई क्वेरी नहीं भी! इस मामले में, हमारी समग्र श्रृंखला को क्वेरी विश्लेषण के परिणाम की जांच करनी होगी, इससे पहले कि वह रिट्रीवर को कॉल करने का फैसला करे।

हम इस उदाहरण के लिए मॉक डेटा का उपयोग करेंगे।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma
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

### इंडेक्स बनाएं

हम नकली जानकारी पर एक वेक्टर स्टोर बनाएंगे।

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## क्वेरी विश्लेषण

हम फ़ंक्शन कॉलिंग का उपयोग करके आउटपुट को संरचित करेंगे। हालांकि, हम LLM को इस तरह कॉन्फ़िगर करेंगे कि उसे खोज क्वेरी को प्रतिनिधित्व करने वाले फ़ंक्शन को कॉल करने की आवश्यकता नहीं होगी (यदि यह निर्णय नहीं लेता है)। हम फिर एक प्रॉम्प्ट का उपयोग करेंगे जो स्पष्ट रूप से बताता है कि क्वेरी विश्लेषण कब खोज करना चाहिए और कब नहीं।

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    query: str = Field(
        ...,
        description="Similarity search query applied to job record.",
    )
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You have the ability to issue search queries to get information to help answer user information.

You do not NEED to look things up. If you don't need to, then just respond normally."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

हम देख सकते हैं कि इसे आमंत्रित करके हमें कभी-कभी, लेकिन हमेशा नहीं, एक टूल कॉल मिलता है।

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_ZnoVX4j9Mn8wgChaORyd1cvq', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}]})
```

```python
query_analyzer.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## क्वेरी विश्लेषण के साथ पुनर्प्राप्ति

तो हम इसे एक श्रृंखला में कैसे शामिल करेंगे? नीचे एक उदाहरण देखें।

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # Could add more logic - like another LLM call - here
        return docs
    else:
        return response
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```
