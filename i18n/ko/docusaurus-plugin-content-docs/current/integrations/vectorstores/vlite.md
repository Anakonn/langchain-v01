---
translated: true
---

# vlite

VLite는 임베딩을 사용하여 데이터를 의미론적으로 저장하고 검색할 수 있는 간단하고 빠른 벡터 데이터베이스입니다. numpy로 만들어진 vlite는 RAG, 유사도 검색, 임베딩을 프로젝트에 구현할 수 있는 경량 배터리 포함 데이터베이스입니다.

## 설치

LangChain에서 VLite를 사용하려면 `vlite` 패키지를 설치해야 합니다:

```bash
!pip install vlite
```

## VLite 가져오기

```python
from langchain.vectorstores import VLite
```

## 기본 예제

이 기본 예제에서는 텍스트 문서를 로드하고 VLite 벡터 데이터베이스에 저장합니다. 그런 다음 쿼리를 기반으로 관련 문서를 검색하기 위해 유사도 검색을 수행합니다.

VLite는 텍스트 청크화와 임베딩을 처리하며, 이러한 매개변수는 텍스트를 사전 청크화하고/또는 VLite 데이터베이스에 해당 청크를 임베딩하여 변경할 수 있습니다.

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Load the document and split it into chunks
loader = TextLoader("path/to/document.txt")
documents = loader.load()

# Create a VLite instance
vlite = VLite(collection="my_collection")

# Add documents to the VLite vector database
vlite.add_documents(documents)

# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query)

# Print the most relevant document
print(docs[0].page_content)
```

## 텍스트 및 문서 추가

`add_texts` 및 `add_documents` 메서드를 사용하여 VLite 벡터 데이터베이스에 텍스트 또는 문서를 추가할 수 있습니다.

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## 유사도 검색

VLite는 저장된 문서에 대한 유사도 검색을 수행하는 메서드를 제공합니다.

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## 최대 한계 관련성 검색

VLite는 또한 쿼리와의 유사성과 검색된 문서 간의 다양성을 최적화하는 최대 한계 관련성(MMR) 검색을 지원합니다.

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## 문서 업데이트 및 삭제

`update_document` 및 `delete` 메서드를 사용하여 VLite 벡터 데이터베이스에서 문서를 업데이트하거나 삭제할 수 있습니다.

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## 문서 검색

`get` 메서드를 사용하여 ID 또는 메타데이터를 기반으로 VLite 벡터 데이터베이스에서 문서를 검색할 수 있습니다.

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## VLite 인스턴스 생성

다양한 방법을 사용하여 VLite 인스턴스를 생성할 수 있습니다:

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## 추가 기능

VLite는 벡터 데이터베이스 관리를 위한 추가 기능을 제공합니다:

```python
from langchain.vectorstores import VLite
vlite = VLite(collection="my_collection")

# Get the number of items in the collection
count = vlite.count()

# Save the collection
vlite.save()

# Clear the collection
vlite.clear()

# Get collection information
vlite.info()

# Dump the collection data
data = vlite.dump()
```
