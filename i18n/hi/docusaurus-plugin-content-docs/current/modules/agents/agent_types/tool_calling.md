---
sidebar_label: टूल कॉलिंग
sidebar_position: 0
translated: true
---

# टूल कॉलिंग एजेंट

[टूल कॉलिंग](/docs/modules/model_io/chat/function_calling) किसी मॉडल को यह पता लगाने की अनुमति देता है कि एक या एक से अधिक टूल को कॉल किया जाना चाहिए और उन टूलों को पास किए जाने वाले इनपुट के साथ प्रतिक्रिया देता है। एक API कॉल में, आप टूलों का वर्णन कर सकते हैं और मॉडल को इन टूलों को कॉल करने के लिए JSON जैसे संरचित ऑब्जेक्ट आउटपुट करने के लिए बुद्धिमानी से चुनने की अनुमति दे सकते हैं। टूल API का लक्ष्य जेनरिक टेक्स्ट पूर्णता या चैट API का उपयोग करके किए जा सकने वाले से अधिक विश्वसनीय और उपयोगी टूल कॉल वापस करना है।

हम इस संरचित आउटपुट का लाभ उठा सकते हैं, जिसके साथ-साथ आप एक [टूल कॉलिंग चैट मॉडल](/docs/integrations/chat/) से कई टूल को बाइंड कर सकते हैं और मॉडल को उनमें से किसे कॉल करना है, यह चुनने की अनुमति दे सकते हैं, एक ऐसा एजेंट बनाने के लिए जो बार-बार टूल कॉल करता है और एक क्वेरी को हल करने तक परिणाम प्राप्त करता है।

यह [OpenAI टूल एजेंट](/docs/modules/agents/agent_types/openai_tools/) का एक अधिक सामान्यीकृत संस्करण है, जो OpenAI के टूल कॉलिंग के विशिष्ट शैली के लिए डिज़ाइन किया गया था। यह LangChain के ToolCall इंटरफ़ेस का उपयोग करके एक व्यापक श्रृंखला के प्रदाता कार्यान्वयनों का समर्थन करता है, जैसे [Anthropic](/docs/integrations/chat/anthropic/), [Google Gemini](/docs/integrations/chat/google_vertex_ai_palm/), और [Mistral](/docs/integrations/chat/mistralai/) के अलावा [OpenAI](/docs/integrations/chat/openai/)।

## सेटअप

टूल कॉलिंग का समर्थन करने वाले किसी भी मॉडल का उपयोग इस एजेंट में किया जा सकता है। आप यहां देख सकते हैं कि कौन से मॉडल टूल कॉलिंग का समर्थन करते हैं [यहां](/docs/integrations/chat/)

यह डेमो [Tavily](https://app.tavily.com) का उपयोग करता है, लेकिन आप किसी अन्य [बिल्ट-इन टूल](/docs/integrations/tools) को भी स्वैप कर सकते हैं या [कस्टम टूल](/docs/modules/tools/custom_tools/) जोड़ सकते हैं।
आपको एक API कुंजी के लिए साइन अप करना होगा और इसे `process.env.TAVILY_API_KEY` के रूप में सेट करना होगा।

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  hideCohere
/>

```python
# | output: false
# | echo: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

## टूल्स को इनिशियलाइज़ करें

हम पहले एक ऐसा टूल बनाएंगे जो वेब को खोज सकता है:

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
```

## एजेंट बनाएं

अब, आइए हमारे टूल कॉलिंग एजेंट को इनिशियलाइज़ करें:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Make sure to use the tavily_search_results_json tool for information.",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Construct the Tools agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

## एजेंट चलाएं

अब, चलिए हम उस कार्यपालक को प्रारंभ करते हैं जो हमारे एजेंट को चलाएगा और इसे आमंत्रित करेंगे!

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`
responded: [{'id': 'toolu_01QxrrT9srzkYCNyEZMDhGeg', 'input': {'query': 'LangChain'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}]

[0m[36;1m[1;3m[{'url': 'https://github.com/langchain-ai/langchain', 'content': 'About\n⚡ Building applications with LLMs through composability ⚡\nResources\nLicense\nCode of conduct\nSecurity policy\nStars\nWatchers\nForks\nReleases\n291\nPackages\n0\nUsed by 39k\nContributors\n1,848\nLanguages\nFooter\nFooter navigation Latest commit\nGit stats\nFiles\nREADME.md\n🦜️🔗 LangChain\n⚡ Building applications with LLMs through composability ⚡\nLooking for the JS/TS library? ⚡ Building applications with LLMs through composability ⚡\nLicense\nlangchain-ai/langchain\nName already in use\nUse Git or checkout with SVN using the web URL.\n 📖 Documentation\nPlease see here for full documentation, which includes:\n💁 Contributing\nAs an open-source project in a rapidly developing field, we are extremely open to contributions, whether it be in the form of a new feature, improved infrastructure, or better documentation.\n What can you build with LangChain?\n❓ Retrieval augmented generation\n💬 Analyzing structured data\n🤖 Chatbots\nAnd much more!'}][0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mLangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:

- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.

- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.

- Building chatbots and agents - Frameworks for building conversational AI applications.

- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.

The library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:\n\n- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.\n\n- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.\n\n- Building chatbots and agents - Frameworks for building conversational AI applications.\n\n- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.\n\nThe library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.'}
```

:::tip
[LangSmith trace](https://smith.langchain.com/public/2f956a2e-0820-47c4-a798-c83f024e5ca1/r)
:::

## चैट इतिहास के साथ उपयोग करना

इस प्रकार का एजेंट वैकल्पिक रूप से पिछले वार्तालाप टर्न को प्रतिनिधित्व करने वाले चैट संदेशों को ले सकता है। यह पिछले इतिहास का उपयोग करके संवादात्मक रूप से प्रतिक्रिया दे सकता है। अधिक जानकारी के लिए, [एजेंट त्वरित शुरुआत के इस खंड](/docs/modules/agents/quick_start#adding-in-memory) देखें।

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

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mBased on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': "Based on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name."}
```

:::tip
[LangSmith trace](https://smith.langchain.com/public/e21ececb-2e60-49e5-9f06-a91b0fb11fb8/r)
:::
