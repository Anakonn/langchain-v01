---
sidebar_class_name: hidden
translated: true
---

# OpenAIアシスタント

> [Assistants API](https://platform.openai.com/docs/assistants/overview)を使うと、自分のアプリケーション内にAIアシスタントを構築できます。アシスタントには命令があり、モデル、ツール、知識を活用して、ユーザーの問い合わせに応答できます。Assistants APIは現在、3種類のツールをサポートしています: コード インタープリター、リトリーバル、関数呼び出し

OpenAIのツールまたはカスタムツールを使ってOpenAIアシスタントと対話できます。OpenAIのツールのみを使う場合は、アシスタントを直接呼び出して最終的な回答を得られます。カスタムツールを使う場合は、組み込みのAgentExecutorを使ってアシスタントとツールの実行ループを実行するか、独自のエグゼキューターを簡単に記述できます。

以下では、アシスタントとの様々な対話方法を示します。簡単な例として、コードを書いて実行できる数学のチューターを構築しましょう。

### OpenAIツールのみを使う

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

### LangChainエージェントと任意のツールを使う

次に、独自のツールを使ってこの機能を再現しましょう。この例では[E2Bサンドボックスランタイムツール](https://e2b.dev/docs?ref=landing-page-get-started)を使います。

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

#### AgentExecutorを使う

OpenAIAssistantRunnableはAgentExecutorと互換性があるので、エージェントとして直接渡すことができます。AgentExecutorは呼び出されたツールの呼び出しとAssistants APIへのツール出力のアップロードを処理します。さらに、組み込みのLangSmithトレースも備えています。

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

[LangSmithトレース](https://smith.langchain.com/public/6750972b-0849-4beb-a8bb-353d424ffade/r)

:::

#### カスタムの実行

または、LCELを使えば、アシスタントの実行ループを簡単に記述できます。これにより、実行を完全に制御できます。

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

## 既存のスレッドを使う

既存のスレッドを使うには、エージェントを呼び出す際に"thread_id"を渡すだけです。

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

## 既存のアシスタントを使う

既存のアシスタントを使うには、`assistant_id`を使って直接`OpenAIAssistantRunnable`を初期化できます。

```python
agent = OpenAIAssistantRunnable(assistant_id="<ASSISTANT_ID>", as_agent=True)
```
