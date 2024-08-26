---
translated: true
---

# Baidu VectorDB

>[Baidu VectorDB](https://cloud.baidu.com/product/vdb.html)は、Baidu Intelligent Cloudによって慎重に開発され、完全に管理されている堅牢なエンタープライズレベルの分散データベースサービスです。優れた多次元ベクトルデータの保存、検索、分析機能を持っています。VectorDBの中核には、Baiduの独自の「Mochow」ベクトルデータベースカーネルが搭載されており、高パフォーマンス、可用性、セキュリティ、優れたスケーラビリティ、ユーザビリティを実現しています。

>このデータベースサービスは、さまざまなユースケースに対応するために、さまざまなインデックスタイプと類似性計算方法をサポートしています。VectorDBの際立った特徴は、最大100億ベクトルまでのベクトルスケールを管理しつつ、毎秒数百万クエリ(QPS)、ミリ秒レベルのクエリレイテンシーを実現する高いクエリパフォーマンスを持っていることです。

このノートブックでは、Baidu VectorDBの機能の使用方法を示します。

実行するには、[データベースインスタンス](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf)が必要です。

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
