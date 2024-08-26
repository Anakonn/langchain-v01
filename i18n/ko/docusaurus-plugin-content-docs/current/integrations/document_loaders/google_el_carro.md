---
translated: true
---

# Google El Carro for Oracle Workloads

> Google [El Carro Oracle Operator](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)는 Oracle 데이터베이스를 포터블하고, 오픈 소스이며, 커뮤니티 주도의 공급업체 종속성이 없는 컨테이너 오케스트레이션 시스템인 Kubernetes에서 실행할 수 있는 방법을 제공합니다. El Carro는 포괄적이고 일관된 구성 및 배포와 실시간 운영 및 모니터링을 위한 강력한 선언적 API를 제공합니다.
El Carro Langchain 통합을 활용하여 Oracle 데이터베이스의 기능을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 가이드에서는 `ElCarroLoader`와 `ElCarroDocumentSaver`를 사용하여 [langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 설명합니다. 이 통합은 Oracle 데이터베이스가 어디에서 실행되는지에 관계없이 작동합니다.

[GitHub](https://github.com/googleapis/langchain-google-el-carro-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

[Getting Started](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started) 섹션을 완료하여 El Carro Oracle 데이터베이스를 설정하세요.

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-el-carro` 패키지에 있으므로 설치해야 합니다.

```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## 기본 사용법

### Oracle 데이터베이스 연결 설정

다음 변수를 사용자의 Oracle 데이터베이스 연결 세부 정보로 채우세요.

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

El Carro를 사용하는 경우 호스트 이름과 포트 값은 El Carro Kubernetes 인스턴스의 상태에서 찾을 수 있습니다.
PDB에 대해 생성한 사용자 비밀번호를 사용하세요.

예제 출력:

```output
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### ElCarroEngine 연결 풀

`ElCarroEngine`은 Oracle 데이터베이스에 대한 연결 풀을 구성하여 애플리케이션에서 성공적인 연결을 가능하게 하고 업계 모범 사례를 따릅니다.

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### 테이블 초기화

`elcarro_engine.init_document_table(<table_name>)`을 통해 기본 스키마의 테이블을 초기화합니다. 테이블 열:

- page_content (type: text)
- langchain_metadata (type: JSON)

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### 문서 저장

`ElCarroDocumentSaver.add_documents(<documents>)`를 사용하여 langchain 문서를 저장합니다.
`ElCarroDocumentSaver` 클래스를 초기화하려면 다음 두 가지가 필요합니다:

1. `elcarro_engine` - `ElCarroEngine` 엔진의 인스턴스.
2. `table_name` - langchain 문서를 저장할 Oracle 데이터베이스 내 테이블의 이름.

```python
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### 문서 로드

`ElCarroLoader.load()`또는 `ElCarroLoader.lazy_load()`를 사용하여 langchain 문서를 로드합니다.
`lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 생성기를 반환합니다.
`ElCarroLoader` 클래스를 초기화하려면 다음이 필요합니다:

1. `elcarro_engine` - `ElCarroEngine` 엔진의 인스턴스.
2. `table_name` - langchain 문서를 저장할 Oracle 데이터베이스 내 테이블의 이름.

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### 쿼리를 통한 문서 로드

테이블에서 문서를 로드하는 것 외에도 SQL 쿼리에서 생성된 뷰에서 문서를 로드할 수 있습니다. 예를 들어:

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

SQL 쿼리에서 생성된 뷰는 기본 테이블 스키마와 다를 수 있습니다. 이러한 경우 ElCarroLoader의 동작은 사용자 정의 문서 페이지 콘텐츠 및 메타데이터를 로드하는 것과 동일합니다. [문서 페이지 콘텐츠 및 메타데이터 사용자 정의 로드](#문서-페이지-콘텐츠-및-메타데이터-사용자-정의-로드) 섹션을 참조하세요.

### 문서 삭제

`ElCarroDocumentSaver.delete(<documents>)`를 사용하여 Oracle 테이블에서 langchain 문서 목록을 삭제합니다.

기본 스키마(page_content, langchain_metadata)가 있는 테이블의 경우 삭제 기준은 다음과 같습니다:

`row`는 목록에 있는 `document`가 다음과 같은 경우에 삭제되어야 합니다.

- `document.page_content`가 `row[page_content]`와 같음
- `document.metadata`가 `row[langchain_metadata]`와 같음

```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 고급 사용법

### 사용자 정의 문서 페이지 콘텐츠 및 메타데이터 로드

먼저 기본이 아닌 스키마를 가진 예제 테이블을 준비하고 임의의 데이터로 채웁니다.

```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

여전히 `ElCarroLoader`의 기본 매개변수를 사용하여 이 예제 테이블에서 langchain 문서를 로드하면 로드된 문서의 `page_content`는 테이블의 첫 번째 열이 되고 `metadata`는 다른 모든 열의 키-값 쌍으로 구성됩니다.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

`ElCarroLoader`를 초기화할 때 `content_columns`와 `metadata_columns`를 설정하여 로드할 콘텐츠와 메타데이터를 지정할 수 있습니다.

1. `content_columns`: 문서의 `page_content`에 작성할 열.
2. `metadata_columns`: 문서의 `metadata`에 작성할 열.

여기서 `content_columns`의 열 값들은 공백으로 구분된 문자열로 결합되어 로드된 문서의 `page_content`가 되며, `metadata_columns`에 지정된 열만이 로드된 문서의 `metadata`에 포함됩니다.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### 사용자 정의 페이지 콘텐츠 및 메타데이터로 문서 저장하기

LangChain 문서를 사용자 정의 메타데이터 필드가 있는 테이블에 저장하려면 먼저 `ElCarroEngine.init_document_table()`을 통해 이러한 테이블을 생성하고 `metadata_columns`로 지정할 열 목록을 지정해야 합니다. 이 예에서 생성된 테이블에는 다음과 같은 테이블 열이 있습니다:

- content (type: text): 과일 설명을 저장합니다.
- type (type VARCHAR2(200)): 과일 유형을 저장합니다.
- weight (type INT): 과일 무게를 저장합니다.
- extra_json_metadata (type: JSON): 과일의 기타 메타데이터 정보를 저장합니다.

`elcarro_engine.init_document_table()`에 다음 매개변수를 사용할 수 있습니다:

1. `table_name`: Oracle 데이터베이스 내에 LangChain 문서를 저장할 테이블의 이름입니다.
2. `metadata_columns`: 필요한 메타데이터 열을 나타내는 `sqlalchemy.Column` 목록입니다.
3. `content_column`: LangChain 문서의 `page_content`를 저장할 열 이름입니다. 기본값: `"page_content", "VARCHAR2(4000)"`
4. `metadata_json_column`: 추가 JSON `metadata`를 저장할 열 이름입니다. 기본값: `"langchain_metadata", "VARCHAR2(4000)"`

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

`ElCarroDocumentSaver.add_documents(<documents>)`를 사용하여 문서를 저장할 수 있습니다. 이 예에서는

- `document.page_content`가 `content` 열에 저장됩니다.
- `document.metadata.type`이 `type` 열에 저장됩니다.
- `document.metadata.weight`가 `weight` 열에 저장됩니다.
- `document.metadata.organic`이 JSON 형식으로 `extra_json_metadata` 열에 저장됩니다.

```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### 사용자 정의 페이지 콘텐츠 및 메타데이터로 문서 삭제하기

`ElCarroDocumentSaver.delete(<documents>)`를 사용하여 사용자 정의 메타데이터 열이 있는 테이블에서 문서를 삭제할 수 있습니다. 삭제 기준은 다음과 같습니다:

`row`는 다음과 같은 `document`가 있는 경우 삭제되어야 합니다:

- `document.page_content`가 `row[page_content]`와 같습니다.
- `document.metadata`의 모든 메타데이터 필드 `k`에 대해
    - `document.metadata[k]`가 `row[k]`와 같거나 `document.metadata[k]`가 `row[langchain_metadata][k]`와 같습니다.
- `row`에 `document.metadata`에 없는 추가 메타데이터 필드가 없습니다.

```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## 더 많은 예제

[demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py) 및 [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py)를 참조하세요.
