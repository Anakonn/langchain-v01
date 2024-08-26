---
translated: true
---

# 다중 쿼리 검색기

거리 기반 벡터 데이터베이스 검색은 쿼리를 고차원 공간에 임베딩(표현)하고 "거리"를 기반으로 유사한 임베딩된 문서를 찾습니다. 그러나 검색 결과는 쿼리 문구의 미묘한 변화나 임베딩이 데이터의 의미를 잘 포착하지 못할 경우 달라질 수 있습니다. 프롬프트 엔지니어링/튜닝을 수동으로 수행하여 이러한 문제를 해결할 수 있지만, 이는 번거로운 작업일 수 있습니다.

`MultiQueryRetriever`는 LLM을 사용하여 사용자 입력 쿼리에 대해 다양한 관점에서 여러 개의 쿼리를 생성함으로써 프롬프트 튜닝 과정을 자동화합니다. 각 쿼리에 대해 관련 문서 집합을 검색하고, 모든 쿼리에 걸쳐 고유한 문서 집합을 취함으로써 잠재적으로 관련성이 높은 더 큰 문서 집합을 얻을 수 있습니다. `MultiQueryRetriever`는 동일한 질문에 대해 다양한 관점을 생성함으로써 거리 기반 검색의 한계를 극복하고 더 풍부한 결과 집합을 얻을 수 있습니다.

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

#### 간단한 사용법

사용할 LLM을 지정하면 검색기가 나머지 작업을 수행합니다.

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

#### 사용자 정의 프롬프트 제공

프롬프트와 출력 파서를 제공하여 결과를 쿼리 목록으로 분할할 수도 있습니다.

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
