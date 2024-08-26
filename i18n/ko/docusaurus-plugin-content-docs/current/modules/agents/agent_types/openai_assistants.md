---
sidebar_class_name: hidden
translated: true
---

# OpenAI 어시스턴트

> [Assistants API](https://platform.openai.com/docs/assistants/overview)를 사용하면 자신의 애플리케이션 내에서 AI 어시스턴트를 구축할 수 있습니다. 어시스턴트에는 지침이 있으며 모델, 도구 및 지식을 활용하여 사용자 쿼리에 응답할 수 있습니다. Assistants API는 현재 세 가지 유형의 도구를 지원합니다: Code Interpreter, Retrieval, 그리고 Function calling

OpenAI 어시스턴트와 상호 작용할 수 있는 방법은 OpenAI 도구 또는 사용자 정의 도구를 사용하는 것입니다. OpenAI 도구만 사용하는 경우 어시스턴트를 직접 호출하고 최종 답변을 받을 수 있습니다. 사용자 정의 도구를 사용하는 경우 내장된 AgentExecutor를 사용하거나 자신의 실행기를 쉽게 작성할 수 있습니다.

아래에서는 어시스턴트와 상호 작용하는 다양한 방법을 보여줍니다. 간단한 예로, 코드를 작성하고 실행할 수 있는 수학 튜터를 만들어 보겠습니다.

### OpenAI 도구만 사용하기

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

### LangChain 에이전트와 임의의 도구 사용하기

이제 자체 도구를 사용하여 이 기능을 다시 만들어 보겠습니다. 이 예에서는 [E2B sandbox runtime tool](https://e2b.dev/docs?ref=landing-page-get-started)을 사용할 것입니다.

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

#### AgentExecutor 사용하기

OpenAIAssistantRunnable은 AgentExecutor와 호환되므로 에이전트로 직접 전달할 수 있습니다. AgentExecutor는 호출된 도구를 호출하고 도구 출력을 Assistants API에 업로드하는 작업을 처리합니다. 또한 내장된 LangSmith 추적 기능도 제공합니다.

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

[LangSmith trace](https://smith.langchain.com/public/6750972b-0849-4beb-a8bb-353d424ffade/r)

:::

#### 사용자 정의 실행

또는 LCEL을 사용하여 자체 실행 루프를 쉽게 작성할 수 있습니다. 이를 통해 실행에 대한 완전한 제어권을 가질 수 있습니다.

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

## 기존 스레드 사용하기

기존 스레드를 사용하려면 에이전트를 호출할 때 "thread_id"를 전달하면 됩니다.

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

## 기존 어시스턴트 사용하기

기존 어시스턴트를 사용하려면 `assistant_id`로 `OpenAIAssistantRunnable`을 직접 초기화할 수 있습니다.

```python
agent = OpenAIAssistantRunnable(assistant_id="<ASSISTANT_ID>", as_agent=True)
```
