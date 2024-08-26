---
translated: true
---

# Infobip

このノートブックは、[Infobip](https://www.infobip.com/) APIラッパーを使ってSMSメッセージやメールを送信する方法を示しています。

Infobipは多くのサービスを提供していますが、このノートブックではSMSとEメールサービスに焦点を当てています。APIや他のチャネルの詳細については[こちら](https://www.infobip.com/docs/api)をご覧ください。

## セットアップ

このツールを使用するには、Infobipアカウントが必要です。[無料トライアルアカウント](https://www.infobip.com/docs/essentials/free-trial)を作成できます。

`InfobipAPIWrapper`は名前付きパラメーターを使用し、資格情報を指定できます:

- `infobip_api_key` - [API Key](https://www.infobip.com/docs/essentials/api-authentication#api-key-header)は[開発者ツール](https://portal.infobip.com/dev/api-keys)で確認できます
- `infobip_base_url` - Infobip APIの[ベースURL](https://www.infobip.com/docs/essentials/base-url)。デフォルト値 `https://api.infobip.com/` を使用できます。

`infobip_api_key`と`infobip_base_url`は環境変数`INFOBIP_API_KEY`と`INFOBIP_BASE_URL`としても指定できます。

## SMSの送信

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

## メールの送信

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

# Agentの中での使用方法

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
