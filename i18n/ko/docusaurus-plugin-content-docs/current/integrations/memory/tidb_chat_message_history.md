---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/)는 전용 및 서버리스 옵션을 제공하는 포괄적인 Database-as-a-Service(DBaaS) 솔루션입니다. TiDB Serverless는 이제 MySQL 환경에 내장된 벡터 검색을 통합하고 있습니다. 이 향상을 통해 새로운 데이터베이스나 추가 기술 스택 없이도 TiDB Serverless를 사용하여 AI 애플리케이션을 seamlessly 개발할 수 있습니다. 프라이빗 베타 대기자 명단에 가입하여 이를 먼저 경험해 보세요 https://tidb.cloud/ai.

이 노트북은 TiDB를 사용하여 채팅 메시지 기록을 저장하는 방법을 소개합니다.

## 설정

먼저 다음 종속성을 설치할 것입니다:

```python
%pip install --upgrade --quiet langchain langchain_openai
```

OpenAI 키 구성

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Input your OpenAI API key:")
```

마지막으로 TiDB에 대한 연결을 구성할 것입니다. 이 노트북에서는 TiDB Cloud에서 제공하는 표준 연결 방법을 따라 안전하고 효율적인 데이터베이스 연결을 설정할 것입니다.

```python
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## 과거 데이터 생성

향후 시연의 기반이 될 과거 데이터 세트를 생성합니다.

```python
from datetime import datetime

from langchain_community.chat_message_histories import TiDBChatMessageHistory

history = TiDBChatMessageHistory(
    connection_string=tidb_connection_string,
    session_id="code_gen",
    earliest_time=datetime.utcnow(),  # Optional to set earliest_time to load messages after this time point.
)

history.add_user_message("How's our feature going?")
history.add_ai_message(
    "It's going well. We are working on testing now. It will be released in Feb."
)
```

```python
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb.")]
```

## 과거 데이터로 채팅하기

이전에 생성한 과거 데이터를 기반으로 동적 채팅 상호 작용을 만들어 보겠습니다.

먼저 LangChain으로 채팅 체인 만들기:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at coding. You're helping a startup build",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)
chain = prompt | ChatOpenAI()
```

과거 데이터로 실행 가능한 만들기:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: TiDBChatMessageHistory(
        session_id=session_id, connection_string=tidb_connection_string
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

채팅 시작:

```python
response = chain_with_history.invoke(
    {"question": "Today is Jan 1st. How many days until our feature is released?"},
    config={"configurable": {"session_id": "code_gen"}},
)
response
```

```output
AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')
```

## 기록 데이터 확인

```python
history.reload_cache()
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb."),
 HumanMessage(content='Today is Jan 1st. How many days until our feature is released?'),
 AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')]
```
