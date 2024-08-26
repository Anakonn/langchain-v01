---
translated: true
---

# Cassandra 데이터베이스

Apache Cassandra®는 트랜잭션 애플리케이션 데이터를 저장하는 데 널리 사용되는 데이터베이스입니다. 대규모 언어 모델에서 기능과 도구가 도입되면서 기존 데이터를 활용한 Generative AI 애플리케이션의 흥미로운 사용 사례가 열렸습니다. Cassandra 데이터베이스 도구 키트를 사용하면 AI 엔지니어가 Cassandra 데이터와 에이전트를 효율적으로 통합할 수 있으며, 다음과 같은 기능을 제공합니다:
 - 최적화된 쿼리를 통한 빠른 데이터 액세스. 대부분의 쿼리는 10ms 미만으로 실행되어야 합니다.
 - LLM 추론 기능을 향상시키기 위한 스키마 내부 조사
 - Apache Cassandra®, DataStax Enterprise™, DataStax Astra™ 등 다양한 Cassandra 배포판과의 호환성
 - 현재 도구 키트는 SELECT 쿼리와 스키마 내부 조사 작업으로 제한됩니다. (안전이 최우선)

## 빠른 시작

 - cassio 라이브러리 설치
 - 연결할 Cassandra 데이터베이스에 대한 환경 변수 설정
 - CassandraDatabase 초기화
 - toolkit.get_tools()를 사용하여 에이전트에게 도구 전달
 - 편하게 앉아서 모든 작업을 수행하세요

## 작동 원리

Cassandra Query Language(CQL)은 Cassandra 데이터베이스와 상호 작용하는 주요 *인간 중심적* 방법입니다. 쿼리 생성 시 일정 수준의 유연성을 제공하지만, Cassandra 데이터 모델링 모범 사례에 대한 지식이 필요합니다. LLM 함수 호출을 통해 에이전트는 요청을 충족시킬 적절한 도구를 선택할 수 있는 능력을 갖게 됩니다. LLM을 사용하는 에이전트는 Cassandra 특정 논리를 사용하여 적절한 도구 키트 또는 도구 체인을 선택해야 합니다. 이를 통해 LLM이 상위 다운 솔루션을 제공할 때 발생하는 무작위성을 줄일 수 있습니다. 데이터베이스에 대한 완전한 무제한 액세스를 LLM에게 허용하시겠습니까? 아니요. 그렇지 않을 것입니다. 이를 달성하기 위해 에이전트에게 질문을 구성할 때 사용할 프롬프트를 제공합니다:

```json
You are an Apache Cassandra expert query analysis bot with the following features
and rules:
 - You will take a question from the end user about finding specific
   data in the database.
 - You will examine the schema of the database and create a query path.
 - You will provide the user with the correct query to find the data they are looking
   for, showing the steps provided by the query path.
 - You will use best practices for querying Apache Cassandra using partition keys
   and clustering columns.
 - Avoid using ALLOW FILTERING in the query.
 - The goal is to find a query path, so it may take querying other tables to get
   to the final answer.

The following is an example of a query path in JSON format:

 {
  "query_paths": [
    {
      "description": "Direct query to users table using email",
      "steps": [
        {
          "table": "user_credentials",
          "query":
             "SELECT userid FROM user_credentials WHERE email = 'example@example.com';"
        },
        {
          "table": "users",
          "query": "SELECT * FROM users WHERE userid = ?;"
        }
      ]
    }
  ]
}
```

## 제공되는 도구

### `cassandra_db_schema`

연결된 데이터베이스 또는 특정 스키마의 모든 스키마 정보를 수집합니다. 에이전트가 작업을 결정할 때 중요합니다.

### `cassandra_db_select_table_data`

특정 키스페이스와 테이블에서 데이터를 선택합니다. 에이전트는 조건자와 반환 레코드 수 제한을 매개변수로 전달할 수 있습니다.

### `cassandra_db_query`

`cassandra_db_select_table_data`의 실험적 대안으로, 에이전트가 완전히 구성한 쿼리 문자열을 받습니다. *경고*: 이로 인해 성능이 좋지 않거나(심지어 작동하지 않을 수도 있는) 이상한 쿼리가 발생할 수 있습니다. 향후 릴리스에서 제거될 수 있습니다. 그러나 멋진 일을 한다면 알려주세요. 누가 알겠습니까!

## 환경 설정

다음 Python 모듈을 설치하세요:

```bash
pip install ipykernel python-dotenv cassio langchain_openai langchain langchain-community langchainhub
```

### .env 파일

`cassio`를 사용하여 `auto=True` 매개변수로 연결하며, 노트북은 OpenAI를 사용합니다. `.env` 파일을 적절히 생성해야 합니다.

Cassandra의 경우 다음과 같이 설정하세요:

```bash
CASSANDRA_CONTACT_POINTS
CASSANDRA_USERNAME
CASSANDRA_PASSWORD
CASSANDRA_KEYSPACE
```

Astra의 경우 다음과 같이 설정하세요:

