---
translated: true
---

# MultiQueryRetriever

距離ベクトルデータベース検索では、クエリを高次元空間に埋め込み(表現)し、「距離」に基づいて類似した埋め込まれたドキュメントを見つけます。しかし、クエリの言い回しを微妙に変えたり、埋め込みがデータのセマンティクスを十分に捉えていない場合、検索結果が異なる可能性があります。プロンプトエンジニアリング/チューニングを手動で行うことで、これらの問題に対処することができますが、それは面倒な作業になることがあります。

`MultiQueryRetriever`は、LLMを使ってユーザーの入力クエリから複数のクエリを生成することで、プロンプトチューニングのプロセスを自動化します。各クエリについて、関連するドキュメントのセットを取得し、すべてのクエリにわたる一意の和集合を取ることで、潜在的に関連性の高いドキュメントのより大きなセットを得ることができます。複数の視点からの同じ質問を生成することで、`MultiQueryRetriever`は距離ベースの検索の限界を克服し、より豊かな結果セットを得ることができるかもしれません。

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

#### 簡単な使い方

使用するLLMを指定すれば、レトリーバーが残りの作業を行います。

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

#### 独自のプロンプトを提供する

プロンプトと出力パーサーを提供して、結果をクエリのリストに分割することもできます。

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
