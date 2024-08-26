---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/)는 AWS, Azure, GCP에서 사용할 수 있는 완전 관리형 클라우드 데이터베이스입니다. 이제 MongoDB 문서 데이터에 대한 기본 벡터 검색을 지원합니다.

이 노트북은 [MongoDB Atlas Vector Search](https://www.mongodb.com/products/platform/atlas-vector-search)를 사용하여 임베딩을 MongoDB 문서에 저장하고, 벡터 검색 인덱스를 생성하며, 근사 최근접 이웃 알고리즘(`Hierarchical Navigable Small Worlds`)을 사용하여 KNN 검색을 수행하는 방법을 보여줍니다. 이는 [$vectorSearch MQL Stage](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)를 사용합니다.

MongoDB Atlas를 사용하려면 먼저 클러스터를 배포해야 합니다. 무료 평생 클러스터를 사용할 수 있습니다. 시작하려면 여기로 이동하세요: [quick start](https://www.mongodb.com/docs/atlas/getting-started/).

> 참고:
>
>* 추가 문서는 [LangChain-MongoDB site](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/)에서 찾을 수 있습니다.
>* 이 기능은 일반 공개되어 프로덕션 배포에 사용할 수 있습니다.
>* langchain 버전 0.0.305([release notes](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305))에서는 $vectorSearch MQL 단계에 대한 지원이 도입되었으며, MongoDB Atlas 6.0.11 및 7.0.2에서 사용할 수 있습니다. MongoDB Atlas의 이전 버전을 사용하는 사용자는 LangChain 버전을 <=0.0.304로 고정해야 합니다.
>

이 노트북에서는 MongoDB Atlas, OpenAI 및 Langchain을 사용하여 `Retrieval Augmented Generation`(RAG)을 수행하는 방법을 보여줍니다. [GPT 4 technical report](https://arxiv.org/pdf/2303.08774.pdf)에 대한 유사성 검색, 메타데이터 사전 필터링을 통한 유사성 검색, 질문 답변을 수행할 것입니다. 이 보고서는 2023년 3월에 발표되었으므로 OpenAI의 Large Language Model(LLM)의 매개변수 메모리에 포함되어 있지 않습니다(지식 컷오프 2021년 9월).

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 설정해야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

이제 MongoDB Atlas 클러스터에 대한 환경 변수를 설정하겠습니다.

```python
%pip install --upgrade --quiet  langchain pypdf pymongo langchain-openai tiktoken
```

```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

```python
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
```

## 벡터 검색 인덱스 생성

이제 클러스터에 벡터 검색 인덱스를 생성해 보겠습니다. 자세한 단계는 [Create Vector Search Index for LangChain](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/#create-the-atlas-vector-search-index) 섹션을 참조하세요.
아래 예에서 `embedding`은 임베딩 벡터가 포함된 필드의 이름입니다. 자세한 내용은 [documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/)을 참조하세요.
인덱스 이름을 `{ATLAS_VECTOR_SEARCH_INDEX_NAME}`으로 지정하고, 네임스페이스 `{DB_NAME}.{COLLECTION_NAME}`에 인덱스를 생성할 수 있습니다. 마지막으로 MongoDB Atlas의 JSON 편집기에 다음 정의를 작성하세요:

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

# 데이터 삽입

```python
from langchain_community.document_loaders import PyPDFLoader

# Load the PDF
loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
data = loader.load()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.split_documents(data)
```

```python
print(docs[0])
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

```python
# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What were the compute requirements for training GPT 4"
results = vector_search.similarity_search(query)

print(results[0].page_content)
```

# 데이터 쿼리

벡터 저장소를 직접 인스턴스화하고 쿼리를 실행할 수도 있습니다:

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_search = MongoDBAtlasVectorSearch.from_connection_string(
    MONGODB_ATLAS_CLUSTER_URI,
    DB_NAME + "." + COLLECTION_NAME,
    OpenAIEmbeddings(disallowed_special=()),
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

## 유사성 검색을 통한 사전 필터링

Atlas Vector Search는 MQL 연산자를 사용한 사전 필터링을 지원합니다. 아래는 위에서 로드한 동일한 데이터에 대한 예제 인덱스와 쿼리로, "page" 필드에 대한 메타데이터 필터링을 수행할 수 있습니다. 기존 인덱스를 필터 정의로 업데이트하고 벡터 검색을 통해 사전 필터링을 수행할 수 있습니다.

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "page"
    }
  ]
}
```

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)
```

## 유사성 검색 및 점수

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query,
    k=5,
)

# Display results
for result in results:
    print(result)
```

## 질문 답변

```python
qa_retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```

GPT-4는 이전 GPT 모델보다 훨씬 더 많은 컴퓨팅 능력을 필요로 합니다. OpenAI의 내부 코드베이스에서 파생된 데이터 세트에서 GPT-4는 가장 낮은 손실에 도달하기 위해 100p(petaflops)의 컴퓨팅 능력이 필요한 반면, 더 작은 모델은 1-10n(nanoflops)만 필요합니다.
