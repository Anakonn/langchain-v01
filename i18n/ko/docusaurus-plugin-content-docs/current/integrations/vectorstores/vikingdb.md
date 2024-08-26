---
translated: true
---

# viking DB

>[viking DB](https://www.volcengine.com/docs/6459/1163946)는 딥 신경망 및 기타 기계 학습(ML) 모델에 의해 생성된 대량의 임베딩 벡터를 저장, 인덱싱 및 관리하는 데이터베이스입니다.

이 노트북은 VikingDB 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

실행하려면 [viking DB 인스턴스를 실행 중](https://www.volcengine.com/docs/6459/1165058)이어야 합니다.

```python
!pip install --upgrade volcengine
```

VikingDBEmbeddings를 사용하려면 VikingDB API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
docs[0].page_content
```

### viking DB 컬렉션으로 데이터 구분하기

동일한 viking DB 인스턴스 내에서 다른 관련이 없는 문서를 다른 컬렉션에 저장할 수 있어 컨텍스트를 유지할 수 있습니다.

새 컬렉션을 만드는 방법은 다음과 같습니다.

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

그리고 이렇게 저장된 컬렉션을 검색할 수 있습니다.

```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

검색 후에는 일반적인 방식으로 쿼리할 수 있습니다.
