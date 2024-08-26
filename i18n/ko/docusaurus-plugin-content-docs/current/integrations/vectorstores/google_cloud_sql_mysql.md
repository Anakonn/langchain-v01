---
translated: true
---

# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql)은 고성능, 원활한 통합, 인상적인 확장성을 제공하는 완전 관리형 관계형 데이터베이스 서비스입니다. PostgreSQL, MySQL, SQL Server 데이터베이스 엔진을 제공합니다. Cloud SQL의 LangChain 통합을 활용하여 AI 기반 경험을 구축하도록 데이터베이스 애플리케이션을 확장할 수 있습니다.

이 노트북에서는 `MySQLVectorStore` 클래스를 사용하여 벡터 임베딩을 저장하는 방법을 설명합니다.

[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

 * [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Cloud SQL 인스턴스 생성](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance) (버전은 **8.0.36** 이상이어야 하며 **cloudsql_vector** 데이터베이스 플래그가 "On"으로 구성되어야 함)
 * [Cloud SQL 데이터베이스 생성](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [데이터베이스에 사용자 추가](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 라이브러리 설치

`langchain-google-cloud-sql-mysql` 통합 라이브러리와 `langchain-google-vertexai` 임베딩 서비스 라이브러리를 설치합니다.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Colab 전용:** 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench에서는 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스할 수 있습니다.

* Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
* Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloud 프로젝트 설정

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정합니다.

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

## 기본 사용법

### Cloud SQL 데이터베이스 값 설정

[Cloud SQL 인스턴스 페이지](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)에서 데이터베이스 값을 찾으세요.

**참고:** MySQL 벡터 지원은 **>= 8.0.36** 버전의 MySQL 인스턴스에서만 사용할 수 있습니다.

기존 인스턴스의 경우 [자체 서비스 유지 관리 업데이트](https://cloud.google.com/sql/docs/mysql/self-service-maintenance)를 수행하여 유지 관리 버전을 **MYSQL_8_0_36.R20240401.03_00** 이상으로 업데이트해야 할 수 있습니다. 업데이트 후 [데이터베이스 플래그를 구성](https://cloud.google.com/sql/docs/mysql/flags)하여 새로운 **cloudsql_vector** 플래그를 "On"으로 설정하세요.

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### MySQLEngine 연결 풀

Cloud SQL을 벡터 저장소로 사용하기 위한 요구 사항 및 인수 중 하나는 `MySQLEngine` 객체입니다. `MySQLEngine`은 Cloud SQL 데이터베이스에 대한 연결 풀을 구성하여 애플리케이션에서 성공적인 연결을 가능하게 하고 업계 모범 사례를 따릅니다.

`MySQLEngine.from_instance()`를 사용하여 `MySQLEngine`을 만들려면 다음 4가지만 제공하면 됩니다:

1. `project_id`: Cloud SQL 인스턴스가 있는 Google Cloud 프로젝트의 프로젝트 ID.
1. `region`: Cloud SQL 인스턴스가 있는 리전.
1. `instance`: Cloud SQL 인스턴스의 이름.
1. `database`: Cloud SQL 인스턴스에 연결할 데이터베이스의 이름.

기본적으로 [IAM 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth)이 데이터베이스 인증 방법으로 사용됩니다. 이 라이브러리는 환경에서 소싱된 [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)에 속한 IAM 주체를 사용합니다.

IAM 데이터베이스 인증에 대한 자세한 내용은 다음을 참조하세요:

* [IAM 데이터베이스 인증을 위한 인스턴스 구성](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM 데이터베이스 인증을 사용하여 사용자 관리](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

선택적으로 Cloud SQL 데이터베이스에 액세스하기 위한 [기본 제공 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/built-in-authentication)을 사용할 수도 있습니다. `MySQLEngine.from_instance()`에 선택적 `user` 및 `password` 인수를 제공하면 됩니다.

* `user` : 내장 데이터베이스 인증 및 로그인에 사용할 데이터베이스 사용자
* `password` : 내장 데이터베이스 인증 및 로그인에 사용할 데이터베이스 비밀번호

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### 테이블 초기화

`MySQLVectorStore` 클래스에는 데이터베이스 테이블이 필요합니다. `MySQLEngine` 클래스에는 `init_vectorstore_table()` 헬퍼 메서드가 있어 적절한 스키마로 테이블을 생성할 수 있습니다.

```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 임베딩 클래스 인스턴스 생성

[LangChain 임베딩 모델](/docs/integrations/text_embedding/)을 사용할 수 있습니다.
`VertexAIEmbeddings`를 사용하려면 Vertex AI API를 활성화해야 할 수 있습니다.

프로덕션에서는 임베딩 모델의 버전을 고정하는 것이 좋습니다. [Text embeddings models](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings)에 대해 자세히 알아보세요.

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### 기본 MySQLVectorStore 초기화

`MySQLVectorStore` 클래스를 초기화하려면 3가지만 제공하면 됩니다:

1. `engine` - `MySQLEngine` 엔진의 인스턴스.
1. `embedding_service` - LangChain 임베딩 모델의 인스턴스.
1. `table_name` : Cloud SQL 데이터베이스 내의 벡터 스토어로 사용할 테이블 이름.

```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### 텍스트 추가

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### 텍스트 삭제

ID로 벡터 스토어에서 벡터를 삭제합니다.

```python
store.delete([ids[1]])
```

### 문서 검색

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```

```output
Pineapple
```

### 벡터로 문서 검색

`similarity_search_by_vector`를 사용하면 문자열 대신 임베딩 벡터로 유사한 문서를 검색할 수 있습니다.

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```

### 인덱스 추가

벡터 검색 쿼리 속도를 높이려면 벡터 인덱스를 적용하세요. [MySQL 벡터 인덱스](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py)에 대해 자세히 알아보세요.

**참고:** IAM 데이터베이스 인증(기본 사용)의 경우 특권 데이터베이스 사용자가 다음 권한을 IAM 데이터베이스 사용자에게 부여해야 벡터 인덱스를 완전히 제어할 수 있습니다.

```sql
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```

```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### 인덱스 제거

```python
store.drop_vector_index()
```

## 고급 사용

### 사용자 정의 메타데이터를 사용하는 MySQLVectorStore 생성

벡터 스토어는 관계형 데이터를 활용하여 유사성 검색을 필터링할 수 있습니다.

사용자 정의 메타데이터 열을 사용하여 테이블과 `MySQLVectorStore` 인스턴스를 생성합니다.

```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### 메타데이터 필터를 사용하여 문서 검색

문서를 작업하기 전에 문서를 좁히는 것이 도움이 될 수 있습니다.

예를 들어 `filter` 인수를 사용하여 메타데이터로 문서를 필터링할 수 있습니다.

```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```
