---
translated: true
---

# Jina Reranker

이 노트북은 문서 압축 및 검색을 위해 Jina Reranker를 사용하는 방법을 보여줍니다.

```python
%pip install -qU langchain langchain-openai langchain-community langchain-text-splitters langchainhub

%pip install --upgrade --quiet  faiss

# OR  (depending on Python version)

%pip install --upgrade --quiet  faiss_cpu
```

```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## 기본 벡터 저장소 검색기 설정

먼저 간단한 벡터 저장소 검색기를 초기화하고 2023년 국정연설문(chunk 단위)을 저장해 보겠습니다. 검색기를 설정하여 많은 수(20개)의 문서를 검색할 수 있습니다.

##### Jina 및 OpenAI API 키 설정

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
os.environ["JINA_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import JinaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader(
    "../../modules/state_of_the_union.txt",
).load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)

embedding = JinaEmbeddings(model_name="jina-embeddings-v2-base-en")
retriever = FAISS.from_documents(texts, embedding).as_retriever(search_kwargs={"k": 20})

query = "What did the president say about Ketanji Brown Jackson"
docs = retriever.get_relevant_documents(query)
pretty_print_docs(docs)
```

## Jina Reranker를 사용한 재순위화

이제 기본 검색기를 ContextualCompressionRetriever로 감싸고, Jina Reranker를 압축기로 사용해 보겠습니다.

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_community.document_compressors import JinaRerank

compressor = JinaRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.get_relevant_documents(
    "What did the president say about Ketanji Jackson Brown"
)
```

```python
pretty_print_docs(compressed_docs)
```

## Jina Reranker를 사용한 QA 재순위화

```python
from langchain import hub
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
retrieval_qa_chat_prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

Answer any use questions based solely on the context below:

<context>
[33;1m[1;3m{context}[0m
</context>

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
combine_docs_chain = create_stuff_documents_chain(llm, retrieval_qa_chat_prompt)
chain = create_retrieval_chain(compression_retriever, combine_docs_chain)
```

```python
chain.invoke({"input": query})
```
