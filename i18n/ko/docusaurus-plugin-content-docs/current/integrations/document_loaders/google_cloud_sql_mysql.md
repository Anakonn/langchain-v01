---
translated: true
---

# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql)은 고성능, 원활한 통합, 인상적인 확장성을 제공하는 완전 관리형 관계형 데이터베이스 서비스입니다. [MySQL](https://cloud.google.com/sql/mysql), [PostgreSQL](https://cloud.google.com/sql/postgresql), [SQL Server](https://cloud.google.com/sql/sqlserver) 데이터베이스 엔진을 제공합니다. Cloud SQL의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 [Cloud SQL for MySQL](https://cloud.google.com/sql/mysql)을 사용하여 `MySQLLoader` 및 `MySQLDocumentSaver`를 사용하여 [Langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Cloud SQL Admin API 활성화](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Cloud SQL for MySQL 인스턴스 생성](https://cloud.google.com/sql/docs/mysql/create-instance)
* [Cloud SQL 데이터베이스 생성](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [데이터베이스에 IAM 데이터베이스 사용자 추가](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (선택 사항)

이 노트북의 런타임 환경에서 데이터베이스에 대한 액세스가 확인된 후 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-cloud-sql-mysql` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-cloud-sql-mysql
```

**Colab only**: 커널을 다시 시작하려면 다음 셀의 주석을 해제하거나 버튼을 사용하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud 프로젝트 설정

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:

* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스합니다.

- Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
- Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

## 기본 사용법

### MySQLEngine 연결 풀

MySQL 테이블에서 문서를 저장하거나 로드하기 전에 먼저 Cloud SQL 데이터베이스에 대한 연결 풀을 구성해야 합니다. `MySQLEngine`은 Cloud SQL 데이터베이스에 대한 연결 풀을 구성하여 애플리케이션에서 성공적인 연결을 가능하게 하고 업계 모범 사례를 따릅니다.

`MySQLEngine.from_instance()`를 사용하여 `MySQLEngine`을 만들려면 다음 4가지만 제공하면 됩니다:

1. `project_id`: Cloud SQL 인스턴스가 있는 Google Cloud 프로젝트의 프로젝트 ID.
2. `region`: Cloud SQL 인스턴스가 있는 리전.
3. `instance`: Cloud SQL 인스턴스의 이름.
4. `database`: Cloud SQL 인스턴스에 연결할 데이터베이스의 이름.

기본적으로 [IAM 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth)이 데이터베이스 인증 방법으로 사용됩니다. 이 라이브러리는 환경에서 소싱된 [Application Default Credentials(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)에 속한 IAM 주체를 사용합니다.

IAM 데이터베이스 인증에 대한 자세한 내용은 다음을 참조하세요:

* [IAM 데이터베이스 인증을 위한 인스턴스 구성](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM 데이터베이스 인증을 사용하여 사용자 관리](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

선택적으로 사용자 이름과 비밀번호를 사용하여 Cloud SQL 데이터베이스에 액세스하는 [기본 제공 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/built-in-authentication)도 사용할 수 있습니다. `MySQLEngine.from_instance()`에 `user` 및 `password` 인수를 제공하면 됩니다:

* `user`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 사용자
* `password`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 비밀번호

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### 테이블 초기화

`MySQLEngine.init_document_table(<table_name>)`을 통해 기본 스키마의 테이블을 초기화합니다. 테이블 열:

- page_content (type: text)
- langchain_metadata (type: JSON)

`overwrite_existing=True` 플래그는 기존 테이블을 새로 초기화된 테이블로 대체함을 의미합니다.

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### 문서 저장

`MySQLDocumentSaver.add_documents(<documents>)`를 사용하여 Langchain 문서를 저장합니다. `MySQLDocumentSaver` 클래스를 초기화하려면 2가지가 필요합니다:

1. `engine` - `MySQLEngine` 엔진의 인스턴스입니다.
2. `table_name` - Cloud SQL 데이터베이스 내에 langchain 문서를 저장할 테이블의 이름입니다.

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mysql import MySQLDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
saver = MySQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### 문서 로드하기

`MySQLLoader.load()` 또는 `MySQLLoader.lazy_load()`를 사용하여 langchain 문서를 로드합니다. `lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 제너레이터를 반환합니다. `MySQLLoader` 클래스를 초기화하려면 다음을 제공해야 합니다:

1. `engine` - `MySQLEngine` 엔진의 인스턴스입니다.
2. `table_name` - Cloud SQL 데이터베이스 내에 langchain 문서를 저장할 테이블의 이름입니다.

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### 쿼리를 통한 문서 로드

테이블에서 문서를 로드하는 것 외에도 SQL 쿼리에서 생성된 뷰에서 문서를 로드할 수 있습니다. 예를 들면:

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(
    engine=engine,
    query=f"select * from `{TABLE_NAME}` where JSON_EXTRACT(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

SQL 쿼리에서 생성된 뷰의 스키마는 기본 테이블과 다를 수 있습니다. 이러한 경우 MySQLLoader의 동작은 기본 스키마가 아닌 테이블에서 로드하는 것과 동일합니다. [문서 페이지 콘텐츠 및 메타데이터 사용자 정의 로드](#문서-페이지-콘텐츠-및-메타데이터-사용자-정의-로드)를 참조하세요.

### 문서 삭제

`MySQLDocumentSaver.delete(<documents>)`를 사용하여 MySQL 테이블에서 langchain 문서 목록을 삭제할 수 있습니다.

기본 스키마(page_content, langchain_metadata)가 있는 테이블의 경우 삭제 기준은 다음과 같습니다:

목록에 있는 `document`가 있는 경우 `row`를 삭제해야 합니다.

- `document.page_content`가 `row[page_content]`와 같음
- `document.metadata`가 `row[langchain_metadata]`와 같음

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 고급 사용법

### 사용자 정의 문서 페이지 콘텐츠 및 메타데이터 로드

먼저 기본 스키마가 아닌 예제 테이블을 준비하고 임의의 데이터로 채웁니다.

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS `{TABLE_NAME}`"))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            CREATE TABLE IF NOT EXISTS `{TABLE_NAME}`(
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(100) NOT NULL,
                variety VARCHAR(50),
                quantity_in_stock INT NOT NULL,
                price_per_unit DECIMAL(6,2) NOT NULL,
                organic TINYINT(1) NOT NULL
            )
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO `{TABLE_NAME}` (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

여전히 기본 매개변수로 `MySQLLoader`에서 langchain 문서를 로드하면 로드된 문서의 `page_content`가 테이블의 첫 번째 열이 되고 `metadata`는 다른 모든 열의 키-값 쌍으로 구성됩니다.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

`content_columns`와 `metadata_columns`를 설정하여 로드할 콘텐츠와 메타데이터를 지정할 수 있습니다.

1. `content_columns`: 문서의 `page_content`에 작성할 열입니다.
2. `metadata_columns`: 문서의 `metadata`에 작성할 열입니다.

예를 들어 여기서 `content_columns`의 열 값은 공백으로 구분된 문자열로 결합되어 로드된 문서의 `page_content`가 되며, `metadata`에는 `metadata_columns`에 지정된 열의 키-값 쌍만 포함됩니다.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### 사용자 정의 페이지 콘텐츠 및 메타데이터로 문서 저장

사용자 정의 메타데이터 필드가 있는 테이블에 langchain 문서를 저장하려면 먼저 `MySQLEngine.init_document_table()`을 통해 이러한 테이블을 만들고 원하는 `metadata_columns` 목록을 지정해야 합니다. 이 예에서 생성된 테이블에는 다음과 같은 테이블 열이 있습니다:

- description (type: text): 과일 설명을 저장합니다.
- fruit_name (type text): 과일 이름을 저장합니다.
- organic (type tinyint(1)): 과일이 유기농인지 여부를 나타냅니다.
- other_metadata (type: JSON): 과일의 기타 메타데이터 정보를 저장합니다.

다음 매개변수를 사용하여 `MySQLEngine.init_document_table()`을 호출하여 테이블을 만들 수 있습니다:

1. `table_name`: Cloud SQL 데이터베이스 내에 langchain 문서를 저장할 테이블의 이름입니다.
2. `metadata_columns`: 필요한 메타데이터 열을 나타내는 `sqlalchemy.Column` 목록입니다.
3. `content_column`: langchain 문서의 `page_content`를 저장할 열의 이름입니다. 기본값: `page_content`.
4. `metadata_json_column`: langchain 문서의 추가 `metadata`를 저장할 JSON 열의 이름입니다. 기본값: `langchain_metadata`.

```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

`MySQLDocumentSaver.add_documents(<documents>)`를 사용하여 문서를 저장합니다. 이 예에서 볼 수 있듯이,

- `document.page_content`는 `description` 열에 저장됩니다.
- `document.metadata.fruit_name`은 `fruit_name` 열에 저장됩니다.
- `document.metadata.organic`은 `organic` 열에 저장됩니다.
- `document.metadata.fruit_id`는 JSON 형식으로 `other_metadata` 열에 저장됩니다.

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MySQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f"select * from `{TABLE_NAME}`;"))
    print(result.keys())
    print(result.fetchall())
```

### 사용자 정의 페이지 콘텐츠 및 메타데이터로 문서 삭제

`MySQLDocumentSaver.delete(<documents>)`를 통해 사용자 정의 메타데이터 열이 있는 테이블에서 문서를 삭제할 수 있습니다. 삭제 기준은 다음과 같습니다:

목록에 있는 `document`가 있는 경우 `row`를 삭제해야 합니다.

- `document.page_content`가 `row[page_content]`와 같음
- `document.metadata`의 모든 메타데이터 필드 `k`에 대해
- `document.metadata[k]`가 `row[k]`와 같거나 `document.metadata[k]`가 `row[langchain_metadata][k]`와 같음
- `row`에 `document.metadata`에 없는 추가 메타데이터 필드가 없음

```python
loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
