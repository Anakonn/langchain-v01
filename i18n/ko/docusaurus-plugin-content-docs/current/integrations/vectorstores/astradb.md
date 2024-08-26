---
translated: true
---

# Astra DB

이 페이지는 [Astra DB](https://docs.datastax.com/en/astra/home/astra.html)를 벡터 스토어로 사용하는 빠른 시작 가이드를 제공합니다.

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html)는 Apache Cassandra®를 기반으로 하는 서버리스 벡터 지원 데이터베이스이며, 사용하기 쉬운 JSON API를 통해 편리하게 제공됩니다.

_참고: 데이터베이스 액세스 외에도 OpenAI API 키가 필요하여 전체 예제를 실행할 수 있습니다._

## 설정 및 일반 종속성

이 통합을 사용하려면 해당 Python 패키지가 필요합니다:

```python
pip install --upgrade langchain-astradb
```

_**참고.** 이 페이지의 전체 데모를 실행하려면 다음과 같은 패키지가 모두 필요합니다. LangChain 설정에 따라 일부를 설치해야 할 수 있습니다:_

```python
pip install langchain langchain-openai datasets pypdf
```

### 종속성 가져오기

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## 벡터 스토어 가져오기

```python
from langchain_astradb import AstraDBVectorStore
```

## 연결 매개변수

이러한 매개변수는 Astra DB 대시보드에서 찾을 수 있습니다:

- API 엔드포인트는 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`과 같습니다.
- 토큰은 `AstraCS:6gBhNmsk135....`와 같습니다.
- 선택적으로 _네임스페이스_를 `my_namespace`와 같이 제공할 수 있습니다.

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = input("(optional) Namespace = ")
if desired_namespace:
    ASTRA_DB_KEYSPACE = desired_namespace
else:
    ASTRA_DB_KEYSPACE = None
```

이제 벡터 스토어를 만들 수 있습니다:

```python
vstore = AstraDBVectorStore(
    embedding=embe,
    collection_name="astra_vector_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_KEYSPACE,
)
```

## 데이터 세트 로드

소스 데이터세트의 각 항목을 `Document`로 변환한 다음 벡터 스토어에 작성합니다:

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

위의 코드에서 `metadata` 사전은 소스 데이터에서 생성되며 `Document`의 일부입니다.

_참고: [Astra DB API 문서](https://docs.datastax.com/en/astra-serverless/docs/develop/dev-with-json.html#_json_api_limits)에서 유효한 메타데이터 필드 이름을 확인하십시오. 일부 문자는 예약되어 사용할 수 없습니다._

`add_texts`를 사용하여 추가 항목을 추가합니다:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_참고: `add_texts`와 `add_documents`의 실행 속도를 높이려면 이러한 대량 작업에 대한 동시성 수준을 높이는 것이 좋습니다. 클래스 생성자와 `add_texts` 문서에서 `*_concurrency` 매개변수를 확인하십시오. 네트워크 및 클라이언트 시스템 사양에 따라 최적의 매개변수 선택이 달라질 수 있습니다._

## 검색 실행

이 섹션에서는 메타데이터 필터링과 유사성 점수 가져오기를 보여줍니다:

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### MMR(Maximal-marginal-relevance) 검색

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

### 비동기

Astra DB 벡터 스토어는 모든 완전히 비동기 메서드(`asimilarity_search`, `afrom_texts`, `adelete` 등)를 기본적으로 지원합니다. 즉, 스레드 래핑이 필요하지 않습니다.

## 저장된 문서 삭제

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## 최소 RAG 체인

다음 셀에서는 간단한 RAG 파이프라인을 구현합니다:
- 샘플 PDF 파일을 다운로드하고 스토어에 로드합니다.
- LCEL(LangChain Expression Language)을 사용하여 벡터 스토어를 중심으로 RAG 체인을 만듭니다.
- 질문-답변 체인을 실행합니다.

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

자세한 내용은 Astra DB를 사용하는 완전한 RAG 템플릿을 [여기](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb)에서 확인하세요.

## 정리

Astra DB 인스턴스에서 컬렉션을 완전히 삭제하려면 이 코드를 실행하세요.

_(저장된 데이터가 모두 손실됩니다.)_

```python
vstore.delete_collection()
```
