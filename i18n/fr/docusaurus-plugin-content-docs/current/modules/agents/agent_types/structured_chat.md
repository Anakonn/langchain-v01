---
sidebar_position: 5
translated: true
---

# Chat structuré

L'agent de chat structuré est capable d'utiliser des outils multi-entrées.

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

## Initialiser les outils

Nous allons tester l'agent en utilisant Tavily Search

```python
tools = [TavilySearchResults(max_results=1)]
```

## Créer l'agent

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/structured-chat-agent")
```

```python
# Choose the LLM that will drive the agent
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-1106")

# Construct the JSON agent
agent = create_structured_chat_agent(llm, tools, prompt)
```

## Exécuter l'agent

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction:

{
  "action": "tavily_search_results_json",
  "action_input": {"query": "LangChain"}
}

[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mAction:

{
  "action": "Final Answer",
  "action_input": "LangChain is an open source orchestration framework for the development of applications using large language models. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and supports various large language model providers such as OpenAI, Google, and IBM. It supports Python and Javascript languages."
}

[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open source orchestration framework for the development of applications using large language models. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and supports various large language model providers such as OpenAI, Google, and IBM. It supports Python and Javascript languages.'}
```

## Utiliser avec l'historique de chat

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name? Do not use tools unless you have to",
        "chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="Hello Bob! How can I assist you today?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mCould not parse LLM output: I understand. Your name is Bob.[0mInvalid or incomplete response[32;1m[1;3mCould not parse LLM output: Apologies for any confusion. Your name is Bob.[0mInvalid or incomplete response[32;1m[1;3m{
  "action": "Final Answer",
  "action_input": "Your name is Bob."
}[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Do not use tools unless you have to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
