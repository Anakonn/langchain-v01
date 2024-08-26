---
translated: true
---

# 레몬 에이전트

>[레몬 에이전트](https://github.com/felixbrock/lemon-agent)는 몇 분 만에 강력한 AI 어시스턴트를 구축하고 `Airtable`, `Hubspot`, `Discord`, `Notion`, `Slack` 및 `Github`와 같은 도구에서 정확하고 신뢰할 수 있는 읽기 및 쓰기 작업을 허용하여 워크플로우를 자동화할 수 있습니다.

[전체 문서 보기](https://github.com/felixbrock/lemonai-py-client).

오늘날 사용 가능한 대부분의 커넥터는 읽기 전용 작업에 초점을 맞추고 있어 LLM의 잠재력을 제한하고 있습니다. 반면에 에이전트는 때때로 문맥 또는 지침이 부족하여 환각을 일으키는 경향이 있습니다.

`Lemon AI`를 사용하면 에이전트에게 신뢰할 수 있는 읽기 및 쓰기 작업을 위한 잘 정의된 API에 대한 액세스 권한을 부여할 수 있습니다. 또한 `Lemon AI` 기능을 사용하면 불확실성이 있는 경우 모델이 의존할 수 있는 정적으로 정의된 워크플로우를 제공하여 환각 위험을 더 줄일 수 있습니다.

## 빠른 시작

다음 빠른 시작은 에이전트와 함께 Lemon AI를 사용하여 내부 도구와의 상호 작용을 포함하는 워크플로우를 자동화하는 방법을 보여줍니다.

### 1. Lemon AI 설치

Python 3.8.1 이상이 필요합니다.

Python 프로젝트에서 Lemon AI를 사용하려면 `pip install lemonai`를 실행하세요.

이렇게 하면 Lemon AI 클라이언트가 설치되며 스크립트에 가져올 수 있습니다.

이 도구는 Python 패키지 langchain과 loguru를 사용합니다. Lemon AI 설치 오류가 발생하는 경우 먼저 두 패키지를 설치한 다음 Lemon AI 패키지를 설치하세요.

### 2. 서버 실행

에이전트와 Lemon AI가 제공하는 모든 도구 간의 상호 작용은 [Lemon AI 서버](https://github.com/felixbrock/lemonai-server)에 의해 처리됩니다. Lemon AI를 사용하려면 Lemon AI Python 클라이언트가 연결할 수 있도록 로컬 컴퓨터에서 서버를 실행해야 합니다.

### 3. Langchain에서 Lemon AI 사용

Lemon AI는 관련 도구의 올바른 조합을 찾거나 Lemon AI 기능을 대안으로 사용하여 주어진 작업을 자동으로 해결합니다. 다음 예제는 Hackernews에서 사용자를 검색하고 Airtable의 테이블에 쓰는 방법을 보여줍니다:

#### (선택 사항) Lemon AI 기능 정의

[OpenAI 기능](https://openai.com/blog/function-calling-and-other-api-updates)과 유사하게 Lemon AI는 재사용 가능한 기능으로 워크플로우를 정의할 수 있는 옵션을 제공합니다. 이러한 기능은 결정론적 행동에 가능한 한 가깝게 이동해야 하는 특정 사용 사례에 대해 정의할 수 있습니다. 별도의 lemonai.json에 특정 워크플로우를 정의할 수 있습니다:

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

모델은 이러한 기능에 액세스할 수 있으며 주어진 작업을 해결하기 위해 자체 선택 도구보다 이를 선호할 것입니다. 에이전트에게 주어진 기능을 사용해야 한다는 것을 알려주기만 하면 됩니다.

#### Langchain 프로젝트에 Lemon AI 포함

```python
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### API 키 및 액세스 토큰 로드

인증이 필요한 도구를 사용하려면 환경에 해당 액세스 자격 증명을 "{tool name}_{authentication string}" 형식으로 저장해야 합니다. 여기서 인증 문자열은 API 키의 경우 ["API_KEY", "SECRET_KEY", "SUBSCRIPTION_KEY", "ACCESS_KEY"] 중 하나이고 인증 토큰의 경우 ["ACCESS_TOKEN", "SECRET_TOKEN"] 중 하나입니다. 예: "OPENAI_API_KEY", "BING_SUBSCRIPTION_KEY", "AIRTABLE_ACCESS_TOKEN".

```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```

```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper
to run your Langchain agent in combination with Lemon AI
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. 에이전트의 의사 결정 과정 투명성 확보

에이전트가 주어진 작업을 해결하기 위해 Lemon AI 도구와 상호 작용하는 방식에 대한 투명성을 확보하기 위해 모든 결정, 사용된 도구 및 수행된 작업이 로컬 `lemonai.log` 파일에 기록됩니다. LLM 에이전트가 Lemon AI 도구 스택과 상호 작용할 때마다 해당 로그 항목이 생성됩니다.

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

[Lemon AI 분석](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md)을 사용하면 도구가 어떤 순서로 얼마나 자주 사용되는지 쉽게 파악할 수 있습니다. 그 결과 에이전트의 의사 결정 능력의 약점을 식별하고 Lemon AI 기능을 정의하여 더 결정론적인 행동으로 이동할 수 있습니다.
