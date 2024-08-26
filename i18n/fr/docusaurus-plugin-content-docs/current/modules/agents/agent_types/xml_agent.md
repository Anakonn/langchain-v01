---
sidebar_position: 2
translated: true
---

# Agent XML

Certains modèles de langage (comme Claude d'Anthropic) sont particulièrement performants pour le raisonnement/l'écriture en XML. Ceci explique comment utiliser un agent qui utilise XML lors de la sollicitation.

:::tip

* À utiliser avec des LLM réguliers, pas avec des modèles de chat.
* À utiliser uniquement avec des outils non structurés ; c'est-à-dire des outils qui acceptent une seule entrée sous forme de chaîne de caractères.
* Consultez la documentation [AgentTypes](/docs/modules/agents/agent_types/) pour plus de types d'agents.
:::

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_xml_agent
from langchain_anthropic.chat_models import ChatAnthropic
from langchain_community.tools.tavily_search import TavilySearchResults
```

## Initialiser les outils

Nous allons initialiser les outils que nous voulons utiliser.

```python
tools = [TavilySearchResults(max_results=1)]
```

## Créer un agent

Ci-dessous, nous utiliserons le constructeur intégré [create_xml_agent](https://api.python.langchain.com/en/latest/agents/langchain.agents.xml.base.create_xml_agent.html) de LangChain.

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/xml-agent-convo")
```

```python
# Choose the LLM that will drive the agent
llm = ChatAnthropic(model="claude-2.1")

# Construct the XML agent
agent = create_xml_agent(llm, tools, prompt)
```

## Exécuter l'agent

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m <tool>tavily_search_results_json</tool><tool_input>what is LangChain?[0m[36;1m[1;3m[{'url': 'https://aws.amazon.com/what-is/langchain/', 'content': 'What Is LangChain? What is LangChain?  How does LangChain work?  Why is LangChain important?  that LangChain provides to reduce development time.LangChain is an open source framework for building applications based on large language models (LLMs). LLMs are large deep-learning models pre-trained on large amounts of data that can generate responses to user queries—for example, answering questions or creating images from text-based prompts.'}][0m[32;1m[1;3m <final_answer>LangChain is an open source framework for building applications based on large language models (LLMs). It allows developers to leverage the power of LLMs to create applications that can generate responses to user queries, such as answering questions or creating images from text prompts. Key benefits of LangChain are reducing development time and effort compared to building custom LLMs from scratch.</final_answer>[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open source framework for building applications based on large language models (LLMs). It allows developers to leverage the power of LLMs to create applications that can generate responses to user queries, such as answering questions or creating images from text prompts. Key benefits of LangChain are reducing development time and effort compared to building custom LLMs from scratch.'}
```

## Utilisation avec l'historique de la discussion

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name? Only use a tool if needed, otherwise respond with Final Answer",
        # Notice that chat_history is a string, since this prompt is aimed at LLMs, not chat models
        "chat_history": "Human: Hi! My name is Bob\nAI: Hello Bob! Nice to meet you",
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m <final_answer>Your name is Bob.</final_answer>

Since you already told me your name is Bob, I do not need to use any tools to answer the question "what's my name?". I can provide the final answer directly that your name is Bob.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Only use a tool if needed, otherwise respond with Final Answer",
 'chat_history': 'Human: Hi! My name is Bob\nAI: Hello Bob! Nice to meet you',
 'output': 'Your name is Bob.'}
```

# Agents XML personnalisés

**Remarque :** Pour une plus grande personnalisation, nous vous recommandons de consulter [LangGraph](/docs/langgraph).

Voici un exemple d'implémentation d'un agent XML personnalisé, pour donner une idée de ce que fait `create_xml_agent` sous le capot.

```python
from langchain.agents.output_parsers import XMLAgentOutputParser
```

```python
# Logic for going from intermediate steps to a string to pass into model
# This is pretty tied to the prompt
def convert_intermediate_steps(intermediate_steps):
    log = ""
    for action, observation in intermediate_steps:
        log += (
            f"<tool>{action.tool}</tool><tool_input>{action.tool_input}"
            f"</tool_input><observation>{observation}</observation>"
        )
    return log


# Logic for converting tools to string to go in prompt
def convert_tools(tools):
    return "\n".join([f"{tool.name}: {tool.description}" for tool in tools])
```

La construction d'un agent à partir d'un élément exécutable implique généralement quelques éléments :

1. Le traitement des données pour les étapes intermédiaires. Celles-ci doivent être représentées d'une manière que le modèle de langage peut reconnaître. Cela devrait être assez étroitement lié aux instructions dans l'invite.

2. L'invite elle-même.

3. Le modèle, avec les jetons d'arrêt si nécessaire.

4. L'analyseur de sortie - doit être synchronisé avec la façon dont l'invite spécifie les éléments à mettre en forme.

```python
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: convert_intermediate_steps(
            x["intermediate_steps"]
        ),
    }
    | prompt.partial(tools=convert_tools(tools))
    | llm.bind(stop=["</tool_input>", "</final_answer>"])
    | XMLAgentOutputParser()
)
```

```python
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m<tool>tavily_search_results_json</tool>
<tool_input>what is LangChain[0m[36;1m[1;3m[{'url': 'https://www.techtarget.com/searchEnterpriseAI/definition/LangChain', 'content': "Everything you need to know\nWhat are the features of LangChain?\nLangChain is made up of the following modules that ensure the multiple components needed to make an effective NLP app can run smoothly:\nWhat are the integrations of LangChain?\nLangChain typically builds applications using integrations with LLM providers and external sources where data can be found and stored. What is synthetic data?\nExamples and use cases for LangChain\nThe LLM-based applications LangChain is capable of building can be applied to multiple advanced use cases within various industries and vertical markets, such as the following:\nReaping the benefits of NLP is a key of why LangChain is important. As the airline giant moves more of its data workloads to the cloud, tools from Intel's Granulate are making platforms such as ...\nThe vendor's new platform, now in beta testing, combines its existing lakehouse with AI to better enable users to manage and ...\n The following steps are required to use this:\nIn this scenario, the language model would be expected to take the two input variables -- the adjective and the content -- and produce a fascinating fact about zebras as its output.\n The goal of LangChain is to link powerful LLMs, such as OpenAI's GPT-3.5 and GPT-4, to an array of external data sources to create and reap the benefits of natural language processing (NLP) applications.\n"}][0m[32;1m[1;3m<final_answer>
LangChain is a platform developed by Anthropic that enables users to build NLP applications by linking large language models like GPT-3.5 and GPT-4 to external data sources. It provides modules for managing and integrating different components needed for NLP apps.

Some key capabilities and features of LangChain:

- Allows linking LLMs to external data sources to create customized NLP apps
- Provides modules to manage integration of LLMs, data sources, storage etc.
- Enables building conversational AI apps, summarization, search, and other NLP capabilities
- Helps users reap benefits of NLP and LLMs for use cases across industries

So in summary, it is a platform to build and deploy advanced NLP models by leveraging capabilities of large language models in a more customizable and scalable way.

[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': '\nLangChain is a platform developed by Anthropic that enables users to build NLP applications by linking large language models like GPT-3.5 and GPT-4 to external data sources. It provides modules for managing and integrating different components needed for NLP apps.\n\nSome key capabilities and features of LangChain:\n\n- Allows linking LLMs to external data sources to create customized NLP apps\n- Provides modules to manage integration of LLMs, data sources, storage etc. \n- Enables building conversational AI apps, summarization, search, and other NLP capabilities\n- Helps users reap benefits of NLP and LLMs for use cases across industries\n\nSo in summary, it is a platform to build and deploy advanced NLP models by leveraging capabilities of large language models in a more customizable and scalable way.\n\n'}
```
