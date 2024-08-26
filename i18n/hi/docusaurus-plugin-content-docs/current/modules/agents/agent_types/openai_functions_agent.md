---
sidebar_position: 1
translated: true
---

# OpenAI कार्य

:::caution

OpenAI API ने `functions` को `tools` के पक्ष में डिप्रीकेट कर दिया है। दोनों के बीच अंतर यह है कि `tools` API मॉडल को एक साथ कई कार्यों को कॉल करने की अनुमति देता है, जिससे कुछ वास्तुकला में प्रतिक्रिया समय में कमी आ सकती है। OpenAI मॉडलों के लिए एजेंट उपयोग करना अनुशंसित है।

अधिक जानकारी के लिए निम्नलिखित लिंक देखें:

[OpenAI Tools](/docs/modules/agents/agent_types/openai_tools/)

[OpenAI chat create](https://platform.openai.com/docs/api-reference/chat/create)

[OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
:::

कुछ OpenAI मॉडल (जैसे gpt-3.5-turbo-0613 और gpt-4-0613) को यह पता लगाने के लिए फाइन-ट्यून किया गया है कि कब कार्य को कॉल किया जाना चाहिए और उन कार्यों को कॉल करने के लिए इनपुट को आउटपुट के रूप में JSON ऑब्जेक्ट के रूप में प्रदान करना चाहिए। OpenAI Function APIs का लक्ष्य सामान्य पाठ पूर्णता या चैट API की तुलना में वैध और उपयोगी कार्य कॉल को अधिक विश्वसनीय रूप से वापस करना है।

कई ओपन सोर्स मॉडल ने कार्य कॉल के लिए समान प्रारूप को अपनाया है और मॉडल को भी फाइन-ट्यून किया है कि कब कार्य को कॉल किया जाना चाहिए।

OpenAI Functions Agent इन मॉडलों के साथ काम करने के लिए डिज़ाइन किया गया है।

`openai`, `tavily-python` पैकेज इंस्टॉल करें जो LangChain पैकेज के आंतरिक रूप से आवश्यक हैं।

:::tip
`functions` प्रारूप ओपन सोर्स मॉडल और प्रदाताओं के लिए प्रासंगिक बना रहता है जिन्होंने इसे अपनाया है, और यह एजेंट ऐसे मॉडलों के लिए काम करने की उम्मीद है।
:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

## उपकरण प्रारंभ करें

हम पहले कुछ उपकरण बनाएंगे जिनका उपयोग कर सकते हैं।

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

```python
tools = [TavilySearchResults(max_results=1)]
```

## एजेंट बनाएं

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
```

```python
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
# Choose the LLM that will drive the agent
llm = ChatOpenAI(model="gpt-3.5-turbo-1106")

# Construct the OpenAI Functions agent
agent = create_openai_functions_agent(llm, tools, prompt)
```

## एजेंट चलाएं

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).'}
```

## चैट इतिहास के साथ उपयोग करना

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name?",
        "chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="Hello Bob! How can I assist you today?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Bob.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name?",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
