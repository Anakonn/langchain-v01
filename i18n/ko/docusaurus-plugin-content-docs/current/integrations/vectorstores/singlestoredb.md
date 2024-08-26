---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/)는 클라우드와 온-프레미스 환경 모두에서 뛰어난 성능을 발휘하도록 설계된 강력하고 고성능의 분산 SQL 데이터베이스 솔루션입니다. 다양한 기능을 갖추고 있으며, 원활한 배포 옵션과 탁월한 성능을 제공합니다.

SingleStoreDB의 두드러진 특징은 벡터 저장 및 연산에 대한 고급 지원으로, 텍스트 유사성 매칭과 같은 복잡한 AI 기능이 필요한 애플리케이션에 이상적인 선택이 됩니다. [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html)와 [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html) 같은 내장 벡터 함수를 통해 SingleStoreDB는 개발자들이 복잡한 알고리즘을 효율적으로 구현할 수 있게 해줍니다.

SingleStoreDB 내에서 벡터 데이터를 활용하고자 하는 개발자들을 위해 [벡터 데이터 활용](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html)에 대한 포괄적인 튜토리얼이 제공됩니다. 이 튜토리얼은 SingleStoreDB의 벡터 저장소에 대해 자세히 다루며, 벡터 유사성 기반 검색 기능을 소개합니다. 벡터 인덱스를 활용하여 쿼리를 빠르게 실행할 수 있어 관련 데이터를 신속하게 검색할 수 있습니다.

또한 SingleStoreDB의 벡터 저장소는 [Lucene 기반의 전문 검색](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/)과 원활하게 통합되어, 강력한 텍스트 유사성 검색을 가능하게 합니다. 사용자는 문서 메타데이터 객체의 선택된 필드를 기반으로 검색 결과를 필터링할 수 있어 쿼리 정확도를 높일 수 있습니다.

SingleStoreDB의 차별점은 벡터와 전문 검색을 다양한 방식으로 결합할 수 있는 기능입니다. 텍스트 또는 벡터 유사성으로 사전 필터링하고 가장 관련성 있는 데이터를 선택하거나, 가중 합계 접근 방식을 사용하여 최종 유사성 점수를 계산할 수 있습니다. 개발자들은 다양한 옵션을 활용할 수 있습니다.

요약하면, SingleStoreDB는 벡터 데이터 관리 및 쿼리를 위한 종합적인 솔루션을 제공하며, AI 기반 애플리케이션에 탁월한 성능과 유연성을 제공합니다.

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

