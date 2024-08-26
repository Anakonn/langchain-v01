---
translated: true
---

# Shell (bash)

Donner aux agents l'accès au shell est puissant (bien que risqué en dehors d'un environnement isolé).

Le LLM peut l'utiliser pour exécuter n'importe quelle commande shell. Un cas d'utilisation courant pour cela est de permettre au LLM d'interagir avec votre système de fichiers local.

**Remarque :** L'outil Shell ne fonctionne pas avec le système d'exploitation Windows.

```python
from langchain_community.tools import ShellTool

shell_tool = ShellTool()
```

```python
print(shell_tool.run({"commands": ["echo 'Hello World!'", "time"]}))
```

```output
Hello World!

real	0m0.000s
user	0m0.000s
sys	0m0.000s

/Users/wfh/code/lc/lckg/langchain/tools/shell/tool.py:34: UserWarning: The shell tool has no safeguards by default. Use at your own risk.
  warnings.warn(
```

### Utilisation avec les agents

Comme pour tous les outils, ceux-ci peuvent être donnés à un agent pour accomplir des tâches plus complexes. Faisons en sorte que l'agent récupère quelques liens à partir d'une page web.

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

shell_tool.description = shell_tool.description + f"args {shell_tool.args}".replace(
    "{", "{{"
).replace("}", "}}")
self_ask_with_search = initialize_agent(
    [shell_tool], llm, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
self_ask_with_search.run(
    "Download the langchain.com webpage and grep for all urls. Return only a sorted list of them. Be sure to use double quotes."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: What is the task?
Thought: We need to download the langchain.com webpage and extract all the URLs from it. Then we need to sort the URLs and return them.
Action:

{
  "action": "shell",
  "action_input": {
    "commands": [
      "curl -s https://langchain.com | grep -o 'http[s]*://[^\" ]*' | sort"
    ]
  }
}

[0m

/Users/wfh/code/lc/lckg/langchain/tools/shell/tool.py:34: UserWarning: The shell tool has no safeguards by default. Use at your own risk.
  warnings.warn(


Observation: [36;1m[1;3mhttps://blog.langchain.dev/
https://discord.gg/6adMQxSpJS
https://docs.langchain.com/docs/
https://github.com/hwchase17/chat-langchain
https://github.com/hwchase17/langchain
https://github.com/hwchase17/langchainjs
https://github.com/sullivan-sean/chat-langchainjs
https://js.langchain.com/docs/
https://python.langchain.com/en/latest/
https://twitter.com/langchainai
[0m
Thought:[32;1m[1;3mThe URLs have been successfully extracted and sorted. We can return the list of URLs as the final answer.
Final Answer: ["https://blog.langchain.dev/", "https://discord.gg/6adMQxSpJS", "https://docs.langchain.com/docs/", "https://github.com/hwchase17/chat-langchain", "https://github.com/hwchase17/langchain", "https://github.com/hwchase17/langchainjs", "https://github.com/sullivan-sean/chat-langchainjs", "https://js.langchain.com/docs/", "https://python.langchain.com/en/latest/", "https://twitter.com/langchainai"][0m

[1m> Finished chain.[0m
```

```output
'["https://blog.langchain.dev/", "https://discord.gg/6adMQxSpJS", "https://docs.langchain.com/docs/", "https://github.com/hwchase17/chat-langchain", "https://github.com/hwchase17/langchain", "https://github.com/hwchase17/langchainjs", "https://github.com/sullivan-sean/chat-langchainjs", "https://js.langchain.com/docs/", "https://python.langchain.com/en/latest/", "https://twitter.com/langchainai"]'
```
