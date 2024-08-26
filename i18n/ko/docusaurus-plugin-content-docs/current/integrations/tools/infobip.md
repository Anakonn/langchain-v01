---
translated: true
---

# 인포빕

이 노트북은 [Infobip](https://www.infobip.com/) API 래퍼를 사용하여 SMS 메시지와 이메일을 보내는 방법을 보여줍니다.

Infobip은 많은 서비스를 제공하지만, 이 노트북은 SMS와 이메일 서비스에 초점을 맞출 것입니다. API와 다른 채널에 대한 자세한 정보는 [여기](https://www.infobip.com/docs/api)에서 찾을 수 있습니다.

## 설정

이 도구를 사용하려면 Infobip 계정이 필요합니다. [무료 체험 계정](https://www.infobip.com/docs/essentials/free-trial)을 만들 수 있습니다.

`InfobipAPIWrapper`는 자격 증명을 제공할 수 있는 이름 매개변수를 사용합니다:

- `infobip_api_key` - [API 키](https://www.infobip.com/docs/essentials/api-authentication#api-key-header)는 [개발자 도구](https://portal.infobip.com/dev/api-keys)에서 찾을 수 있습니다.
- `infobip_base_url` - Infobip API의 [기본 URL](https://www.infobip.com/docs/essentials/base-url). 기본값 `https://api.infobip.com/`을 사용할 수 있습니다.

`INFOBIP_API_KEY` 및 `INFOBIP_BASE_URL` 환경 변수로 `infobip_api_key` 및 `infobip_base_url`을 제공할 수도 있습니다.

## SMS 보내기

```python
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="41793026727",
    text="Hello, World!",
    sender="Langchain",
    channel="sms",
)
```

## 이메일 보내기

```python
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="test@example.com",
    sender="test@example.com",
    subject="example",
    body="example",
    channel="email",
)
```

# 에이전트 내부에서 사용하는 방법

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import StructuredTool
from langchain_community.utilities.infobip import InfobipAPIWrapper
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

instructions = "You are a coding teacher. You are teaching a student how to code. The student asks you a question. You answer the question."
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
llm = ChatOpenAI(temperature=0)


class EmailInput(BaseModel):
    body: str = Field(description="Email body text")
    to: str = Field(description="Email address to send to. Example: email@example.com")
    sender: str = Field(
        description="Email address to send from, must be 'validemail@example.com'"
    )
    subject: str = Field(description="Email subject")
    channel: str = Field(description="Email channel, must be 'email'")


infobip_api_wrapper: InfobipAPIWrapper = InfobipAPIWrapper()
infobip_tool = StructuredTool.from_function(
    name="infobip_email",
    description="Send Email via Infobip. If you need to send email, use infobip_email",
    func=infobip_api_wrapper.run,
    args_schema=EmailInput,
)
tools = [infobip_tool]

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)

agent_executor.invoke(
    {
        "input": "Hi, can you please send me an example of Python recursion to my email email@example.com"
    }
)
```

```bash
> Entering new AgentExecutor chain...

Invoking: `infobip_email` with `{'body': 'Hi,\n\nHere is a simple example of a recursive function in Python:\n\n```\ndef factorial(n):\n    if n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```\n\nThis function calculates the factorial of a number. The factorial of a number is the product of all positive integers less than or equal to that number. The function calls itself with a smaller argument until it reaches the base case where n equals 1.\n\nBest,\nCoding Teacher', 'to': 'email@example.com', 'sender': 'validemail@example.com', 'subject': 'Python Recursion Example', 'channel': 'email'}`


I have sent an example of Python recursion to your email. Please check your inbox.

> Finished chain.
```
