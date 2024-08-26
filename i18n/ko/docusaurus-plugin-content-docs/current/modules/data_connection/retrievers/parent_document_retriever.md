---
translated: true
---

# 부모 문서 검색기

문서를 검색하기 위해 분할할 때, 종종 상충되는 요구사항이 있습니다:

1. 임베딩이 의미를 가장 정확하게 반영할 수 있도록 작은 문서를 가지고 싶습니다. 너무 길면 임베딩이 의미를 잃을 수 있습니다.
2. 각 청크의 문맥이 유지되도록 충분히 긴 문서를 가지고 싶습니다.

`ParentDocumentRetriever`는 이 균형을 잡습니다. 작은 데이터 청크를 분할하고 저장합니다. 검색 시, 먼저 작은 청크를 가져오지만 그 청크의 부모 ID를 조회하여 더 큰 문서를 반환합니다.

"부모 문서"는 작은 청크가 원래 속했던 문서를 의미합니다. 이는 전체 원본 문서 또는 더 큰 청크일 수 있습니다.

```python
from langchain.retrievers import ParentDocumentRetriever
```

```python
from langchain.storage import InMemoryStore
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
```

## 전체 문서 검색

이 모드에서는 전체 문서를 검색하고자 합니다. 따라서 자식 분할기만 지정합니다.

```python
# This text splitter is used to create the child documents
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)
```

```python
retriever.add_documents(docs, ids=None)
```

두 개의 키가 생성되었습니다. 두 개의 문서를 추가했기 때문입니다.

```python
list(store.yield_keys())
```

```output
['cfdf4af7-51f2-4ea3-8166-5be208efa040',
 'bf213c21-cc66-4208-8a72-733d030187e6']
```

이제 벡터 저장소 검색 기능을 호출해 보겠습니다. 작은 청크를 반환하는 것을 확인할 수 있습니다(작은 청크를 저장하고 있기 때문).

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

이제 전체 검색기에서 검색해 보겠습니다. 이는 더 큰 문서를 반환해야 합니다 - 작은 청크가 속한 문서를 반환합니다.

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
38540
```

## 더 큰 청크 검색

때로는 전체 문서가 너무 커서 그대로 검색하고 싶지 않을 수 있습니다. 이 경우 원본 문서를 먼저 더 큰 청크로 분할하고, 그 다음 작은 청크로 분할하는 것이 좋습니다. 작은 청크를 색인화하지만, 검색 시에는 더 큰 청크를 반환합니다(전체 문서는 아닙니다).

```python
# This text splitter is used to create the parent documents
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
# This text splitter is used to create the child documents
# It should create documents smaller than the parent
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="split_parents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
```

```python
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```

```python
retriever.add_documents(docs)
```

두 개 이상의 문서가 있는 것을 확인할 수 있습니다 - 이는 더 큰 청크입니다.

```python
len(list(store.yield_keys()))
```

```output
66
```

기본 벡터 저장소가 여전히 작은 청크를 검색하는지 확인해 보겠습니다.

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
1849
```

```python
print(retrieved_docs[0].page_content)
```

```output
In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```
