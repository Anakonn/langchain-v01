---
translated: true
---

# 유사 검색(USearch)

>[유사 검색(USearch)](https://unum-cloud.github.io/usearch/)은 더 작고 빠른 단일 파일 벡터 검색 엔진입니다.

>유사 검색(USearch)의 기본 기능은 FAISS와 동일하며, 근사 최근접 이웃 검색을 조사해 본 적이 있다면 인터페이스가 익숙할 것입니다. FAISS는 고성능 벡터 검색 엔진의 널리 인정받는 표준입니다. 유사 검색(USearch)과 FAISS는 모두 동일한 HNSW 알고리즘을 사용하지만, 설계 원칙에서 크게 다릅니다. 유사 검색(USearch)은 성능을 희생하지 않고 컴팩트하고 광범위하게 호환되며, 사용자 정의 메트릭과 종속성이 더 적은 것에 주력합니다.

```python
%pip install --upgrade --quiet  usearch
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import USearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = USearch.from_documents(docs, embeddings)

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

## 유사도 검색 및 점수

`similarity_search_with_score` 메서드를 사용하면 문서뿐만 아니라 쿼리와의 거리 점수도 반환할 수 있습니다. 반환되는 거리 점수는 L2 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../extras/modules/state_of_the_union.txt'}),
 0.1845687)
```
