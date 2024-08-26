---
sidebar_position: 0
translated: true
---

# त्वरित शुरुआत

यह पृष्ठ एक मूलभूत अंत से अंत उदाहरण में क्वेरी विश्लेषण का उपयोग करने का तरीका दिखाएगा। यह एक सरल खोज इंजन बनाने, उस खोज इंजन में कच्चे उपयोगकर्ता प्रश्न को पास करने पर होने वाली विफलता को दिखाने और फिर क्वेरी विश्लेषण का उदाहरण दिखाने को कवर करेगा। क्वेरी विश्लेषण की कई अलग-अलग तकनीकें हैं और यह अंत से अंत उदाहरण उन सभी को नहीं दिखाएगा।

इस उदाहरण के उद्देश्य के लिए, हम LangChain YouTube वीडियो पर पुनर्प्राप्ति करेंगे।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
# %pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma
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

### दस्तावेज़ लोड करें

हम `YouTubeLoader` का उपयोग कर कुछ LangChain वीडियो के प्रसारण लोड कर सकते हैं:

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

हमने लोड किए गए वीडियो के शीर्षक यहां हैं:

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

प्रत्येक वीडियो से जुड़ा मेटाडेटा यहां है। हम देख सकते हैं कि प्रत्येक दस्तावेज़ में एक शीर्षक, दृश्य काउंट, प्रकाशन तिथि और लंबाई भी है:

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

और एक दस्तावेज़ के सामग्री का एक नमूना यहां है:

```python
docs[0].page_content[:500]
```

```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```

### दस्तावेजों का अनुक्रमण

जब भी हम पुनर्प्राप्ति करते हैं, हमें दस्तावेजों का एक सूचकांक बनाने की आवश्यकता होती है जिसे हम क्वेरी कर सकते हैं। हम अपने दस्तावेजों को अनुक्रमित करने के लिए एक वेक्टर स्टोर का उपयोग करेंगे, और हम उन्हें पहले टुकड़ों में बांटेंगे ताकि हमारी पुनर्प्राप्ति अधिक संक्षिप्त और सटीक हो:

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

## क्वेरी विश्लेषण के बिना पुनर्प्राप्ति

हम एक उपयोगकर्ता प्रश्न को सीधे समानता खोज पर करके प्रासंगिक टुकड़ों को खोज सकते हैं:

```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```

```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```

यह काफी अच्छा काम करता है! हमारा पहला परिणाम प्रश्न के लिए काफी प्रासंगिक है।

क्या अगर हम एक विशिष्ट समय अवधि से परिणाम खोजना चाहते हैं?

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

हमारा पहला परिणाम 2024 से है (हमने 2023 के वीडियो के लिए पूछा था), और इनपुट के लिए बहुत प्रासंगिक नहीं है। क्योंकि हम केवल दस्तावेज़ सामग्री के खिलाफ खोज कर रहे हैं, इसलिए किसी भी दस्तावेज़ विशेषताओं पर फ़िल्टर किए जाने का कोई तरीका नहीं है।

यह केवल एक विफलता मोड है जो उत्पन्न हो सकता है। अब आइए देखें कि एक मूलभूत क्वेरी विश्लेषण इसे कैसे ठीक कर सकता है!

## क्वेरी विश्लेषण

हम क्वेरी विश्लेषण का उपयोग करके पुनर्प्राप्ति के परिणामों को बेहतर बना सकते हैं। इसमें **क्वेरी स्कीमा** को परिभाषित करना शामिल होगा जिसमें कुछ तिथि फ़िल्टर होंगे और एक उपयोगकर्ता प्रश्न को संरचित क्वेरी में रूपांतरित करने के लिए एक फ़ंक्शन-कॉलिंग मॉडल का उपयोग किया जाएगा।

### क्वेरी स्कीमा

इस मामले में हमारे पास प्रकाशन तिथि के लिए स्पष्ट न्यूनतम और अधिकतम गुण होंगे ताकि इस पर फ़िल्टर किया जा सके।

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

### क्वेरी जनरेशन

उपयोगकर्ता प्रश्नों को संरचित क्वेरी में रूपांतरित करने के लिए हम OpenAI के टूल-कॉलिंग एपीआई का उपयोग करेंगे। विशेष रूप से, हम नए [ChatModel.with_structured_output()](/docs/modules/model_io/chat/structured_output) निर्माता का उपयोग करेंगे ताकि स्कीमा को मॉडल को पास करने और आउटपुट को पार्स करने में मदद मिल सके।

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

आइए देखें कि हमारे विश्लेषक पहले से खोजे गए प्रश्नों के लिए क्या क्वेरी जनरेट करता है:

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

## क्वेरी विश्लेषण के साथ पुनर्प्राप्ति

हमारा क्वेरी विश्लेषण काफी अच्छा लग रहा है; अब आइए इस जनरेट किए गए क्वेरी का उपयोग करके वास्तव में पुनर्प्राप्ति करते हैं।

**नोट:** हमारे उदाहरण में, हमने `tool_choice="Search"` निर्दिष्ट किया। यह LLM को केवल एक - और केवल एक - टूल को कॉल करने के लिए मजबूर करेगा, मतलब कि हमेशा एक अनुकूलित क्वेरी होगी जिसे देखा जा सकता है। ध्यान दें कि यह हमेशा मामला नहीं है - जब कोई - या एक से अधिक - अनुकूलित क्वेरी वापस नहीं आती है, तो उन स्थितियों से निपटने के लिए अन्य गाइड देखें।

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

अब हम इस समस्यात्मक इनपुट पर यह श्रृंखला चला सकते हैं और देख सकते हैं कि यह केवल उस वर्ष के परिणाम देता है!

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
