---
translated: true
---

# 다중 벡터 검색기

문서당 여러 벡터를 저장하는 것이 유용한 경우가 많습니다. 이러한 경우에 유용한 다양한 사용 사례가 있습니다. LangChain에는 이러한 설정을 쉽게 쿼리할 수 있는 기본 `MultiVectorRetriever`가 있습니다. 문서당 여러 벡터를 생성하는 방법에 많은 복잡성이 있습니다. 이 노트북에서는 이러한 벡터를 생성하고 `MultiVectorRetriever`를 사용하는 일반적인 방법을 다룹니다.

문서당 여러 벡터를 생성하는 방법에는 다음이 포함됩니다:

- 더 작은 청크: 문서를 더 작은 청크로 분할하고 해당 청크를 임베딩합니다(이것이 ParentDocumentRetriever입니다).
- 요약: 각 문서에 대한 요약을 생성하고 문서와 함께(또는 대신에) 임베딩합니다.
- 가설 질문: 각 문서에 적합한 가설 질문을 생성하고 문서와 함께(또는 대신에) 임베딩합니다.

수동으로 임베딩을 추가하는 방법도 가능합니다. 이는 문서를 검색하는 데 사용되어야 하는 질문이나 쿼리를 명시적으로 추가할 수 있어 더 많은 제어가 가능하기 때문에 좋습니다.

```python
from langchain.retrievers.multi_vector import MultiVectorRetriever
```

```python
from langchain.storage import InMemoryByteStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loaders = [
    TextLoader("../../paul_graham_essay.txt"),
    TextLoader("../../state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000)
docs = text_splitter.split_documents(docs)
```

## 더 작은 청크

더 큰 정보 청크를 검색하는 것이 유용할 수 있지만, 더 작은 청크를 임베딩하는 것이 좋습니다. 이렇게 하면 의미론적 의미를 가능한 한 정확하게 포착할 수 있지만, 가능한 한 많은 컨텍스트를 하위 스트림으로 전달할 수 있습니다. 이것이 `ParentDocumentRetriever`가 하는 일입니다. 여기서는 내부 작동 방식을 보여줍니다.

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
import uuid

doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
# The splitter to use to create smaller chunks
child_text_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
```

```python
sub_docs = []
for i, doc in enumerate(docs):
    _id = doc_ids[i]
    _sub_docs = child_text_splitter.split_documents([doc])
    for _doc in _sub_docs:
        _doc.metadata[id_key] = _id
    sub_docs.extend(_sub_docs)
```

```python
retriever.vectorstore.add_documents(sub_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# Vectorstore alone retrieves the small chunks
retriever.vectorstore.similarity_search("justice breyer")[0]
```

```output
Document(page_content='Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.', metadata={'doc_id': '2fd77862-9ed5-4fad-bf76-e487b747b333', 'source': '../../state_of_the_union.txt'})
```

```python
# Retriever returns larger chunks
len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

벡터 데이터베이스에서 검색기가 수행하는 기본 검색 유형은 유사성 검색입니다. LangChain 벡터 저장소는 [Max Marginal Relevance](https://api.python.langchain.com/en/latest/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.max_marginal_relevance_search) 검색도 지원합니다. 이를 원하는 경우 `search_type` 속성을 다음과 같이 설정할 수 있습니다:

```python
from langchain.retrievers.multi_vector import SearchType

retriever.search_type = SearchType.mmr

len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

## 요약

종종 요약이 청크가 무엇에 관한 것인지 더 정확하게 요약할 수 있어 더 나은 검색이 가능합니다. 여기서는 요약을 생성하고 이를 임베딩하는 방법을 보여줍니다.

```python
import uuid

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
chain = (
    {"doc": lambda x: x.page_content}
    | ChatPromptTemplate.from_template("Summarize the following document:\n\n{doc}")
    | ChatOpenAI(max_retries=0)
    | StrOutputParser()
)
```

```python
summaries = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="summaries", embedding_function=OpenAIEmbeddings())
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
summary_docs = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(summaries)
]
```

```python
retriever.vectorstore.add_documents(summary_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# # We can also add the original chunks to the vectorstore if we so want
# for i, doc in enumerate(docs):
#     doc.metadata[id_key] = doc_ids[i]
# retriever.vectorstore.add_documents(docs)
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs[0]
```

```output
Document(page_content="The document is a speech given by President Biden addressing various issues and outlining his agenda for the nation. He highlights the importance of nominating a Supreme Court justice and introduces his nominee, Judge Ketanji Brown Jackson. He emphasizes the need to secure the border and reform the immigration system, including providing a pathway to citizenship for Dreamers and essential workers. The President also discusses the protection of women's rights, including access to healthcare and the right to choose. He calls for the passage of the Equality Act to protect LGBTQ+ rights. Additionally, President Biden discusses the need to address the opioid epidemic, improve mental health services, support veterans, and fight against cancer. He expresses optimism for the future of America and the strength of the American people.", metadata={'doc_id': '56345bff-3ead-418c-a4ff-dff203f77474'})
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```

## 가설 쿼리

LLM을 사용하여 특정 문서에 대해 묻을 수 있는 가설 질문 목록을 생성할 수 있습니다. 이러한 질문을 임베딩할 수 있습니다.

```python
functions = [
    {
        "name": "hypothetical_questions",
        "description": "Generate hypothetical questions",
        "parameters": {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": ["questions"],
        },
    }
]
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    {"doc": lambda x: x.page_content}
    # Only asking for 3 hypothetical questions, but this could be adjusted
    | ChatPromptTemplate.from_template(
        "Generate a list of exactly 3 hypothetical questions that the below document could be used to answer:\n\n{doc}"
    )
    | ChatOpenAI(max_retries=0, model="gpt-4").bind(
        functions=functions, function_call={"name": "hypothetical_questions"}
    )
    | JsonKeyOutputFunctionsParser(key_name="questions")
)
```

```python
chain.invoke(docs[0])
```

```output
["What was the author's first experience with programming like?",
 'Why did the author switch their focus from AI to Lisp during their graduate studies?',
 'What led the author to contemplate a career in art instead of computer science?']
```

```python
hypothetical_questions = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="hypo-questions", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
question_docs = []
for i, question_list in enumerate(hypothetical_questions):
    question_docs.extend(
        [Document(page_content=s, metadata={id_key: doc_ids[i]}) for s in question_list]
    )
```

```python
retriever.vectorstore.add_documents(question_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs
```

```output
[Document(page_content='Who has been nominated to serve on the United States Supreme Court?', metadata={'doc_id': '0b3a349e-c936-4e77-9c40-0a39fc3e07f0'}),
 Document(page_content="What was the context and content of Robert Morris' advice to the document's author in 2010?", metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='How did personal circumstances influence the decision to pass on the leadership of Y Combinator?', metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='What were the reasons for the author leaving Yahoo in the summer of 1999?', metadata={'doc_id': 'ce4f4981-ca60-4f56-86f0-89466de62325'})]
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```
