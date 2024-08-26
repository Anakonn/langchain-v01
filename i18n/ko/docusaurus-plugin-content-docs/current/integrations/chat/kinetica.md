---
sidebar_label: Kinetica
translated: true
---

# Kinetica SqlAssist LLM 데모

이 노트북은 자연어를 SQL로 변환하고 데이터 검색 과정을 단순화하는 Kinetica 사용법을 시연합니다. 이 데모는 LLM의 기능보다는 체인을 생성하고 사용하는 메커니즘을 보여주는 데 목적이 있습니다.

## 개요

Kinetica LLM 워크플로우를 통해 테이블, 주석, 규칙 및 샘플을 포함한 추론에 필요한 정보를 제공하는 데이터베이스에 LLM 컨텍스트를 생성합니다. `ChatKinetica.load_messages_from_context()`를 호출하면 데이터베이스에서 컨텍스트 정보를 가져와서 채팅 프롬프트를 생성하는 데 사용할 수 있습니다.

채팅 프롬프트는 `SystemMessage`와 질문/SQL 쌍을 포함하는 `HumanMessage`/`AIMessage` 쌍으로 구성됩니다. 이 목록에 샘플 쌍을 추가할 수 있지만 일반적인 자연어 대화를 용이하게 하기 위한 것은 아닙니다.

채팅 프롬프트에서 체인을 생성하고 실행하면 Kinetica LLM이 입력에서 SQL을 생성합니다. 선택적으로 `KineticaSqlOutputParser`를 사용하여 SQL을 실행하고 결과를 데이터프레임으로 반환할 수 있습니다.

현재 SQL 생성에 대해 2개의 LLM이 지원됩니다:

1. **Kinetica SQL-GPT**: 이 LLM은 OpenAI ChatGPT API를 기반으로 합니다.
2. **Kinetica SqlAssist**: 이 LLM은 Kinetica 데이터베이스와 통합하도록 설계되었으며, 보안된 고객 프레미스에서 실행될 수 있습니다.

