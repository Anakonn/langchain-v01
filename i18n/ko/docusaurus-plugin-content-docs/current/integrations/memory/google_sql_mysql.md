---
translated: true
---

# Google SQL for MySQL

> [Cloud Cloud SQL](https://cloud.google.com/sql)은 고성능, 원활한 통합, 인상적인 확장성을 제공하는 완전 관리형 관계형 데이터베이스 서비스입니다. `MySQL`, `PostgreSQL`, `SQL Server` 데이터베이스 엔진을 제공합니다. Cloud SQL의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 `MySQLChatMessageHistory` 클래스를 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/chat_message_history.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

 * [Google Cloud 프로젝트 생성하기](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API 활성화하기](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Cloud SQL for MySQL 인스턴스 생성하기](https://cloud.google.com/sql/docs/mysql/create-instance)
 * [Cloud SQL 데이터베이스 생성하기](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [데이터베이스에 IAM 데이터베이스 사용자 추가하기](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (선택 사항)

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-cloud-sql-mysql` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Colab 전용:** 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

이 노트북 내에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

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

### 💡 API 활성화

`langchain-google-cloud-sql-mysql` 패키지를 사용하려면 Google Cloud 프로젝트에서 [Cloud SQL Admin API](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)를 활성화해야 합니다.

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## 기본 사용법

### Cloud SQL 데이터베이스 값 설정

[Cloud SQL 인스턴스 페이지](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)에서 데이터베이스 값을 찾으세요.

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### MySQLEngine 연결 풀

Cloud SQL을 ChatMessageHistory 메모리 저장소로 사용하기 위한 요구 사항 및 인수 중 하나는 `MySQLEngine` 객체입니다. `MySQLEngine`은 Cloud SQL 데이터베이스에 대한 연결 풀을 구성하여 애플리케이션에서 성공적인 연결을 가능하게 하고 업계 모범 사례를 따릅니다.

`MySQLEngine.from_instance()`를 사용하여 `MySQLEngine`을 만들려면 다음 4가지만 제공하면 됩니다:

1. `project_id`: Cloud SQL 인스턴스가 있는 Google Cloud 프로젝트의 프로젝트 ID.
1. `region`: Cloud SQL 인스턴스가 있는 리전.
1. `instance`: Cloud SQL 인스턴스의 이름.
1. `database`: Cloud SQL 인스턴스에 연결할 데이터베이스의 이름.

기본적으로 [IAM 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth)이 데이터베이스 인증 방법으로 사용됩니다. 이 라이브러리는 환경에서 소싱된 [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)에 속한 IAM 주체를 사용합니다.

IAM 데이터베이스 인증에 대한 자세한 내용은 다음을 참조하세요:

* [IAM 데이터베이스 인증을 위한 인스턴스 구성](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM 데이터베이스 인증을 사용하여 사용자 관리](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

선택적으로 사용자 이름과 비밀번호를 사용하는 [기본 제공 데이터베이스 인증](https://cloud.google.com/sql/docs/mysql/built-in-authentication)을 사용할 수도 있습니다. `MySQLEngine.from_instance()`에 `user` 및 `password` 인수를 제공하면 됩니다:

* `user`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 사용자
* `password`: 기본 제공 데이터베이스 인증 및 로그인에 사용할 데이터베이스 비밀번호

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### 테이블 초기화

`MySQLChatMessageHistory` 클래스에는 채팅 메시지 기록을 저장하기 위해 특정 스키마를 가진 데이터베이스 테이블이 필요합니다.

`MySQLEngine` 엔진에는 `init_chat_history_table()` 헬퍼 메서드가 있어 적절한 스키마로 테이블을 생성할 수 있습니다.

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### MySQLChatMessageHistory

`MySQLChatMessageHistory` 클래스를 초기화하려면 3가지만 제공하면 됩니다:

1. `engine` - `MySQLEngine` 엔진의 인스턴스.
1. `session_id` - 세션을 식별하는 고유한 문자열 ID.
1. `table_name` - Cloud SQL 데이터베이스에 채팅 메시지 기록을 저장할 테이블 이름.

```python
from langchain_google_cloud_sql_mysql import MySQLChatMessageHistory

history = MySQLChatMessageHistory(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

#### 정리

특정 세션의 기록이 더 이상 필요하지 않고 삭제할 수 있는 경우 다음과 같이 수행할 수 있습니다.

**주의:** 삭제하면 Cloud SQL에 더 이상 데이터가 저장되지 않고 영구적으로 삭제됩니다.

```python
history.clear()
```

## 🔗 체이닝

이 메시지 기록 클래스를 [LCEL Runnables](/docs/expression_language/how_to/message_history)와 쉽게 결합할 수 있습니다.

이를 위해 [Google의 Vertex AI 채팅 모델](/docs/integrations/chat/google_vertex_ai_palm)을 사용할 것이며, 이를 위해 Google Cloud 프로젝트에서 [Vertex AI API를 활성화](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)해야 합니다.

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: MySQLChatMessageHistory(
        engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content=' Hello Bob, how can I help you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content=' Your name is Bob.')
```