```python
# loading docs
# we will use some artificial data for this example
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

데이터베이스에 [연결](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html)하는 여러 가지 방법이 있습니다. 환경 변수를 설정하거나 `SingleStoreDB` 생성자에 매개변수를 전달할 수 있습니다. 또한 `from_documents` 및 `from_texts` 메서드에 이러한 매개변수를 제공할 수 있습니다.

```python
# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)
```

```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # Find documents that correspond to the query
print(docs[0].page_content)
```

SingleStoreDB는 메타데이터 필드를 기반으로 검색 결과를 사전 필터링하여 검색 기능을 향상시킵니다. 이 기능을 통해 개발자와 데이터 분석가는 쿼리를 세부적으로 조정하여 검색 결과를 사용자 요구사항에 맞게 정밀하게 조정할 수 있습니다. 특정 메타데이터 속성을 사용하여 검색 결과를 필터링하면 쿼리 범위를 좁혀 관련 데이터 하위 집합에 초점을 맞출 수 있습니다.

```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # Find documents that correspond to the query and has category "snow"
print(docs[0].page_content)
```

SingleStore DB 버전 8.5 이상에서 [ANN 벡터 인덱스](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/)를 활용하여 검색 효율을 높일 수 있습니다. 벡터 저장소 객체 생성 시 `use_vector_index=True`를 설정하면 이 기능을 활성화할 수 있습니다. 또한 벡터 차원이 기본 OpenAI 임베딩 크기 1536과 다른 경우 `vector_size` 매개변수를 적절히 지정해야 합니다.

SingleStoreDB는 다양한 검색 전략을 제공하며, 각각은 특정 사용 사례와 사용자 선호도에 맞춰 세심하게 설계되었습니다. 기본 `VECTOR_ONLY` 전략은 `dot_product` 또는 `euclidean_distance` 같은 벡터 연산을 사용하여 벡터 간 유사성 점수를 직접 계산합니다. `TEXT_ONLY`는 텍스트 중심 애플리케이션에 유리한 Lucene 기반 전문 검색을 활용합니다. 균형 잡힌 접근법을 원하는 사용자를 위해 `FILTER_BY_TEXT`는 먼저 텍스트 유사성을 기반으로 결과를 정제한 후 벡터 비교를 수행하고, `FILTER_BY_VECTOR`는 벡터 유사성을 우선하여 필터링한 후 텍스트 유사성을 평가합니다. 주목할 점은 `FILTER_BY_TEXT`와 `FILTER_BY_VECTOR` 모두 전문 검색 인덱스가 필요합니다. `WEIGHTED_SUM` 전략은 벡터와 텍스트 유사성을 가중치로 계산하여 최종 유사성 점수를 산출하며, 이 역시 전문 검색 인덱스가 필요합니다. 이러한 다양한 전략을 통해 사용자는 고유한 요구사항에 맞게 검색을 세부적으로 조정할 수 있어 효율적이고 정확한 데이터 검색 및 분석이 가능합니다. 또한 `FILTER_BY_TEXT`, `FILTER_BY_VECTOR`, `WEIGHTED_SUM` 전략과 같은 SingleStoreDB의 하이브리드 접근법은 벡터와 텍스트 기반 검색을 원활하게 결합하여 효율성과 정확성을 극대화하며, 다양한 애플리케이션에 대한 플랫폼 기능을 충분히 활용할 수 있게 해줍니다.

```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # Use dot product for similarity search
    use_vector_index=True,  # Use vector index for faster search
    use_full_text_search=True,  # Use full text index
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## 멀티모달 예시: CLIP 및 OpenClip 임베딩 활용

멀티모달 데이터 분석 분야에서 이미지와 텍스트와 같은 다양한 정보 유형의 통합이 점점 더 중요해지고 있습니다. 이러한 통합을 가능하게 하는 강력한 도구 중 하나가 [CLIP](https://openai.com/research/clip)입니다. CLIP은 이미지와 텍스트를 공유 의미 공간에 임베딩할 수 있는 최신 모델로, 유사성 검색을 통해 다양한 모달리티 간 관련 콘텐츠를 검색할 수 있게 해줍니다.

---
title: 멀티모달 데이터 분석을 위한 OpenClip 활용
---

예를 들어, 멀티모달 데이터를 효과적으로 분석하고자 하는 응용 시나리오를 살펴보겠습니다. 이 예에서는 [OpenClip 멀티모달 임베딩](/docs/integrations/text_embedding/open_clip)의 기능을 활용합니다. OpenClip은 CLIP 프레임워크를 기반으로 합니다. OpenClip을 사용하면 텍스트 설명과 해당 이미지를 원활하게 임베딩할 수 있어, 포괄적인 분석 및 검색 작업을 수행할 수 있습니다. 텍스트 쿼리를 기반으로 시각적으로 유사한 이미지를 식별하거나 특정 시각 콘텐츠와 관련된 관련 텍스트 구절을 찾는 등의 작업이 가능합니다. OpenClip을 통해 사용자는 멀티모달 데이터에서 놀라운 효율성과 정확성으로 통찰력을 탐색하고 추출할 수 있습니다.

```python
%pip install -U langchain openai singlestoredb langchain-experimental # (newest versions required for multi-modal)
```

```python
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# Add images
docsearch.add_images(uris=image_uris)
```
