---
translated: true
---

# Infinispan

Infinispan은 오픈 소스 키-값 데이터 그리드로, 단일 노드와 분산 환경에서 모두 작동할 수 있습니다.

벡터 검색은 릴리스 15.x부터 지원됩니다.
자세한 내용은 [Infinispan Home](https://infinispan.org)을 참조하세요.

```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# 설정

이 데모를 실행하려면 인증이 필요 없는 실행 중인 Infinispan 인스턴스와 데이터 파일이 필요합니다.
다음 세 개의 셀에서 다음을 수행할 것입니다:
- 데이터 파일 다운로드
- 구성 생성
- Docker에서 Infinispan 실행

```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```

```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container:
    name: default
    transport:
      cluster: cluster
      stack: tcp
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0
    socket-bindings:
      default-interface: public
      port-offset: 0
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```

```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# 코드

## 임베딩 모델 선택

이 데모에서는 HuggingFace 임베딩 모델을 사용하고 있습니다.

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## Infinispan 캐시 설정

Infinispan은 매우 유연한 키-값 저장소로, 원시 비트와 복잡한 데이터 유형을 모두 저장할 수 있습니다.
사용자는 데이터 그리드 구성에 완전한 자유를 가지고 있지만, 단순한 데이터 유형의 경우 모든 것이 Python 레이어에 의해 자동으로 구성됩니다. 이 기능을 활용하여 애플리케이션에 집중할 수 있습니다.

## 데이터 준비

이 데모에서는 기본 구성을 활용하므로 텍스트, 메타데이터 및 벡터가 동일한 캐시에 저장됩니다. 그러나 다른 옵션도 가능합니다: 즉, 콘텐츠를 다른 곳에 저장하고 벡터 저장소에는 실제 콘텐츠에 대한 참조만 포함될 수 있습니다.

```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# 벡터 저장소 채우기

```python
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# 결과 문서를 출력하는 도우미 함수

기본적으로 InfinispanVS는 `Document.page_content`에 protobuf `text` 필드를, `metadata`에 나머지 protobuf 필드(벡터 제외)를 반환합니다. 이 동작은 설정 시 람다 함수를 통해 구성할 수 있습니다.

```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# 시도해보세요!

아래는 몇 가지 샘플 쿼리입니다.

```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```

```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```

```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```

```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```

```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```

```python
!docker rm --force infinispanvs-demo
```
