---
sidebar_position: 0.1
translated: true
---

# OpenAI उपकरण

नए OpenAI मॉडल को इस बात का पता लगाने के लिए फाइन-ट्यून किया गया है कि **एक या अधिक** फ़ंक्शन(स) को कॉल करना चाहिए और उन इनपुट्स के साथ प्रतिक्रिया देना चाहिए जिन्हें इन फ़ंक्शन(स) को पास किया जाना चाहिए। एक API कॉल में, आप फ़ंक्शन्स का वर्णन कर सकते हैं और मॉडल को इन फ़ंक्शन्स को कॉल करने के लिए तर्कसंगत रूप से एक JSON ऑब्जेक्ट आउटपुट करने के लिए प्रोत्साहित कर सकते हैं। OpenAI उपकरण API का लक्ष्य एक सामान्य पाठ पूर्णता या चैट API का उपयोग करके किए जा सकने वाले से अधिक वैध और उपयोगी फ़ंक्शन कॉल वापस करना है।

OpenAI ने **एकल** फ़ंक्शन को कॉल करने की क्षमता को **फ़ंक्शन्स** के रूप में और **एक या अधिक** फ़ंक्शन को कॉल करने की क्षमता को **उपकरण** के रूप में नामित किया।

:::tip

OpenAI चैट API में, **फ़ंक्शन्स** अब एक पुरानी विकल्प माने जाते हैं जो **उपकरण** के पक्ष में डिप्रीकेट हो गए हैं।

यदि आप OpenAI मॉडल का उपयोग करके एजेंट बना रहे हैं, तो आपको OpenAI फ़ंक्शन्स एजेंट के बजाय इस OpenAI उपकरण एजेंट का उपयोग करना चाहिए।

**उपकरण** का उपयोग करने से मॉडल को अनुरोध करने की अनुमति मिलती है कि जब उचित हो तो एक से अधिक फ़ंक्शन को कॉल किया जाएगा।

कुछ स्थितियों में, यह एजेंट को अपने लक्ष्य को प्राप्त करने में लगने वाले समय को काफी कम कर सकता है।

देखें

* [OpenAI चैट बनाएं](https://platform.openai.com/docs/api-reference/chat/create)
* [OpenAI फ़ंक्शन कॉलिंग](https://platform.openai.com/docs/guides/function-calling)

:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

## उपकरण का प्रारंभ करना

इस एजेंट के लिए, हम इसे Tavily के साथ वेब खोजने की क्षमता देंगे।

```python
tools = [TavilySearchResults(max_results=1)]
```

## एजेंट बनाएं

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
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


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)'}
```

## चैट इतिहास के साथ उपयोग करना

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name? Don't use tools to look this up unless you NEED to",
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
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
