---
translated: true
---

# MultiQueryRetriever

दूरी-आधारित वेक्टर डेटाबेस पुनर्प्राप्ति (retrieval) प्रविष्टियों (queries) को उच्च-आयामी स्थान में एम्बेड (प्रतिनिधित्व) करती है और "दूरी" के आधार पर समान एम्बेड किए गए दस्तावेजों को खोजती है। लेकिन, पुनर्प्राप्ति प्रविष्टि शब्दावली में सूक्ष्म परिवर्तनों के साथ अलग परिणाम दे सकती है या यदि एम्बेडिंग डेटा की अर्थशास्त्र को अच्छी तरह से नहीं पकड़ते हैं। प्रोम्प्ट इंजीनियरिंग/ट्यूनिंग कभी-कभी इन समस्याओं को मैन्युअल रूप से संबोधित करने के लिए किया जाता है, लेकिन यह थकाऊ हो सकता है।

`MultiQueryRetriever` प्रोम्प्ट ट्यूनिंग की प्रक्रिया को स्वचालित करता है, जिसमें एक एलएलएम का उपयोग करके दिए गए उपयोगकर्ता इनपुट प्रविष्टि के लिए विभिन्न दृष्टिकोणों से कई प्रविष्टियां (queries) उत्पन्न करता है। प्रत्येक प्रविष्टि के लिए, यह प्रासंगिक दस्तावेजों का एक सेट पुनर्प्राप्त करता है और सभी प्रविष्टियों के अद्वितीय संयोजन को प्राप्त करने के लिए लेता है ताकि संभावित रूप से प्रासंगिक दस्तावेजों का एक बड़ा सेट प्राप्त हो सके। एक ही प्रश्न पर कई दृष्टिकोणों को उत्पन्न करके, `MultiQueryRetriever` दूरी-आधारित पुनर्प्राप्ति की कुछ सीमाओं को पार कर सकता है और परिणामों का एक समृद्ध सेट प्राप्त कर सकता है।

```python
# Build a sample vectorDB
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load blog post
loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

# Split
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
splits = text_splitter.split_documents(data)

# VectorDB
embedding = OpenAIEmbeddings()
vectordb = Chroma.from_documents(documents=splits, embedding=embedding)
```

#### सरल उपयोग

प्रविष्टि उत्पादन के लिए उपयोग करने के लिए एलएलएम निर्दिष्ट करें, और पुनर्प्राप्तकर्ता शेष कार्य करेगा।

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

question = "What are the approaches to Task Decomposition?"
llm = ChatOpenAI(temperature=0)
retriever_from_llm = MultiQueryRetriever.from_llm(
    retriever=vectordb.as_retriever(), llm=llm
)
```

```python
# Set logging for the queries
import logging

logging.basicConfig()
logging.getLogger("langchain.retrievers.multi_query").setLevel(logging.INFO)
```

```python
unique_docs = retriever_from_llm.invoke(question)
len(unique_docs)
```

```output
INFO:langchain.retrievers.multi_query:Generated queries: ['1. How can Task Decomposition be approached?', '2. What are the different methods for Task Decomposition?', '3. What are the various approaches to decomposing tasks?']
```

```output
5
```

#### अपना प्रोम्प्ट प्रदान करना

आप एक प्रोम्प्ट के साथ-साथ एक आउटपुट पार्सर भी प्रदान कर सकते हैं ताकि परिणामों को प्रविष्टियों की एक सूची में विभाजित किया जा सके।

```python
from typing import List

from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field


# Output parser will split the LLM result into a list of queries
class LineList(BaseModel):
    # "lines" is the key (attribute name) of the parsed output
    lines: List[str] = Field(description="Lines of text")


class LineListOutputParser(PydanticOutputParser):
    def __init__(self) -> None:
        super().__init__(pydantic_object=LineList)

    def parse(self, text: str) -> LineList:
        lines = text.strip().split("\n")
        return LineList(lines=lines)


output_parser = LineListOutputParser()

QUERY_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an AI language model assistant. Your task is to generate five
    different versions of the given user question to retrieve relevant documents from a vector
    database. By generating multiple perspectives on the user question, your goal is to help
    the user overcome some of the limitations of the distance-based similarity search.
    Provide these alternative questions separated by newlines.
    Original question: {question}""",
)
llm = ChatOpenAI(temperature=0)

# Chain
llm_chain = LLMChain(llm=llm, prompt=QUERY_PROMPT, output_parser=output_parser)

# Other inputs
question = "What are the approaches to Task Decomposition?"
```

```python
# Run
retriever = MultiQueryRetriever(
    retriever=vectordb.as_retriever(), llm_chain=llm_chain, parser_key="lines"
)  # "lines" is the key (attribute name) of the parsed output

# Results
unique_docs = retriever.invoke(query="What does the course say about regression?")
len(unique_docs)
```

```output
INFO:langchain.retrievers.multi_query:Generated queries: ["1. What is the course's perspective on regression?", '2. Can you provide information on regression as discussed in the course?', '3. How does the course cover the topic of regression?', "4. What are the course's teachings on regression?", '5. In relation to the course, what is mentioned about regression?']
```

```output
11
```
