---
translated: true
---

# Vespa

>[Vespa](https://vespa.ai/)는 완전한 기능을 갖춘 검색 엔진이자 벡터 데이터베이스입니다. 동일한 쿼리에서 벡터 검색(ANN), 어휘 검색, 구조화된 데이터 검색을 지원합니다.

이 노트북은 LangChain 벡터 저장소로 `Vespa.ai`를 사용하는 방법을 보여줍니다.

벡터 저장소를 만들기 위해 `Vespa` 서비스에 연결하기 위해 [pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html)를 사용합니다.

```python
%pip install --upgrade --quiet  pyvespa
```

`pyvespa` 패키지를 사용하여 [Vespa Cloud 인스턴스](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)나 로컬 [Docker 인스턴스](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html)에 연결할 수 있습니다. 여기서는 새로운 Vespa 애플리케이션을 만들고 Docker를 사용하여 배포할 것입니다.

#### Vespa 애플리케이션 만들기

먼저 애플리케이션 패키지를 만들어야 합니다:

```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

이는 각 문서에 `text`와 `embedding` 두 개의 필드가 있는 스키마로 Vespa 애플리케이션을 설정합니다. `text` 필드는 효율적인 텍스트 검색을 위해 BM25 인덱스를 사용하도록 설정되어 있으며, 이후에 이를 사용하여 하이브리드 검색을 수행할 것입니다.

`embedding` 필드는 텍스트의 임베딩 표현을 저장하기 위해 길이 384의 벡터로 설정되어 있습니다. Vespa의 [Tensor Guide](https://docs.vespa.ai/en/tensor-user-guide.html)를 참조하세요.

마지막으로 문서 정렬 방식을 지시하는 [rank profile](https://docs.vespa.ai/en/ranking.html)을 추가합니다. 여기서는 [nearest neighbor search](https://docs.vespa.ai/en/nearest-neighbor-search.html)를 설정했습니다.

이제 이 애플리케이션을 로컬에 배포할 수 있습니다:

```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

이렇게 하면 `Vespa` 서비스가 배포되고 연결됩니다. 이미 Vespa 애플리케이션이 실행 중인 경우(예: 클라우드에서), PyVespa 애플리케이션을 참조하여 연결하는 방법을 확인하세요.

#### Vespa 벡터 저장소 만들기

이제 문서를 로드해 봅시다:

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

여기서는 텍스트를 임베딩 벡터로 변환하는 로컬 문장 임베더도 설정했습니다. OpenAI 임베딩을 사용할 수도 있지만, 벡터 길이를 `1536`으로 업데이트해야 합니다.

이를 Vespa에 제공하려면 벡터 저장소가 Vespa 애플리케이션의 필드에 어떻게 매핑되어야 하는지 구성해야 합니다. 그런 다음 이 문서 집합에서 직접 벡터 저장소를 만듭니다:

```python
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

이렇게 하면 Vespa 벡터 저장소가 생성되고 해당 문서 집합이 데이터베이스에 삽입됩니다. 벡터 저장소는 각 문서에 대해 위에서 제공한 임베딩 함수를 호출하고 데이터베이스에 삽입하는 작업을 처리합니다.

이제 벡터 저장소를 쿼리할 수 있습니다:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

이렇게 하면 위에서 제공한 임베딩 함수를 사용하여 쿼리에 대한 표현을 만들고 이를 사용하여 Vespa를 검색합니다. 이때 `default` 랭킹 함수를 사용하게 되는데, 이는 위에서 애플리케이션 패키지에서 설정했습니다. `ranking` 인수를 `similarity_search`에 사용하여 사용할 랭킹 함수를 지정할 수 있습니다.

자세한 내용은 [pyvespa 문서](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)를 참조하세요.

이것이 LangChain에서 Vespa 저장소를 사용하는 기본적인 방법입니다. 이제 결과를 반환하고 LangChain에서 계속 사용할 수 있습니다.

#### 문서 업데이트

`from_documents`를 호출하는 대신 벡터 저장소를 직접 만들고 `add_texts`를 호출할 수 있습니다. 이를 통해 문서를 업데이트할 수도 있습니다:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

그러나 `pyvespa` 라이브러리에는 Vespa의 콘텐츠를 직접 조작할 수 있는 메서드가 포함되어 있습니다.

#### 문서 삭제

`delete` 함수를 사용하여 문서를 삭제할 수 있습니다:

```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

마찬가지로 `pyvespa` 연결에는 문서를 삭제하는 메서드가 포함되어 있습니다.

### 점수와 함께 반환

`similarity_search` 메서드는 관련성 순으로 문서만 반환합니다. 실제 점수를 가져오려면:

```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

이는 `"all-MiniLM-L6-v2"` 임베딩 모델과 코사인 거리 함수(애플리케이션 함수의 `angular` 인수로 지정)를 사용한 결과입니다.

다른 임베딩 함수에는 다른 거리 함수가 필요하며, Vespa는 문서 정렬 시 사용할 거리 함수를 알아야 합니다. 자세한 내용은 [거리 함수 문서](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric)를 참조하세요.

### 리트리버로 사용

이 벡터 저장소를 [LangChain 리트리버](/docs/modules/data_connection/retrievers/)로 사용하려면 `as_retriever` 함수를 호출하면 됩니다. 이는 표준 벡터 저장소 메서드입니다:

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

이를 통해 벡터 저장소에서 더 일반적이고 비구조화된 검색을 수행할 수 있습니다.

### 메타데이터

지금까지의 예에서는 텍스트와 해당 텍스트의 임베딩만 사용했습니다. 문서에는 일반적으로 추가 정보(메타데이터라고 함)가 포함되어 있습니다.

Vespa는 애플리케이션 패키지에 추가하여 다양한 유형의 많은 필드를 포함할 수 있습니다.

```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```
문서에 메타데이터 필드를 추가할 수 있습니다:
</codeblock 11>

```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```
그리고 이러한 필드에 대해 Vespa 벡터 저장소에 알려줍니다:
</codeblock 12>

```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```
이제 이 문서를 검색할 때 이러한 필드가 반환됩니다.
또한 이러한 필드로 필터링할 수 있습니다:
</codeblock 13>

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```
### 사용자 정의 쿼리

유사성 검색의 기본 동작이 요구 사항에 맞지 않는 경우 항상 자체 쿼리를 제공할 수 있습니다. 따라서 벡터 저장소에 모든 구성을 제공할 필요 없이 직접 작성할 수 있습니다.

먼저 우리의 애플리케이션에 BM25 랭킹 함수를 추가해 보겠습니다:
</codeblock 14>

```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```
그런 다음 BM25를 기반으로 일반 텍스트 검색을 수행하려면:
</codeblock 15>

```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```
Vespa의 강력한 검색 및 쿼리 기능을 사용자 정의 쿼리를 통해 사용할 수 있습니다. 자세한 내용은 Vespa [Query API](https://docs.vespa.ai/en/query-api.html) 문서를 참조하십시오.

### 하이브리드 검색

하이브리드 검색은 BM25와 같은 고전적인 용어 기반 검색과 벡터 검색을 모두 사용하고 결과를 결합하는 것을 의미합니다. Vespa에서 하이브리드 검색을 위한 새로운 랭크 프로파일을 만들어야 합니다:
</codeblock 16>

```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```
여기서 각 문서의 점수는 BM25 점수와 거리 점수의 조합으로 계산됩니다. 사용자 정의 쿼리를 사용하여 쿼리할 수 있습니다:
</codeblock 17>

```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```
### Vespa의 기본 임베딩

지금까지 Python에서 임베딩 함수를 사용했습니다. Vespa는 기본적으로 임베딩 기능을 지원하므로 이 계산을 Vespa로 위임할 수 있습니다. 하나의 이점은 대규모 컬렉션의 경우 GPU를 사용하여 문서를 임베딩할 수 있다는 것입니다.

[Vespa 임베딩](https://docs.vespa.ai/en/embedding.html)에 대한 자세한 정보를 참조하십시오.

먼저 애플리케이션 패키지를 수정해야 합니다:
</codeblock 18>

```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```
임베딩 문서에 임베더 모델과 토크나이저를 추가하는 방법에 대해 설명합니다. `hfembedding` 필드에는 `hf-embedder`를 사용하여 임베딩하는 방법에 대한 지침이 포함되어 있습니다.

이제 사용자 정의 쿼리를 사용하여 쿼리할 수 있습니다:
</codeblock 19>

```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```
여기서 쿼리에는 문서와 동일한 모델을 사용하여 쿼리를 임베딩하는 `embed` 지침이 포함되어 있습니다.

### 근사 최근접 이웃

위의 모든 예에서 우리는 정확한 최근접 이웃을 사용했습니다. 그러나 문서 컬렉션이 크면 모든 문서를 스캔하여 최고의 일치 항목을 찾는 것은 실행 가능하지 않습니다. 이를 방지하기 위해 [근사 최근접 이웃](https://docs.vespa.ai/en/approximate-nn-hnsw.html)을 사용할 수 있습니다.

먼저 임베딩 필드를 변경하여 HNSW 인덱스를 만들 수 있습니다:
</codeblock 20>

```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```
이렇게 하면 효율적인 검색을 위해 임베딩 데이터에 HNSW 인덱스가 생성됩니다. 이렇게 설정하면 `approximate` 인수를 `True`로 설정하여 ANN을 사용하여 쉽게 검색할 수 있습니다:
</codeblock 21>

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```
이것은 LangChain의 Vespa 벡터 저장소에서 대부분의 기능을 다룹니다.
</codeblock 22>
