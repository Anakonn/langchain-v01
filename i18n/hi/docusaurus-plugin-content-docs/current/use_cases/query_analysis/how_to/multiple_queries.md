---
sidebar_position: 4
translated: true
---

# कई क्वेरी को संभालना

कभी-कभी, क्वेरी विश्लेषण तकनीक कई क्वेरी उत्पन्न करने की अनुमति दे सकती है। इन मामलों में, हमें याद रखना होगा कि सभी क्वेरी को चलाएं और फिर परिणामों को संयुक्त करें। हम एक सरल उदाहरण (मॉक डेटा का उपयोग करके) दिखाएंगे कि यह कैसे किया जाता है।

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

texts = ["Harrison worked at Kensho", "Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## क्वेरी विश्लेषण

हम आउटपुट को संरचित करने के लिए फ़ंक्शन कॉलिंग का उपयोग करेंगे। हम इसे कई क्वेरी लौटाने की अनुमति देंगे।

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    queries: List[str] = Field(
        ...,
        description="Distinct queries to search for",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information.

If you need to look up two distinct pieces of information, you are allowed to do that!"""
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
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

हम देख सकते हैं कि यह कई क्वेरी बनाने की अनुमति देता है।

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(queries=['Harrison work location'])
```

```python
query_analyzer.invoke("where did Harrison and ankush Work")
```

```output
Search(queries=['Harrison work place', 'Ankush work place'])
```

## क्वेरी विश्लेषण के साथ पुनर्प्राप्ति

तो हम इसे एक श्रृंखला में कैसे शामिल करेंगे? एक चीज जो इसे काफी आसान बना देगी, यह है कि हम अपने पुनर्प्राप्तकर्ता को असिंक्रोनस रूप से कॉल करें - यह हमें क्वेरी पर लूप करने और प्रतिक्रिया समय पर अवरुद्ध नहीं होने देगा।

```python
from langchain_core.runnables import chain
```

```python
@chain
async def custom_chain(question):
    response = await query_analyzer.ainvoke(question)
    docs = []
    for query in response.queries:
        new_docs = await retriever.ainvoke(query)
        docs.extend(new_docs)
    # You probably want to think about reranking or deduplicating documents here
    # But that is a separate topic
    return docs
```

```python
await custom_chain.ainvoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
await custom_chain.ainvoke("where did Harrison and ankush Work")
```

```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Ankush worked at Facebook')]
```
