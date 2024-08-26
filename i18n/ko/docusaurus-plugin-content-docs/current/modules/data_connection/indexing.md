---
translated: true
---

----------|-----------------|---------------|---------------------|-------------------------------------------|-----------|
| 없음      | ✅               | ✅             | ❌                   | ❌                                        | -         |
| 점진적    | ✅               | ✅             | ❌                   | ✅                                        | 지속적    |
| 전체      | ✅               | ❌             | ✅                   | ✅                                        | 인덱싱 완료 시 |

`없음`은 자동 정리를 수행하지 않으므로 사용자가 수동으로 오래된 콘텐츠를 정리해야 합니다.

`점진적`과 `전체`는 다음과 같은 자동 정리 기능을 제공합니다:

* 소스 문서 또는 파생 문서의 콘텐츠가 **변경**된 경우 `점진적` 또는 `전체` 모드 모두 이전 버전의 콘텐츠를 정리(삭제)합니다.
* 소스 문서가 **삭제**된 경우(현재 인덱싱되는 문서에 포함되지 않음) `전체` 정리 모드는 벡터 스토어에서 올바르게 삭제하지만 `점진적` 모드는 그렇지 않습니다.

콘텐츠가 변경되면(예: 소스 PDF 파일이 수정됨) 인덱싱 중에 새 버전과 이전 버전이 모두 사용자에게 반환되는 기간이 있습니다. 이는 새 콘텐츠가 작성된 후 이전 버전이 삭제되기 전에 발생합니다.

* `점진적` 인덱싱은 작성과 동시에 정리를 수행하므로 이 기간을 최소화할 수 있습니다.
* `전체` 모드는 모든 배치가 작성된 후 정리를 수행합니다.

## 요구 사항

1. 인덱싱 API와 독립적으로 사전에 콘텐츠가 채워진 저장소에서는 사용하지 마세요. 레코드 관리자는 이전에 삽입된 레코드를 알지 못합니다.
2. LangChain `vectorstore`에서만 작동하며, 다음 기능을 지원해야 합니다:
   * ID로 문서 추가(`add_documents` 메서드에 `ids` 인수)
   * ID로 삭제(`delete` 메서드에 `ids` 인수)

호환되는 벡터 스토어: `AnalyticDB`, `AstraDB`, `AzureCosmosDBVectorSearch`, `AzureSearch`, `AwaDB`, `Bagel`, `Cassandra`, `Chroma`, `CouchbaseVectorStore`, `DashVector`, `DatabricksVectorSearch`, `DeepLake`, `Dingo`, `ElasticVectorSearch`, `ElasticsearchStore`, `FAISS`, `HanaDB`, `LanceDB`, `Milvus`, `MyScale`, `OpenSearchVectorSearch`, `PGVector`, `Pinecone`, `Qdrant`, `Redis`, `Rockset`, `ScaNN`, `SupabaseVectorStore`, `SurrealDBStore`, `TimescaleVector`, `UpstashVectorStore`, `Vald`, `VDMS`, `Vearch`, `VespaStore`, `Weaviate`, `ZepVectorStore`, `TencentVectorDB`, `OpenSearchVectorSearch`, `Yellowbrick`.

## 주의 사항

레코드 관리자는 시간 기반 메커니즘을 사용하여 콘텐츠를 정리할 수 있는 시점을 결정합니다(`full` 또는 `incremental` 정리 모드 사용 시).

두 작업이 연속해서 실행되고 첫 번째 작업이 시계 시간 변경 전에 완료되면 두 번째 작업에서 콘텐츠를 정리하지 못할 수 있습니다.

실제 설정에서는 다음과 같은 이유로 이 문제가 발생할 가능성이 낮습니다:

1. RecordManager는 더 높은 해상도의 타임스탬프를 사용합니다.
2. 첫 번째와 두 번째 작업 실행 사이의 시간 간격이 짧으면 데이터가 변경될 가능성이 낮습니다.
3. 인덱싱 작업은 일반적으로 몇 ms 이상 걸립니다.

## 빠른 시작

```python
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

벡터 스토어를 초기화하고 임베딩을 설정합니다:

```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

적절한 네임스페이스로 레코드 관리자를 초기화합니다.

**제안:** 벡터 스토어와 벡터 스토어의 컬렉션 이름을 모두 고려하는 네임스페이스를 사용하세요. 예: 'redis/my_docs', 'chromadb/my_docs' 또는 'postgres/my_docs'.

```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

레코드 관리자를 사용하기 전에 스키마를 생성합니다.

다음 문서를 한국어로 번역합니다:

```python
record_manager.create_schema()
```

테스트 문서를 인덱싱해 봅시다:

```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

빈 벡터 저장소에 인덱싱하기:

```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### ``None`` 삭제 모드

이 모드는 콘텐츠의 이전 버전을 자동으로 정리하지 않지만, 콘텐츠 중복 제거는 여전히 처리합니다.

```python
_clear()
```

```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
_clear()
```

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

두 번째 시도에는 모든 콘텐츠가 건너뛰어집니다:

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

### ``"incremental"`` 삭제 모드

```python
_clear()
```

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

다시 인덱싱하면 두 문서 모두 **건너뛰어집니다** - 임베딩 작업도 건너뛰어집니다!

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

증분 인덱싱 모드에서 문서를 제공하지 않으면 아무것도 변경되지 않습니다.

```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

문서를 변경하면 새 버전이 작성되고 동일한 소스를 공유하는 모든 이전 버전이 삭제됩니다.

```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```

```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```

### ``"full"`` 삭제 모드

`full` 모드에서는 인덱싱 함수에 인덱싱해야 할 `full` 콘텐츠 유니버스를 전달해야 합니다.

인덱싱 함수에 전달되지 않고 벡터 저장소에 존재하는 문서는 모두 삭제됩니다!

이 동작은 소스 문서 삭제를 처리하는 데 유용합니다.

```python
_clear()
```

```python
all_docs = [doc1, doc2]
```

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

첫 번째 문서가 삭제되었다고 가정합시다:

```python
del all_docs[0]
```

```python
all_docs
```

```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```

전체 모드를 사용하면 삭제된 콘텐츠도 정리됩니다.

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```

## 소스

메타데이터 속성에는 `source`라는 필드가 포함되어 있습니다. 이 소스는 해당 문서와 관련된 *최종* 출처를 가리켜야 합니다.

예를 들어, 이 문서들이 어떤 상위 문서의 청크를 나타내는 경우, 두 문서 모두의 `source`는 동일해야 하며 상위 문서를 참조해야 합니다.

일반적으로 `source`를 항상 지정해야 합니다. `None`만 사용하는 경우는 `incremental` 모드를 **절대 사용하지 않을** 것이며 `source` 필드를 올바르게 지정할 수 없는 경우뿐입니다.

```python
from langchain_text_splitters import CharacterTextSplitter
```

```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```

```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```

```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```

```python
_clear()
```

```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

이렇게 하면 `doggy.txt` 소스와 관련된 이전 문서 버전이 삭제되고 새 버전으로 대체됩니다.

```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```

## 로더와 함께 사용하기

인덱싱은 문서의 반복 가능한 객체 또는 로더를 모두 허용합니다.

**주의:** 로더는 소스 키를 올바르게 설정해야 합니다.

```python
from langchain_community.document_loaders.base import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```

```python
_clear()
```

```python
loader = MyCustomLoader()
```

```python
loader.load()
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```
