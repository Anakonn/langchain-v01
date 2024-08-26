---
translated: true
---

यह नोटबुक [Infobip](https://www.infobip.com/) API रैपर का उपयोग करके SMS संदेश और ईमेल भेजने का प्रदर्शन करता है।

Infobip कई सेवाएं प्रदान करता है, लेकिन यह नोटबुक SMS और ईमेल सेवाओं पर केंद्रित होगा। API और अन्य चैनलों के बारे में अधिक जानकारी [यहाँ](https://www.infobip.com/docs/api) मिल सकती है।

## सेटअप

इस उपकरण का उपयोग करने के लिए आपके पास एक Infobip खाता होना चाहिए। आप [मुफ्त ट्रायल खाता](https://www.infobip.com/docs/essentials/free-trial) बना सकते हैं।

`InfobipAPIWrapper` नाम के पैरामीटर का उपयोग करता है जहां आप क्रेडेंशियल प्रदान कर सकते हैं:

- `infobip_api_key` - [API कुंजी](https://www.infobip.com/docs/essentials/api-authentication#api-key-header) जो आप अपने [डेवलपर टूल](https://portal.infobip.com/dev/api-keys) में पा सकते हैं
- `infobip_base_url` - Infobip API के लिए [आधार URL](https://www.infobip.com/docs/essentials/base-url)। आप डिफ़ॉल्ट मान `https://api.infobip.com/` का उपयोग कर सकते हैं।

आप `infobip_api_key` और `infobip_base_url` को पर्यावरण चर `INFOBIP_API_KEY` और `INFOBIP_BASE_URL` के रूप में भी प्रदान कर सकते हैं।

## एक SMS भेजना

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

## एक ईमेल भेजना

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

# एक एजेंट के अंदर इसका उपयोग कैसे करें

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