이 데모에서는 **SqlAssist**를 사용할 것입니다. 자세한 내용은 [Kinetica 문서 사이트](https://docs.kinetica.com/7.1/sql-gpt/concepts/)를 참조하세요.

## 사전 준비

시작하려면 Kinetica DB 인스턴스가 필요합니다. 인스턴스가 없는 경우 [무료 개발 인스턴스](https://cloud.kinetica.com/trynow)를 얻을 수 있습니다.

다음 패키지를 설치해야 합니다.

```python
# Langchain 커뮤니티 및 코어 패키지 설치

%pip install --upgrade --quiet langchain-core langchain-community

# Kinetica DB 연결 패키지 설치

%pip install --upgrade --quiet gpudb typeguard

# 이 튜토리얼에 필요한 패키지 설치

%pip install --upgrade --quiet faker
```

```output
Note: you may need to restart the kernel to use updated packages.
```

## 데이터베이스 연결

다음 환경 변수에 데이터베이스 연결을 설정해야 합니다. 가상 환경을 사용하는 경우 프로젝트의 `.env` 파일에 설정할 수 있습니다:

- `KINETICA_URL`: 데이터베이스 연결 URL
- `KINETICA_USER`: 데이터베이스 사용자
- `KINETICA_PASSWD`: 보안 비밀번호

`KineticaChatLLM` 인스턴스를 생성할 수 있다면 성공적으로 연결된 것입니다.

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# 생성할 테스트 테이블

table_name = "demo.user_profiles"

# 생성할 LLM 컨텍스트

kinetica_ctx = "demo.test_llm_ctx"
```

## 테스트 데이터 생성

SQL을 생성하기 전에 Kinetica 테이블과 테이블을 추론할 수 있는 LLM 컨텍스트를 생성해야 합니다.

### 가짜 사용자 프로필 생성

`faker` 패키지를 사용하여 100개의 가짜 프로필이 포함된 데이터프레임을 생성합니다.

```python
from typing import Generator

import pandas as pd
from faker import Faker

Faker.seed(5467)
faker = Faker(locale="en-US")

def profile_gen(count: int) -> Generator:
    for id in range(0, count):
        rec = dict(id=id, **faker.simple_profile())
        rec["birthdate"] = pd.Timestamp(rec["birthdate"])
        yield rec

load_df = pd.DataFrame.from_records(data=profile_gen(100), index="id")
load_df.head()
```

```html
<div>
  <style scoped>
    .dataframe tbody tr th:only-of-type {
      vertical-align: middle;
    }

    .dataframe tbody tr th {
      vertical-align: top.;
    }

    .dataframe thead th {
      text-align: right.;
    }
  </style>
  <table border="1" class="dataframe">
    <thead>
      <tr style="text-align: right;">
        <th></th>
        <th>username</th>
        <th>name</th>
        <th>sex</th>
        <th>address</th>
        <th>mail</th>
        <th>birthdate</th>
      </tr>
      <tr>
        <th>id</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>eduardo69</td>
        <td>Haley Beck</td>
        <td>F</td>
        <td>59836 Carla Causeway Suite 939\nPort Eugene, I...</td>
        <td>meltondenise@yahoo.com</td>
        <td>1997-11-23</td>
      </tr>
      <tr>
        <th>1</th>
        <td>lbarrera</td>
        <td>Joshua Stephens</td>
        <td>M</td>
        <td>3108 Christina Forges\nPort Timothychester, KY...</td>
        <td>erica80@hotmail.com</td>
        <td>1924-07-19</td>
      </tr>
      <tr>
        <th>2</th>
        <td>bburton</td>
        <td>Paula Kaiser</td>
        <td>F</td>
        <td>Unit 7405 Box 3052\nDPO AE 09858</td>
        <td>timothypotts@gmail.com</td>
        <td>1933-11-20</td>
      </tr>
      <tr>
        <th>3</th>
        <td>melissa49</td>
        <td>Wendy Reese</td>
        <td>F</td>
        <td>6408 Christopher Hill Apt. 459\nNew Benjamin, ...</td>
        <td>dadams@gmail.com</td>
        <td>1988-10-11</td>
      </tr>
      <tr>
        <th>4</th>
        <td>melissacarter</td>
        <td>Manuel Rios</td>
        <td>M</td>
        <td>2241 Bell Gardens Suite 723\nScottside, CA 38463</td>
        <td>williamayala@gmail.com</td>
        <td>1931-03-04</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 데이터프레임에서 Kinetica 테이블 생성

```python
from gpudb import GPUdbTable

gpudb_table = GPUdbTable.from_df(
    load_df,
    db=kinetica_llm.kdbc,
    table_name=table_name,
    clear_table=True,
    load_data=True,
)

# Kinetica 열 유형 보기

gpudb_table.type_as_df()
```

```html
<div>
  <style scoped>
    .dataframe tbody tr th:only-of-type {
      vertical-align: middle.;
    }

    .dataframe tbody tr th {
      vertical-align: top.;
    }

    .dataframe thead th {
      text-align: right.;
    }
  </style>
  <table border="1" class="dataframe">
    <thead>
      <tr style="text-align: right;">
        <th></th>
        <th>name</th>
        <th>type</th>
        <th>properties</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>username</td>
        <td>string</td>
        <td>[char32]</td>
      </tr>
      <tr>
        <th>1</th>
        <td>name</td>
        <td>string</td>
        <td>[char32]</td>
      </tr>
      <tr>
        <th>2</th>
        <td>sex</td>
        <td>string</td>
        <td>[char1]</td>
      </tr>
      <tr>
        <th>3</th>
        <td>address</td>
        <td>string</td>
        <td>[char64]</td>
      </tr>
      <tr>
        <th>4</th>
        <td>mail</td>
        <td>string</td>
        <td>[char32]</td>
      </tr>
      <tr>
        <th>5</th>
        <td>birthdate</td>
        <td>long</td>
        <td>[timestamp]</td>
      </tr>
    </tbody>
  </table>
</div>
```

### LLM 컨텍스트 생성

Kinetica Workbench UI를 사용하여 LLM 컨텍스트를 생성하거나 `CREATE OR REPLACE CONTEXT` 구문을 사용하여 수동으로 생성할 수 있습니다.

여기에서는 생성한 테이블을 참조하는 SQL 구문으로 컨텍스트를 생성합니다.

```python
# 테이블에 대한 LLM 컨텍스트 생성.

from gpudb import GPUdbException

sql = f"""
CREATE OR REPLACE CONTEXT {kinetica_ctx}
(
    TABLE = demo.test_profiles
    COMMENT = 'Contains user profiles.'
),
(
    SAMPLES = (
    'How many male users are there?' =
    'select count(1) as num_users
    from demo.test_profiles
    where sex = ''M'';')
)
"""

def _check_error(response: dict) -> None:
    status = response["status_info"]["status"]
    if status != "OK":
        message = response["status_info"]["message"]
        raise GPUdbException("[%s]: %s" % (status, message))

response = kinetica_llm.kdbc.execute_sql(sql)
_check_error(response)
response["status_info"]
```

```output
{'status': 'OK',
 'message': '',
 'data_type': 'execute_sql_response',
 'response_time': 0.0148}
```

## Langchain을 사용한 추론

아래 예제에서는 이전에 생성한 테이블과 LLM 컨텍스트에서 체인을 생성합니다. 이 체인은 SQL을 생성하고 결과 데이터를 데이터프레임으로 반환합니다.

### Kinetica DB에서 채팅 프롬프트 로드

`load_messages_from_context()` 함수는 데이터베이스에서 컨텍스트를 가져와 `ChatPromptTemplate`을 생성하는 데 사용할 채팅 메시지 목록으로 변환합니다.

```python
from langchain_core.prompts import ChatPromptTemplate

# 데이터베이스에서 컨텍스트 로드

ctx_messages = kinetica_llm.load_messages_from_context(kinetica_ctx)

# 입력 프롬프트 추가. 여기에서 입력 질문이 대체됩니다.

ctx_messages.append(("human", "{input}"))

# 프롬프트 템플릿 생성.

prompt_template = ChatPromptTemplate.from_messages(ctx_messages)
prompt_template.pretty_print()
```

```output
================================[1m System Message [0m================================

CREATE TABLE demo.test_profiles AS
(
   username VARCHAR (32) NOT NULL,
   name VARCHAR (32) NOT NULL,
   sex VARCHAR (1) NOT NULL,
   address VARCHAR (64) NOT NULL,
   mail VARCHAR (32) NOT NULL,
   birthdate TIMESTAMP NOT NULL
);
COMMENT ON TABLE demo.test_profiles IS 'Contains user profiles.';

================================[1m Human Message [0m=================================

How many male users are there?

==================================[1m Ai Message [0m==================================

select count(1) as num_users
    from demo.test_profiles
    where sex = 'M';

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

### 체인 생성

이 체인의 마지막 요소는 SQL을 실행하고 데이터프레임을 반환하는 `KineticaSqlOutputParser`입니다. 이는 선택 사항이며 생략하면 SQL만 반환됩니다.

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### SQL 생성

생성한 체인은 질문을 입력으로 받아 SQL과 데이터를 포함한 `KineticaSqlResponse`를 반환합니다. 질문은 프롬프트를 생성하는 데 사용한 LLM 컨텍스트와 관련이 있어야 합니다.

```python
# 여기에서는 프롬프트 템플릿에서 제공된 LLM 컨텍스트와 관련된 질문을 해야 합니다.

response: KineticaSqlResponse = chain.invoke(
    {"input": "What are the female users ordered by username?"}
)

print(f"SQL: {response.sql}")
response.dataframe.head()
```

```output
SQL: SELECT username, name
    FROM demo.test_profiles
    WHERE sex = 'F'
    ORDER BY username;
```

```html
<div>
  <style scoped>
    .dataframe tbody tr th:only-of-type {
      vertical-align: middle.;
    }

    .dataframe tbody tr th {
      vertical-align: top.;
    }

    .dataframe thead th {
      text-align: right.;
    }
  </style>
  <table border="1" class="dataframe">
    <thead>
      <tr style="text-align: right;">
        <th></th>
        <th>username</th>
        <th>name</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>0</th>
        <td>alexander40</td>
        <td>Tina Ramirez</td>
      </tr>
      <tr>
        <th>1</th>
        <td>bburton</td>
        <td>Paula Kaiser</td>
      </tr>
      <tr>
        <th>2</th>
        <td>brian12</td>
        <td>Stefanie Williams</td>
      </tr>
      <tr>
        <th>3</th>
        <td>brownanna</td>
        <td>Jennifer Rowe</td>
      </tr>
      <tr>
        <th>4</th>
        <td>carl19</td>
        <td>Amanda Potts</td>
      </tr>
    </tbody>
  </table>
</div>
```