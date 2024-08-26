---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/)는 클라우드를 위해 구축된 실시간 검색 및 분석 데이터베이스입니다. Rockset은 벡터 임베딩을 효율적으로 저장하는 [Converged Index™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/)를 사용하여 대규모의 저지연 및 고동시성 검색 쿼리를 제공합니다. Rockset은 메타데이터 필터링을 완벽하게 지원하며 실시간 수집을 통해 끊임없이 업데이트되는 스트리밍 데이터를 처리합니다.

이 노트북은 LangChain에서 `Rockset`을 벡터 저장소로 사용하는 방법을 보여줍니다. 시작하기 전에 `Rockset` 계정과 API 키에 대한 액세스 권한이 있는지 확인하세요. [오늘 무료 체험을 시작하세요.](https://rockset.com/create/)

## 환경 설정

1. `Rockset` 콘솔을 사용하여 Write API를 소스로 하는 [컬렉션](https://rockset.com/docs/collections/)을 만드세요. 이 연습에서는 `langchain_demo`라는 이름의 컬렉션을 만듭니다.

    다음과 같은 [수집 변환](https://rockset.com/docs/ingest-transformation/)을 구성하여 임베딩 필드를 표시하고 성능 및 저장 최적화를 활용하세요:

   (이 예에서는 OpenAI `text-embedding-ada-002`를 사용했으며, #length_of_vector_embedding = 1536입니다)

```sql
SELECT _input.* EXCEPT(_meta),
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding
FROM _input
```

2. 컬렉션을 만든 후 콘솔을 사용하여 [API 키](https://rockset.com/docs/iam/#users-api-keys-and-roles)를 검색하세요. 이 노트북의 목적상 `Oregon(us-west-2)` 리전을 사용한다고 가정합니다.

3. [rockset-python-client](https://github.com/rockset/rockset-python-client)를 설치하여 LangChain이 `Rockset`과 직접 통신할 수 있도록 합니다.

```python
%pip install --upgrade --quiet  rockset
```

## LangChain 튜토리얼

자신의 Python 노트북에서 따라하며 Rockset에 벡터 임베딩을 생성하고 저장하세요.
Rockset을 사용하여 검색 쿼리와 유사한 문서를 검색하세요.

### 1. 주요 변수 정의

```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. 문서 준비

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. 문서 삽입

```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. 유사한 문서 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. 필터링을 통한 유사한 문서 검색

```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [선택 사항] 삽입된 문서 삭제

각 문서의 고유 ID를 알고 있어야 컬렉션에서 문서를 삭제할 수 있습니다.
`Rockset.add_texts()`로 문서를 삽입할 때 ID를 정의하세요. 그렇지 않으면 Rockset이 각 문서에 대해 고유 ID를 생성합니다. 어쨌든 `Rockset.add_texts()`는 삽입된 문서의 ID를 반환합니다.

이 문서를 삭제하려면 `Rockset.delete_texts()` 함수를 사용하면 됩니다.

```python
docsearch.delete_texts(ids)
```

## 요약

이 튜토리얼에서 우리는 `Rockset` 컬렉션을 성공적으로 만들고, OpenAI 임베딩을 사용하여 문서를 `삽입`했으며, 메타데이터 필터를 사용하거나 사용하지 않고 유사한 문서를 검색했습니다.

https://rockset.com/에서 이 분야의 향후 업데이트를 주시하세요.
