---
translated: true
---

# Alibaba Cloud OpenSearch

>[Alibaba Cloud Opensearch](https://www.alibabacloud.com/product/opensearch)는 지능형 검색 서비스를 개발하기 위한 원스톱 플랫폼입니다. `OpenSearch`는 `Alibaba`가 개발한 대규모 분산 검색 엔진을 기반으로 구축되었습니다. `OpenSearch`는 Alibaba 그룹 내에서 500개 이상의 비즈니스 사례와 수천 명의 Alibaba Cloud 고객을 지원하고 있습니다. `OpenSearch`는 전자상거래, O2O, 멀티미디어, 콘텐츠 산업, 커뮤니티 및 포럼, 기업의 빅데이터 쿼리 등 다양한 검색 시나리오에서 검색 서비스를 개발할 수 있습니다.

>`OpenSearch`는 사용자에게 높은 검색 효율성과 정확성을 제공하기 위해 고품질, 유지 관리가 용이하고 고성능의 지능형 검색 서비스를 개발할 수 있습니다.

>`OpenSearch`는 벡터 검색 기능을 제공합니다. 특정 시나리오, 특히 시험 문제 검색 및 이미지 검색 시나리오에서 벡터 검색 기능과 멀티모달 검색 기능을 함께 사용하여 검색 결과의 정확성을 높일 수 있습니다.

이 노트북은 `Alibaba Cloud OpenSearch Vector Search Edition`과 관련된 기능 사용 방법을 보여줍니다.

## 설정

### 인스턴스 구매 및 구성

[Alibaba Cloud](https://opensearch.console.aliyun.com)에서 OpenSearch Vector Search Edition을 구매하고 [도움말 문서](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO)에 따라 인스턴스를 구성하십시오.

실행하려면 [OpenSearch Vector Search Edition](https://opensearch.console.aliyun.com) 인스턴스가 실행 중이어야 합니다.

### Alibaba Cloud OpenSearch Vector Store 클래스

`AlibabaCloudOpenSearch` 클래스는 다음과 같은 기능을 지원합니다:
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`

[도움말 문서](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search)를 읽고 OpenSearch Vector Search Edition 인스턴스를 빠르게 익히고 구성하십시오.

사용 중 문제가 발생하면 xingshaomin.xsm@alibaba-inc.com으로 문의해 주시면 최선을 다해 지원하겠습니다.

인스턴스가 실행 중이면 다음 단계를 따라 문서를 분할하고, 임베딩을 가져오고, Alibaba Cloud OpenSearch 인스턴스에 연결하고, 문서를 인덱싱하고, 벡터 검색을 수행하십시오.

먼저 다음 Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  alibabacloud_ha3engine_vector
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 예시

```python
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

문서를 분할하고 임베딩을 가져옵니다.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

OpenSearch 설정을 생성합니다.

```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

설정으로 OpenSearch 액세스 인스턴스를 생성합니다.

```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

또는

```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

텍스트를 추가하고 인덱스를 구축합니다.

```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

데이터를 쿼리하고 검색합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

메타데이터와 함께 데이터를 쿼리하고 검색합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

사용 중 문제가 발생하면 xingshaomin.xsm@alibaba-inc.com으로 문의해 주시면 최선을 다해 지원하겠습니다.
