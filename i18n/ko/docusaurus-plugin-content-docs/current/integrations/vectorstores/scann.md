---
translated: true
---

# ScaNN

ScaNN (Scalable Nearest Neighbors)은 대규모 벡터 유사성 검색을 위한 효율적인 방법입니다.

ScaNN은 최대 내적 검색을 위한 검색 공간 가지치기와 양자화를 포함하며 유클리드 거리와 같은 다른 거리 함수도 지원합니다. 이 구현은 AVX2 지원 x86 프로세서에 최적화되어 있습니다. 자세한 내용은 [Google Research github](https://github.com/google-research/google-research/tree/master/scann)를 참조하세요.

## 설치

pip을 통해 ScaNN을 설치할 수 있습니다. 또는 [ScaNN 웹사이트](https://github.com/google-research/google-research/tree/master/scann#building-from-source)의 지침에 따라 소스에서 설치할 수 있습니다.

```python
%pip install --upgrade --quiet  scann
```

## 검색 데모

아래에서는 ScaNN을 Huggingface Embeddings와 함께 사용하는 방법을 보여줍니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import ScaNN
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)


embeddings = HuggingFaceEmbeddings()

db = ScaNN.from_documents(docs, embeddings)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## RetrievalQA 데모

다음으로 ScaNN을 Google PaLM API와 함께 사용하는 방법을 보여드립니다.

https://developers.generativeai.google/tutorials/setup에서 API 키를 얻을 수 있습니다.

```python
from langchain.chains import RetrievalQA
from langchain_community.chat_models import google_palm

palm_client = google_palm.ChatGooglePalm(google_api_key="YOUR_GOOGLE_PALM_API_KEY")

qa = RetrievalQA.from_chain_type(
    llm=palm_client,
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 10}),
)
```

```python
print(qa.run("What did the president say about Ketanji Brown Jackson?"))
```

```output
The president said that Ketanji Brown Jackson is one of our nation's top legal minds, who will continue Justice Breyer's legacy of excellence.
```

```python
print(qa.run("What did the president say about Michael Phelps?"))
```

```output
The president did not mention Michael Phelps in his speech.
```

## 로컬 검색 인덱스 저장 및 로드

```python
db.save_local("/tmp/db", "state_of_union")
restored_db = ScaNN.load_local("/tmp/db", embeddings, index_name="state_of_union")
```
