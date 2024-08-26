---
sidebar_class_name: hidden
translated: true
---

# Assistants OpenAI

> L'[API Assistants](https://platform.openai.com/docs/assistants/overview) vous permet de construire des assistants IA dans vos propres applications. Un assistant a des instructions et peut s'appuyer sur des modèles, des outils et des connaissances pour répondre aux requêtes des utilisateurs. L'API Assistants prend actuellement en charge trois types d'outils : interpréteur de code, récupération et appel de fonction.

Vous pouvez interagir avec les assistants OpenAI en utilisant les outils OpenAI ou des outils personnalisés. Lorsque vous utilisez exclusivement des outils OpenAI, vous pouvez simplement invoquer l'assistant directement et obtenir des réponses finales. Lorsque vous utilisez des outils personnalisés, vous pouvez exécuter la boucle d'exécution de l'assistant et de l'outil à l'aide d'AgentExecutor intégré ou écrire facilement votre propre exécuteur.

Ci-dessous, nous montrons les différentes façons d'interagir avec les assistants. Comme exemple simple, construisons un tuteur de mathématiques qui peut écrire et exécuter du code.

### Utilisation des outils OpenAI uniquement

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

### En tant qu'agent LangChain avec des outils arbitraires

Maintenant, recréons cette fonctionnalité à l'aide de nos propres outils. Pour cet exemple, nous utiliserons l'outil de runtime sandbox [E2B](https://e2b.dev/docs?ref=landing-page-get-started).

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

#### Utilisation d'AgentExecutor

L'OpenAIAssistantRunnable est compatible avec AgentExecutor, nous pouvons donc le passer directement en tant qu'agent à l'exécuteur. AgentExecutor gère l'appel des outils invoqués et le téléchargement des sorties d'outils vers l'API Assistants. De plus, il est fourni avec le traçage LangSmith intégré.

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

[Trace LangSmith](https://smith.langchain.com/public/6750972b-0849-4beb-a8bb-353d424ffade/r)

:::

#### Exécution personnalisée

Ou avec LCEL, nous pouvons facilement écrire notre propre boucle d'exécution pour exécuter l'assistant. Cela nous donne un contrôle total sur l'exécution.

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

## Utilisation d'un thread existant

Pour utiliser un thread existant, nous devons simplement passer l'"identifiant de thread" lors de l'invocation de l'agent.

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

## Utilisation d'un assistant existant

Pour utiliser un assistant existant, nous pouvons initialiser directement l'`OpenAIAssistantRunnable` avec un `identifiant d'assistant`.

```python
agent = OpenAIAssistantRunnable(assistant_id="<ASSISTANT_ID>", as_agent=True)
```
