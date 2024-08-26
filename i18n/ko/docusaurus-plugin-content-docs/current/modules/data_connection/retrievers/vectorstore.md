---
sidebar_position: 0
translated: true
---

# 벡터 저장소 기반 검색기

벡터 저장소 검색기는 벡터 저장소를 사용하여 문서를 검색하는 검색기입니다. 이는 벡터 저장소 클래스를 검색기 인터페이스에 맞게 래핑한 가벼운 구현체입니다.
유사도 검색과 MMR과 같은 벡터 저장소의 검색 메서드를 사용하여 저장된 텍스트를 검색합니다.

벡터 저장소를 구축하면 검색기를 쉽게 구축할 수 있습니다. 예를 들어 살펴보겠습니다.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../state_of_the_union.txt")
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 최대 한계 관련성 검색

기본적으로 벡터 저장소 검색기는 유사도 검색을 사용합니다. 기저 벡터 저장소가 최대 한계 관련성 검색을 지원하는 경우 검색 유형을 지정할 수 있습니다.

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 유사도 점수 임계값 검색

유사도 점수 임계값을 설정하고 해당 임계값 이상의 점수를 가진 문서만 반환하는 검색 방법을 사용할 수도 있습니다.

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 상위 k개 지정하기

검색 시 `k`와 같은 검색 매개변수를 지정할 수도 있습니다.

```python
retriever = db.as_retriever(search_kwargs={"k": 1})
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
len(docs)
```

```output
1
```