```bash
ASTRA_DB_APPLICATION_TOKEN
ASTRA_DB_DATABASE_ID
ASTRA_DB_KEYSPACE
```

예:

```bash
# Connection to Astra:
ASTRA_DB_DATABASE_ID=a1b2c3d4-...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_KEYSPACE=notebooks

# Also set
OPENAI_API_KEY=sk-....
```

(아래 코드를 수정하여 `cassio`로 직접 연결할 수도 있습니다.)

```python
from dotenv import load_dotenv

load_dotenv(override=True)
```

## Cassandra 데이터베이스에 연결하기

```python
cassio.init(auto=True)
session = cassio.config.resolve_session()
if not session:
    raise Exception(
        "Check environment configuration or manually configure cassio connection parameters"
    )
```

```python
# Test data pep

session = cassio.config.resolve_session()

session.execute("""DROP KEYSPACE IF EXISTS langchain_agent_test; """)

session.execute(
    """
CREATE KEYSPACE if not exists langchain_agent_test
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_credentials (
    user_email text PRIMARY KEY,
    user_id UUID,
    password TEXT
);
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_videos (
    user_id UUID,
    video_id UUID,
    title TEXT,
    description TEXT,
    PRIMARY KEY (user_id, video_id)
);
"""
)

user_id = "522b1fe2-2e36-4cef-a667-cd4237d08b89"
video_id = "27066014-bad7-9f58-5a30-f63fe03718f6"

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_credentials (user_id, user_email)
    VALUES ({user_id}, 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.users (id, name, email)
    VALUES ({user_id}, 'Patrick McFadin', 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_videos (user_id, video_id, title)
    VALUES ({user_id}, {video_id}, 'Use Langflow to Build a LangChain LLM Application in 5 Minutes');
"""
)

session.set_keyspace("langchain_agent_test")
```

```python
# Create a CassandraDatabase instance
# Uses the cassio session to connect to the database
db = CassandraDatabase()

# Create the Cassandra Database tools
query_tool = QueryCassandraDatabaseTool(db=db)
schema_tool = GetSchemaCassandraDatabaseTool(db=db)
select_data_tool = GetTableDataCassandraDatabaseTool(db=db)
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(temperature=0, model="gpt-4-1106-preview")
toolkit = CassandraDatabaseToolkit(db=db)

tools = toolkit.get_tools()

print("Available tools:")
for tool in tools:
    print(tool.name + "\t- " + tool.description)
```

```output
Available tools:
cassandra_db_schema	-
    Input to this tool is a keyspace name, output is a table description
    of Apache Cassandra tables.
    If the query is not correct, an error message will be returned.
    If an error is returned, report back to the user that the keyspace
    doesn't exist and stop.

cassandra_db_query	-
    Execute a CQL query against the database and get back the result.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.

cassandra_db_select_table_data	-
    Tool for getting data from a table in an Apache Cassandra database.
    Use the WHERE clause to specify the predicate for the query that uses the
    primary key. A blank predicate will return all rows. Avoid this if possible.
    Use the limit to specify the number of rows to return. A blank limit will
    return all rows.
```

```python
prompt = hub.pull("hwchase17/openai-tools-agent")

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
```

```python
input = (
    QUERY_PATH_PROMPT
    + "\n\nHere is your task: Find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the langchain_agent_test keyspace."
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

response = agent_executor.invoke({"input": input})

print(response["output"])
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `cassandra_db_schema` with `{'keyspace': 'langchain_agent_test'}`


[0m[36;1m[1;3mTable Name: user_credentials
- Keyspace: langchain_agent_test
- Columns
  - password (text)
  - user_email (text)
  - user_id (uuid)
- Partition Keys: (user_email)
- Clustering Keys:

Table Name: user_videos
- Keyspace: langchain_agent_test
- Columns
  - description (text)
  - title (text)
  - user_id (uuid)
  - video_id (uuid)
- Partition Keys: (user_id)
- Clustering Keys: (video_id asc)


Table Name: users
- Keyspace: langchain_agent_test
- Columns
  - email (text)
  - id (uuid)
  - name (text)
- Partition Keys: (id)
- Clustering Keys:

[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_credentials', 'predicate': "user_email = 'patrick@datastax.com'", 'limit': 1}`


[0m[38;5;200m[1;3mRow(user_email='patrick@datastax.com', password=None, user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'))[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_videos', 'predicate': 'user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89', 'limit': 10}`


[0m[38;5;200m[1;3mRow(user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'), video_id=UUID('27066014-bad7-9f58-5a30-f63fe03718f6'), description='DataStax Academy is a free resource for learning Apache Cassandra.', title='DataStax Academy')[0m[32;1m[1;3mTo find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.[0m

[1m> Finished chain.[0m
To find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.

```

CQL 에이전트 레시피에 대한 자세한 내용은 [CQL 에이전트 레시피](https://github.com/langchain-ai/langchain/blob/master/cookbook/cql_agent.md)를 참조하세요.
