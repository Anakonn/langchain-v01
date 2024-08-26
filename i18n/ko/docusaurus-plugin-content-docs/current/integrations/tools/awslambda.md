---
translated: true
---

# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/)는 `Amazon Web Services`(`AWS`)가 제공하는 서버리스 컴퓨팅 서비스입니다. 이를 통해 개발자들은 서버 프로비저닝 및 관리 없이도 애플리케이션과 서비스를 구축하고 실행할 수 있습니다. 이 서버리스 아키텍처를 통해 코드 작성 및 배포에 집중할 수 있으며, AWS는 자동으로 애플리케이션 실행에 필요한 인프라의 확장, 패치 및 관리를 수행합니다.

이 노트북은 `AWS Lambda` 도구 사용 방법을 설명합니다.

Agent에게 제공되는 도구 목록에 `AWS Lambda`를 포함하면 Agent가 필요에 따라 AWS 클라우드에서 실행되는 코드를 호출할 수 있습니다.

Agent가 `AWS Lambda` 도구를 사용할 때 문자열 유형의 인수를 제공하면 해당 인수가 이벤트 매개변수를 통해 Lambda 함수로 전달됩니다.

먼저 `boto3` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  boto3 > /dev/null
```

Agent가 이 도구를 사용하려면 Lambda 함수의 로직 기능과 일치하는 이름과 설명을 제공해야 합니다.

또한 함수 이름을 제공해야 합니다.

이 도구는 실제로 boto3 라이브러리의 래퍼에 불과하므로 도구를 사용하려면 `aws configure`를 실행해야 합니다. 자세한 내용은 [여기](https://docs.aws.amazon.com/cli/index.html)를 참조하세요.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```
