---
translated: true
---

# DocArray HnswSearch

>[DocArrayHnswSearch](https://docs.docarray.org/user_guide/storing/index_hnswlib/)는 [Docarray](https://github.com/docarray/docarray)에서 제공하는 경량 문서 인덱스 구현으로, 완전히 로컬에서 실행되며 소규모에서 중규모 데이터 세트에 가장 적합합니다. [hnswlib](https://github.com/nmslib/hnswlib)에 디스크에 벡터를 저장하고 [SQLite](https://www.sqlite.org/index.html)에 다른 모든 데이터를 저장합니다.

이 노트북은 `DocArrayHnswSearch`와 관련된 기능 사용 방법을 보여줍니다.

## 설정

아래 셀의 주석을 해제하여 docarray를 설치하고 OpenAI API 키를 가져오거나 설정하세요.

```python
%pip install --upgrade --quiet  "docarray[hnswlib]"
```

```python
# Get an OpenAI token: https://platform.openai.com/account/api-keys

# import os
# from getpass import getpass

# OPENAI_API_KEY = getpass()

# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## DocArrayHnswSearch 사용

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import DocArrayHnswSearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = DocArrayHnswSearch.from_documents(
    docs, embeddings, work_dir="hnswlib_store/", n_dim=1536
)
```

### 유사도 검색

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

### 유사도 검색 및 점수

반환된 거리 점수는 코사인 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={}),
 0.36962226)
```

```python
import shutil

# delete the dir
shutil.rmtree("hnswlib_store")
```
