---
translated: true
---

# Asistentes de OpenAI

> La [API de Asistentes](https://platform.openai.com/docs/assistants/overview) permite construir asistentes de IA dentro de tus propias aplicaciones. Un Asistente tiene instrucciones y puede aprovechar modelos, herramientas y conocimientos para responder a las consultas de los usuarios. La API de Asistentes actualmente admite tres tipos de herramientas: Intérprete de código, Recuperación y Llamada a funciones.

Puedes interactuar con los Asistentes de OpenAI utilizando herramientas de OpenAI o herramientas personalizadas. Al usar exclusivamente herramientas de OpenAI, puedes invocar al asistente directamente y obtener respuestas finales. Al usar herramientas personalizadas, puedes ejecutar el bucle de ejecución del asistente y la herramienta utilizando el AgentExecutor incorporado o escribir fácilmente tu propio ejecutor.

A continuación, mostramos las diferentes formas de interactuar con los Asistentes. Como ejemplo sencillo, construiremos un tutor de matemáticas que pueda escribir y ejecutar código.

### Usando solo herramientas de OpenAI

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

### Como un agente LangChain con herramientas arbitrarias

Ahora recrearemosesta funcionalidad utilizando nuestras propias herramientas. Para este ejemplo, utilizaremos la [herramienta de entorno de ejecución E2B sandbox](https://e2b.dev/docs?ref=landing-page-get-started).

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

#### Usando AgentExecutor

OpenAIAssistantRunnable es compatible con AgentExecutor, por lo que podemos pasarlo directamente como un agente al ejecutor. AgentExecutor se encarga de llamar a las herramientas invocadas y cargar los resultados de las herramientas de vuelta a la API de Asistentes. Además, viene con seguimiento de LangSmith incorporado.

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

[Seguimiento de LangSmith](https://smith.langchain.com/public/6750972b-0849-4beb-a8bb-353d424ffade/r)

:::

#### Ejecución personalizada

O con LCEL podemos escribir fácilmente nuestro propio bucle de ejecución para ejecutar el asistente. Esto nos da un control total sobre la ejecución.

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

## Usando un hilo existente

Para usar un hilo existente, solo necesitamos pasar el "thread_id" al invocar al agente.

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

## Usando un Asistente existente

Para usar un Asistente existente, podemos inicializar directamente `OpenAIAssistantRunnable` con un `assistant_id`.

```python
agent = OpenAIAssistantRunnable(assistant_id="<ASSISTANT_ID>", as_agent=True)
```
