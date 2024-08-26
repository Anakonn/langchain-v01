---
sidebar_class_name: hidden
translated: true
---

# OpenAI सहायक

> [Assistants API](https://platform.openai.com/docs/assistants/overview) आपको अपने अनुप्रयोगों में AI सहायकों को बनाने की अनुमति देता है। एक सहायक के निर्देश होते हैं और वह मॉडल, उपकरण और ज्ञान का उपयोग करके उपयोगकर्ता प्रश्नों का उत्तर देने में सक्षम होता है। Assistants API वर्तमान में तीन प्रकार के उपकरणों का समर्थन करता है: कोड व्याख्याता, पुनर्प्राप्ति और कार्य कॉलिंग

आप OpenAI उपकरणों या कस्टम उपकरणों का उपयोग करके OpenAI सहायकों के साथ बातचीत कर सकते हैं। केवल OpenAI उपकरणों का उपयोग करते समय, आप सीधे सहायक को आमंत्रित कर सकते हैं और अंतिम उत्तर प्राप्त कर सकते हैं। कस्टम उपकरणों का उपयोग करते समय, आप AgentExecutor का उपयोग करके सहायक और उपकरण निष्पादन लूप चला सकते हैं या आसानी से अपना स्वयं का निष्पादक लिख सकते हैं।

नीचे हम सहायकों के साथ बातचीत करने के विभिन्न तरीके दिखाते हैं। एक सरल उदाहरण के रूप में, आइए एक गणित ट्यूटर बनाएं जो कोड लिख और चला सकता है।

### केवल OpenAI उपकरणों का उपयोग करना

```python
from langchain.agents.openai_assistant import OpenAIAssistantRunnable
```

```python
interpreter_assistant = OpenAIAssistantRunnable.create_assistant(
    name="langchain assistant",
    instructions="You are a personal math tutor. Write and run code to answer math questions.",
    tools=[{"type": "code_interpreter"}],
    model="gpt-4-1106-preview",
)
output = interpreter_assistant.invoke({"content": "What's 10 - 4 raised to the 2.7"})
output
```

```output
[ThreadMessage(id='msg_qgxkD5kvkZyl0qOaL4czPFkZ', assistant_id='asst_0T8S7CJuUa4Y4hm1PF6n62v7', content=[MessageContentText(text=Text(annotations=[], value='The result of the calculation \\(10 - 4^{2.7}\\) is approximately \\(-32.224\\).'), type='text')], created_at=1700169519, file_ids=[], metadata={}, object='thread.message', role='assistant', run_id='run_aH3ZgSWNk3vYIBQm3vpE8tr4', thread_id='thread_9K6cYfx1RBh0pOWD8SxwVWW9')]
```

### LangChain एजेंट के रूप में임의 उपकरणों के साथ

अब आइए इस कार्यक्षमता को अपने स्वयं के उपकरणों का उपयोग करके पुनर्निर्मित करें। इस उदाहरण के लिए हम [E2B सैंडबॉक्स रनटाइम उपकरण](https://e2b.dev/docs?ref=landing-page-get-started) का उपयोग करेंगे।

```python
%pip install --upgrade --quiet  e2b duckduckgo-search
```

```python
import getpass

from langchain_community.tools import DuckDuckGoSearchRun, E2BDataAnalysisTool

tools = [E2BDataAnalysisTool(api_key=getpass.getpass()), DuckDuckGoSearchRun()]
```

```python
agent = OpenAIAssistantRunnable.create_assistant(
    name="langchain assistant e2b tool",
    instructions="You are a personal math tutor. Write and run code to answer math questions. You can also search the internet.",
    tools=tools,
    model="gpt-4-1106-preview",
    as_agent=True,
)
```

#### AgentExecutor का उपयोग करना

OpenAIAssistantRunnable AgentExecutor के साथ संगत है, इसलिए हम इसे सीधे एजेंट के रूप में निष्पादक में पास कर सकते हैं। AgentExecutor कॉल किए गए उपकरणों को कॉल करने और उपकरण आउटपुट को Assistants API पर अपलोड करने का प्रबंधन करता है। इसके अलावा, यह बिल्ट-इन LangSmith ट्रेसिंग के साथ आता है।

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke({"content": "What's the weather in SF today divided by 2.7"})
```

```output
{'content': "What's the weather in SF today divided by 2.7",
 'output': "The search results indicate that the weather in San Francisco is 67 °F. Now I will divide this temperature by 2.7 and provide you with the result. Please note that this is a mathematical operation and does not represent a meaningful physical quantity.\n\nLet's calculate 67 °F divided by 2.7.\nThe result of dividing the current temperature in San Francisco, which is 67 °F, by 2.7 is approximately 24.815.",
 'thread_id': 'thread_hcpYI0tfpB9mHa9d95W7nK2B',
 'run_id': 'run_qOuVmPXS9xlV3XNPcfP8P9W2'}
```

:::tip

[LangSmith ट्रेस](https://smith.langchain.com/public/6750972b-0849-4beb-a8bb-353d424ffade/r)

:::

#### कस्टम निष्पादन

या LCEL के साथ, हम सहायक को चलाने के लिए अपना स्वयं का निष्पादन लूप आसानी से लिख सकते हैं। यह हमें पूर्ण नियंत्रण प्रदान करता है।

```python
agent = OpenAIAssistantRunnable.create_assistant(
    name="langchain assistant e2b tool",
    instructions="You are a personal math tutor. Write and run code to answer math questions.",
    tools=tools,
    model="gpt-4-1106-preview",
    as_agent=True,
)
```

```python
from langchain_core.agents import AgentFinish


def execute_agent(agent, tools, input):
    tool_map = {tool.name: tool for tool in tools}
    response = agent.invoke(input)
    while not isinstance(response, AgentFinish):
        tool_outputs = []
        for action in response:
            tool_output = tool_map[action.tool].invoke(action.tool_input)
            print(action.tool, action.tool_input, tool_output, end="\n\n")
            tool_outputs.append(
                {"output": tool_output, "tool_call_id": action.tool_call_id}
            )
        response = agent.invoke(
            {
                "tool_outputs": tool_outputs,
                "run_id": action.run_id,
                "thread_id": action.thread_id,
            }
        )

    return response
```

```python
response = execute_agent(agent, tools, {"content": "What's 10 - 4 raised to the 2.7"})
print(response.return_values["output"])
```

```output
e2b_data_analysis {'python_code': 'result = 10 - 4 ** 2.7\nprint(result)'} {"stdout": "-32.22425314473263", "stderr": "", "artifacts": []}

\( 10 - 4^{2.7} \) equals approximately -32.224.
```

## मौजूदा थ्रेड का उपयोग करना

मौजूदा थ्रेड का उपयोग करने के लिए, हमें केवल एजेंट को आमंत्रित करते समय "thread_id" पास करना होता है।

```python
next_response = execute_agent(
    agent,
    tools,
    {"content": "now add 17.241", "thread_id": response.return_values["thread_id"]},
)
print(next_response.return_values["output"])
```

```output
e2b_data_analysis {'python_code': 'result = 10 - 4 ** 2.7 + 17.241\nprint(result)'} {"stdout": "-14.983253144732629", "stderr": "", "artifacts": []}

\( 10 - 4^{2.7} + 17.241 \) equals approximately -14.983.
```

## मौजूदा सहायक का उपयोग करना

मौजूदा सहायक का उपयोग करने के लिए, हम `assistant_id` के साथ `OpenAIAssistantRunnable` को सीधे प्रारंभ कर सकते हैं।

```python
agent = OpenAIAssistantRunnable(assistant_id="<ASSISTANT_ID>", as_agent=True)
```
