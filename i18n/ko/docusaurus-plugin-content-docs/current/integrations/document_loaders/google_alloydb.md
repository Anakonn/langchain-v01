---
translated: true
---

# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb)는 고성능, 원활한 통합 및 인상적인 확장성을 제공하는 완전 관리형 관계형 데이터베이스 서비스입니다. AlloyDB는 PostgreSQL과 100% 호환됩니다. AlloyDB의 Langchain 통합을 활용하여 AI 기반 경험을 구축하도록 데이터베이스 애플리케이션을 확장하세요.

이 노트북에서는 `AlloyDB for PostgreSQL`을 사용하여 `AlloyDBLoader` 클래스로 문서를 로드하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [AlloyDB API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
* [AlloyDB 클러스터 및 인스턴스 생성](https://cloud.google.com/alloydb/docs/cluster-create)
* [AlloyDB 데이터베이스 생성](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
* [데이터베이스에 사용자 추가](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 라이브러리 설치

`langchain-google-alloydb-pg` 통합 라이브러리를 설치하세요.

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg
```

**Colab only:** 다음 셀의 주석을 해제하거나 커널 다시 시작 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:

* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## 기본 사용법

### AlloyDB 데이터베이스 변수 설정

[AlloyDB 인스턴스 페이지](https://console.cloud.google.com/alloydb/clusters)에서 데이터베이스 값을 찾으세요.

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### AlloyDBEngine 연결 풀

AlloyDB를 벡터 저장소로 설정하는 데 필요한 요구 사항 및 인수 중 하나는 `AlloyDBEngine` 객체입니다. `AlloyDBEngine`은 애플리케이션에서 성공적인 연결을 가능하게 하고 업계 모범 사례를 따르는 AlloyDB 데이터베이스에 대한 연결 풀을 구성합니다.

`AlloyDBEngine.from_instance()`를 사용하여 `AlloyDBEngine`을 만들려면 다음 5가지만 제공하면 됩니다:

1. `project_id`: AlloyDB 인스턴스가 있는 Google Cloud 프로젝트의 프로젝트 ID.
1. `region`: AlloyDB 인스턴스가 있는 리전.
1. `cluster`: AlloyDB 클러스터의 이름.
1. `instance`: AlloyDB 인스턴스의 이름.
1. `database`: AlloyDB 인스턴스에 연결할 데이터베이스의 이름.

기본적으로 [IAM 데이터베이스 인증](https://cloud.google.com/alloydb/docs/connect-iam)이 데이터베이스 인증 방법으로 사용됩니다. 이 라이브러리는 환경에서 소싱된 [Application Default Credentials(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)에 속한 IAM 주체를 사용합니다.

선택적으로 사용자 이름과 비밀번호를 사용하여 [기본 제공 데이터베이스 인증](https://cloud.google.com/alloydb/docs/database-users/about)을 통해 AlloyDB 데이터베이스에 액세스할 수도 있습니다. `AlloyDBEngine.from_instance()`에 `user` 및 `password` 인수를 제공하면 됩니다:

* `user`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 사용자
* `password`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 비밀번호

**참고**: 이 자습서에서는 비동기 인터페이스를 보여줍니다. 모든 비동기 메서드에는 해당 동기 메서드가 있습니다.

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### AlloyDBLoader 생성

```python
from langchain_google_alloydb_pg import AlloyDBLoader

# Creating a basic AlloyDBLoader object
loader = await AlloyDBLoader.create(engine, table_name=TABLE_NAME)
```

### 기본 테이블을 통해 문서 로드

로더는 첫 번째 열을 page_content로, 다른 모든 열을 메타데이터로 사용하여 테이블에서 문서 목록을 반환합니다. 기본 테이블에는 첫 번째 열이 page_content이고 두 번째 열이 메타데이터(JSON)입니다. 각 행이 문서가 됩니다.

```python
docs = await loader.aload()
print(docs)
```

### 사용자 지정 테이블/메타데이터 또는 사용자 지정 페이지 콘텐츠 열을 통해 문서 로드

```python
loader = await AlloyDBLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### 페이지 콘텐츠 형식 설정

로더는 문서 목록을 반환하며, 각 문서는 행당 하나씩 지정된 문자열 형식(즉, 텍스트(공백으로 구분된 연결), JSON, YAML, CSV 등)의 페이지 콘텐츠를 포함합니다. JSON과 YAML 형식에는 헤더가 포함되지만 텍스트와 CSV에는 필드 헤더가 포함되지 않습니다.

```python
loader = AlloyDBLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
