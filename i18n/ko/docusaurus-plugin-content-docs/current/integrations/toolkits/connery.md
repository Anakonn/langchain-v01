---
translated: true
---

# Connery 툴킷

이 툴킷을 사용하면 Connery 액션을 LangChain 에이전트에 통합할 수 있습니다.

특정 Connery 액션만 에이전트에 사용하려면 [Connery 액션 도구](/docs/integrations/tools/connery) 문서를 확인하세요.

## Connery란 무엇인가요?

Connery는 AI를 위한 오픈 소스 플러그인 인프라스트럭처입니다.

Connery를 사용하면 일련의 액션으로 사용자 지정 플러그인을 쉽게 만들고 LangChain 에이전트에 seamlessly 통합할 수 있습니다. Connery는 런타임, 권한 부여, 비밀 관리, 액세스 관리, 감사 로그 및 기타 중요한 기능과 같은 중요한 측면을 처리합니다.

또한 Connery는 우리 커뮤니티의 지원을 받아 편의성을 높이기 위해 다양한 오픈 소스 플러그인을 제공합니다.

Connery에 대해 자세히 알아보기:

- GitHub: https://github.com/connery-io/connery
- 문서: https://docs.connery.io

## 전제 조건

LangChain 에이전트에서 Connery 액션을 사용하려면 다음과 같은 준비가 필요합니다:

1. [Quickstart](https://docs.connery.io/docs/runner/quick-start/) 가이드를 사용하여 Connery 러너를 설정합니다.
2. 에이전트에서 사용하려는 액션이 포함된 모든 플러그인을 설치합니다.
3. `CONNERY_RUNNER_URL` 및 `CONNERY_RUNNER_API_KEY` 환경 변수를 설정하여 툴킷이 Connery 러너와 통신할 수 있도록 합니다.

## Connery 툴킷 사용 예

아래 예에서는 두 개의 Connery 액션을 사용하여 공개 웹 페이지를 요약하고 이메일로 보내는 에이전트를 만듭니다:

1. [Summarization](https://github.com/connery-io/summarization-plugin) 플러그인의 **공개 웹 페이지 요약** 액션.
2. [Gmail](https://github.com/connery-io/gmail) 플러그인의 **이메일 보내기** 액션.

이 예의 LangSmith 추적은 [여기](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r)에서 확인할 수 있습니다.

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools.connery import ConneryService

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```

</codeblock 1>

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```

</codeblock 2>

참고: Connery 액션은 구조화된 도구이므로 구조화된 도구를 지원하는 에이전트에서만 사용할 수 있습니다.
