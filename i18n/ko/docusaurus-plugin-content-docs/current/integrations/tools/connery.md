---
translated: true
---

# Connery 액션 도구

이 도구를 사용하면 개별 Connery 액션을 LangChain 에이전트에 통합할 수 있습니다.

에이전트에 하나 이상의 Connery 액션을 사용하려면 [Connery Toolkit](/docs/integrations/toolkits/connery) 문서를 확인하세요.

## Connery란 무엇인가요?

Connery는 AI를 위한 오픈 소스 플러그인 인프라스트럭처입니다.

Connery를 사용하면 일련의 작업을 포함하는 사용자 지정 플러그인을 쉽게 만들고 LangChain 에이전트에 seamlessly 통합할 수 있습니다. Connery는 런타임, 권한 부여, 비밀 관리, 액세스 관리, 감사 로그 및 기타 중요한 기능과 같은 중요한 측면을 처리합니다.

또한 Connery는 커뮤니티의 지원을 받아 사용할 준비가 된 다양한 오픈 소스 플러그인 컬렉션을 제공합니다.

Connery에 대해 자세히 알아보기:

- GitHub: https://github.com/connery-io/connery
- 문서: https://docs.connery.io

## 전제 조건

LangChain 에이전트에서 Connery 액션을 사용하려면 다음과 같은 준비가 필요합니다:

1. [Quickstart](https://docs.connery.io/docs/runner/quick-start/) 가이드를 사용하여 Connery 러너를 설정합니다.
2. 에이전트에서 사용하려는 작업이 포함된 모든 플러그인을 설치합니다.
3. 도구 키트가 Connery 러너와 통신할 수 있도록 `CONNERY_RUNNER_URL` 및 `CONNERY_RUNNER_API_KEY` 환경 변수를 설정합니다.

## Connery 액션 도구 사용 예

아래 예에서는 Connery 러너에서 ID로 작업을 가져온 다음 지정된 매개변수로 호출합니다.

여기서는 [Gmail](https://github.com/connery-io/gmail) 플러그인의 **이메일 보내기** 작업 ID를 사용합니다.

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

작업을 수동으로 실행합니다.

```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

OpenAI Functions 에이전트를 사용하여 작업을 실행합니다.

이 예의 LangSmith 추적은 [여기](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r)에서 확인할 수 있습니다.

```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```

참고: Connery 액션은 구조화된 도구이므로 구조화된 도구를 지원하는 에이전트에서만 사용할 수 있습니다.
