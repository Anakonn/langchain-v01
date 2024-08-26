---
translated: true
---

# JaguarDB 벡터 데이터베이스

>[JaguarDB 벡터 데이터베이스](http://www.jaguardb.com/windex.html)
>
>1. 분산 벡터 데이터베이스입니다.
>2. JaguarDB의 "ZeroMove" 기능을 통해 즉각적인 수평 확장이 가능합니다.
>3. 멀티모달: 임베딩, 텍스트, 이미지, 비디오, PDF, 오디오, 시계열, 지리공간 데이터를 지원합니다.
>4. 모두 마스터: 병렬 읽기와 쓰기가 모두 가능합니다.
>5. 이상 탐지 기능이 있습니다.
>6. RAG 지원: 대규모 언어 모델(LLM)과 독점 및 실시간 데이터를 결합합니다.
>7. 공유 메타데이터: 여러 벡터 인덱스 간 메타데이터 공유가 가능합니다.
>8. 거리 메트릭: 유클리드, 코사인, 내적, 맨해튼, 체비셰프, 해밍, 자카드, 민코프스키 등을 지원합니다.

## 사전 요구 사항

이 파일의 예제를 실행하려면 두 가지 요구 사항이 있습니다.
1. JaguarDB 서버와 HTTP 게이트웨이 서버를 설치하고 설정해야 합니다.
   [www.jaguardb.com](http://www.jaguardb.com)의 지침을 참조하세요.

2. JaguarDB HTTP 클라이언트 패키지를 설치해야 합니다:
   ```
       pip install -U jaguardb-http-client
   ```

## Langchain을 통한 RAG

이 섹션에서는 Langchain 소프트웨어 스택에서 LLM과 Jaguar를 함께 사용하여 채팅하는 방법을 보여줍니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

"""
Load a text file into a set of documents
"""
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=300)
docs = text_splitter.split_documents(documents)

"""
Instantiate a Jaguar vector store
"""
### Jaguar HTTP endpoint
url = "http://192.168.5.88:8080/fwww/"

### Use OpenAI embedding model
embeddings = OpenAIEmbeddings()

### Pod is a database for vectors
pod = "vdb"

### Vector store name
store = "langchain_rag_store"

### Vector index name
vector_index = "v"

### Type of the vector index
# cosine: distance metric
# fraction: embedding vectors are decimal numbers
# float: values stored with floating-point numbers
vector_type = "cosine_fraction_float"

### Dimension of each embedding vector
vector_dimension = 1536

### Instantiate a Jaguar store object
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

"""
Login must be performed to authorize the client.
The environment variable JAGUAR_API_KEY or file $HOME/.jagrc
should contain the API key for accessing JaguarDB servers.
"""
vectorstore.login()


"""
Create vector store on the JaguarDB database server.
This should be done only once.
"""
# Extra metadata fields for the vector store
metadata = "category char(16)"

# Number of characters for the text field of the store
text_size = 4096

#  Create a vector store on the server
vectorstore.create(metadata, text_size)

"""
Add the texts from the text splitter to our vectorstore
"""
vectorstore.add_documents(docs)

""" Get the retriever object """
retriever = vectorstore.as_retriever()
# retriever = vectorstore.as_retriever(search_kwargs={"where": "m1='123' and m2='abc'"})

""" The retriever object can be used with LangChain and LLM """
```

## Jaguar 벡터 스토어와의 상호 작용

사용자는 Jaguar 벡터 스토어와 직접 상호 작용하여 유사성 검색과 이상 탐지를 수행할 수 있습니다.

```python
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings

# Instantiate a Jaguar vector store object
url = "http://192.168.3.88:8080/fwww/"
pod = "vdb"
store = "langchain_test_store"
vector_index = "v"
vector_type = "cosine_fraction_float"
vector_dimension = 10
embeddings = OpenAIEmbeddings()
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

# Login for authorization
vectorstore.login()

# Create the vector store with two metadata fields
# This needs to be run only once.
metadata_str = "author char(32), category char(16)"
vectorstore.create(metadata_str, 1024)

# Add a list of texts
texts = ["foo", "bar", "baz"]
metadatas = [
    {"author": "Adam", "category": "Music"},
    {"author": "Eve", "category": "Music"},
    {"author": "John", "category": "History"},
]
ids = vectorstore.add_texts(texts=texts, metadatas=metadatas)

#  Search similar text
output = vectorstore.similarity_search(
    query="foo",
    k=1,
    metadatas=["author", "category"],
)
assert output[0].page_content == "foo"
assert output[0].metadata["author"] == "Adam"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Search with filtering (where)
where = "author='Eve'"
output = vectorstore.similarity_search(
    query="foo",
    k=3,
    fetch_k=9,
    where=where,
    metadatas=["author", "category"],
)
assert output[0].page_content == "bar"
assert output[0].metadata["author"] == "Eve"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Anomaly detection
result = vectorstore.is_anomalous(
    query="dogs can jump high",
)
assert result is False

# Remove all data in the store
vectorstore.clear()
assert vectorstore.count() == 0

# Remove the store completely
vectorstore.drop()

# Logout
vectorstore.logout()
```
