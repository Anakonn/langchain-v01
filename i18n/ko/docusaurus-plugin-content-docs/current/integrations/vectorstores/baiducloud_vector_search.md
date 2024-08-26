---
translated: true
---

# Baidu Cloud ElasticSearch VectorSearch

>[Baidu Cloud VectorSearch](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc)는 100% 오픈 소스와 호환되는 완전 관리형 엔터프라이즈 수준의 분산 검색 및 분석 서비스입니다. Baidu Cloud VectorSearch는 구조화/비구조화 데이터에 대한 저비용, 고성능, 안정적인 검색 및 분석 플랫폼 수준의 제품 서비스를 제공합니다. 벡터 데이터베이스로서 다양한 인덱스 유형과 유사도 거리 방법을 지원합니다.

>`Baidu Cloud ElasticSearch`는 클러스터 권한을 자유롭게 구성할 수 있는 권한 관리 메커니즘을 제공하여 데이터 보안을 더욱 강화합니다.

이 노트북은 `Baidu Cloud ElasticSearch VectorStore`와 관련된 기능 사용 방법을 보여줍니다.
실행하려면 [Baidu Cloud ElasticSearch](https://cloud.baidu.com/product/bes.html) 인스턴스가 실행 중이어야 합니다:

[help document](https://cloud.baidu.com/doc/BES/s/8llyn0hh4)를 읽고 Baidu Cloud ElasticSearch 인스턴스를 빠르게 익히고 구성하세요.

인스턴스가 실행 중이면 다음 단계를 따라 문서를 분할하고, 임베딩을 가져오고, Baidu Cloud ElasticSearch 인스턴스에 연결하고, 문서를 인덱싱하고, 벡터 검색을 수행하세요.

먼저 다음 Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  elasticsearch == 7.11.0
```

먼저 `QianfanEmbeddings`를 사용하려면 Qianfan AK와 SK를 얻어야 합니다. Qianfan 관련 세부 사항은 [Baidu Qianfan Workshop](https://cloud.baidu.com/product/wenxinworkshop)을 참조하세요.

```python
import getpass
import os

os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

다음으로 문서를 분할하고 임베딩을 가져옵니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

그런 다음 Baidu ElasticeSearch에 접근할 수 있는 인스턴스를 만듭니다.

```python
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

마지막으로 데이터를 쿼리하고 검색합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

사용 중 문제가 발생하면 <liuboyao@baidu.com> 또는 <chenweixu01@baidu.com>에 문의해 주시기 바라며, 최선을 다해 지원하겠습니다.
