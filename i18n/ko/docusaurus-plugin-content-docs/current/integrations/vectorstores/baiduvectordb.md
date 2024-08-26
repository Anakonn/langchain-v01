---
translated: true
---

# Baidu VectorDB

>[Baidu VectorDB](https://cloud.baidu.com/product/vdb.html)는 Baidu Intelligent Cloud에서 정성스럽게 개발하고 완전히 관리하는 강력하고 엔터프라이즈 수준의 분산 데이터베이스 서비스입니다. 다차원 벡터 데이터를 저장, 검색 및 분석할 수 있는 탁월한 기능이 특징입니다. VectorDB의 핵심은 Baidu의 독자적인 "Mochow" 벡터 데이터베이스 커널로, 이는 높은 성능, 가용성 및 보안은 물론 놀라운 확장성과 사용자 친화성을 보장합니다.

>이 데이터베이스 서비스는 다양한 사용 사례에 맞는 다양한 인덱스 유형과 유사성 계산 방법을 지원합니다. VectorDB의 두드러진 특징은 최대 100억 개의 벡터를 관리할 수 있는 능력이며, 초당 수백만 개의 쿼리를 지원하는 뛰어난 쿼리 성능과 밀리초 수준의 쿼리 지연 시간을 제공합니다.

이 노트북은 Baidu VectorDB와 관련된 기능을 사용하는 방법을 보여줍니다.

실행하려면 [Database instance](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf)가 있어야 합니다.

```python
!pip3 install pymochow
```

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import BaiduVectorDB
from langchain_community.vectorstores.baiduvectordb import ConnectionParams
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = FakeEmbeddings(size=128)
```

```python
conn_params = ConnectionParams(
    endpoint="http://192.168.xx.xx:xxxx", account="root", api_key="****"
)

vector_db = BaiduVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, drop_old=True
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```python
vector_db = BaiduVectorDB(embeddings, conn_params)
vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```
