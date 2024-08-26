---
translated: true
---

# 파이스 (Faiss)

>[Facebook AI 유사성 검색 (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/)는 밀집 벡터의 효율적인 유사성 검색 및 클러스터링을 위한 라이브러리입니다. 이 라이브러리는 RAM에 맞지 않는 크기의 벡터 집합에서도 검색을 수행할 수 있는 알고리즘을 포함하고 있습니다. 또한 평가 및 매개변수 조정을 위한 지원 코드도 포함되어 있습니다.

[Faiss 문서](https://faiss.ai/).

이 노트북은 `FAISS` 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다. 이 통합과 관련된 특정 기능을 보여줄 것입니다. 이를 통해, 더 큰 체인의 일환으로 이 벡터스토어를 사용하는 방법을 배우기 위해 [관련 사용 사례 페이지](/docs/use_cases/question_answering)를 탐색하는 것이 유용할 수 있습니다.

## 설정

통합은 `langchain-community` 패키지에 있습니다. 또한 `faiss` 패키지 자체를 설치해야 합니다. 임베딩을 위해 OpenAI를 사용할 것이므로 이러한 요구 사항도 설치해야 합니다. 다음과 같이 설치할 수 있습니다:

```bash
pip install -U langchain-community faiss-cpu langchain-openai tiktoken
```

GPU 지원 버전을 사용하려면 `faiss-gpu`를 설치할 수도 있습니다.

OpenAI를 사용하고 있으므로 OpenAI API 키가 필요합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

최고 수준의 관찰 가능성을 위해 [LangSmith](https://smith.langchain.com/)를 설정하는 것도 도움이 됩니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 데이터 수집

여기서 우리는 벡터스토어에 문서를 수집합니다.

```python
# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
print(db.index.ntotal)
```

```output
42
```

## 쿼리

이제 벡터스토어를 쿼리할 수 있습니다. 이를 수행하는 몇 가지 방법이 있습니다. 가장 표준적인 방법은 `similarity_search`를 사용하는 것입니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 검색기로 사용하기

벡터스토어를 [검색기](/docs/modules/data_connection/retrievers) 클래스로 변환할 수도 있습니다. 이를 통해 다양한 LangChain 메서드에서 쉽게 사용할 수 있으며, 대부분의 메서드는 검색기와 함께 작동합니다.

```python
retriever = db.as_retriever()
docs = retriever.invoke(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 점수가 포함된 유사성 검색

FAISS 특정 메서드가 몇 가지 있습니다. 그 중 하나는 `similarity_search_with_score`로, 문서뿐만 아니라 쿼리와의 거리 점수도 반환할 수 있습니다. 반환된 거리 점수는 L2 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.36913747)
```

`similarity_search_by_vector`를 사용하여 주어진 임베딩 벡터와 유사한 문서를 검색할 수도 있습니다. 이 메서드는 문자열 대신 임베딩 벡터를 매개변수로 받습니다.

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = db.similarity_search_by_vector(embedding_vector)
```

## 저장 및 로드

FAISS 인덱스를 저장하고 로드할 수도 있습니다. 매번 재생성할 필요가 없으므로 유용합니다.

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings)

docs = new_db.similarity_search(query)
```

```python
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

# 바이트로 직렬화 및 역직렬화

FAISS 인덱스를 피클로 저장할 수 있는 함수입니다. 90 MB 크기의 임베딩 모델(sentence-transformers/all-MiniLM-L6-v2 또는 다른 모델)을 사용하는 경우, 결과 피클 크기는 90 MB 이상이 될 것입니다. 모델 크기도 전체 크기에 포함됩니다. 이를 해결하려면 아래 함수를 사용하십시오. 이 함수는 FAISS 인덱스만 직렬화하며 크기는 훨씬 작아집니다. 이를 통해 SQL과 같은 데이터베이스에 인덱스를 저장할 때 유용합니다.

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl
)  # Load the index
```

## 병합

두 개의 FAISS 벡터스토어를 병합할 수도 있습니다.

```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```

```python
db2.docstore._dict
```

```output
{'807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'068c473b-d420-487a-806b-fb0ccea7f711': Document(page_content='foo', metadata={}),
 '807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

## 필터링이 포함된 유사성 검색

FAISS 벡터스토어는 필터링도 지원할 수 있습니다. FAISS는 필터링을 기본적으로 지원하지 않으므로 수동으로 수행해야 합니다. 먼저 `k`보다 많은 결과를 가져온 다음 필터링합니다. 이 필터는 메타데이터 딕셔너리를 입력으로 받아 부울 값을 반환하는 callable이거나, 각 누락된 키가 무시되고 각 존재하는 키가 값 목록에 있어야 하는 메타데이터 딕셔너리입니다. 검색 메서드를 호출할 때 `fetch_k` 매개변수를 설정하여 필터링하기 전에 가져올 문서 수를 설정할 수도 있습니다. 여기에 작은 예제가 있습니다:

```python
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```

이제 동일한 쿼리 호출을 수행하지만 `page = 1`만 필터링합니다.

```python
results_with_scores = db.similarity_search_with_score("foo", filter=dict(page=1))
# Or with a callable:
# results_with_scores = db.similarity_search_with_score("foo", filter=lambda d: d["page"] == 1)
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

동일한 작업을 `max_marginal_relevance_search`에서도 수행할 수 있습니다.

```python
results = db.max_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

`similarity_search`를 호출할 때 `fetch_k` 매개변수를 설정하는 방법의 예입니다. 보통 `fetch_k` 매개변수 >> `k` 매개변수를 설정하고 싶을 것입니다. 이는 `fetch_k` 매개변수가 필터링하기 전에 가져올 문서 수이기 때문입니다. `fetch_k`를 낮게 설정하면 필터링할 문서가 충분하지 않을 수 있습니다.

```python
results = db.similarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## 삭제

벡터스토어에서 레코드를 삭제할 수도 있습니다. 아래 예제에서 `db.index_to_docstore_id`는 FAISS 인덱스의 요소가 포함된 딕셔너리를 나타냅니다.

```python
print("count before:", db.index.ntotal)
db.delete([db.index_to_docstore_id[0]])
print("count after:", db.index.ntotal)
```

```output
count before: 8
count after: 7
```
