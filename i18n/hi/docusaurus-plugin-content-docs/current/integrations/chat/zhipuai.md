---
sidebar_label: ZHIPU AI
translated: true
---

# ZHIPU AI

यह नोटबुक [ZHIPU AI API](https://open.bigmodel.cn/dev/api) का उपयोग करने का तरीका दिखाता है LangChain के साथ langchain.chat_models.ChatZhipuAI।

>[*GLM-4*](https://open.bigmodel.cn/) एक बहुभाषी बड़ा भाषा मॉडल है जो मानव इरादे के साथ संरेखित है, जिसमें प्रश्न-उत्तर, बहु-दौर संवाद और कोड जनन की क्षमताएं हैं। नई पीढ़ी के आधार मॉडल GLM-4 का समग्र प्रदर्शन पिछली पीढ़ी की तुलना में काफी बेहतर है, जो लंबे संदर्भों का समर्थन करता है; मजबूत बहुमाध्यमिकता; तेज अनुमान गति, अधिक समवर्ती, अनुमान लागत को काफी कम करने का समर्थन करता है; इसके साथ ही, GLM-4 बुद्धिमान एजेंटों की क्षमताओं को बढ़ाता है।

## शुरू करना

### स्थापना

पहले, सुनिश्चित करें कि आपके Python वातावरण में zhipuai पैकेज स्थापित है। निम्नलिखित कमांड चलाएं:

```python
#!pip install --upgrade httpx httpx-sse PyJWT
```

### आवश्यक मॉड्यूल आयात करना

स्थापना के बाद, अपने Python स्क्रिप्ट में आवश्यक मॉड्यूल आयात करें:

```python
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### अपने API कुंजी को सेट करना

[ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys) में साइन इन करें और हमारे मॉडल तक पहुंच प्राप्त करने के लिए एक API कुंजी प्राप्त करें।

```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### ZHIPU AI चैट मॉडल को प्रारंभ करना

चैट मॉडल को इस प्रकार प्रारंभ करें:

```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### मूलभूत उपयोग

मॉडल को इस तरह से प्रणाली और मानव संदेशों के साथ आह्वान करें:

```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```

```python
response = chat.invoke(messages)
print(response.content)  # Displays the AI-generated poem
```

## उन्नत सुविधाएं

### स्ट्रीमिंग समर्थन

निरंतर बातचीत के लिए, स्ट्रीमिंग सुविधा का उपयोग करें:

```python
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```

```python
streaming_chat(messages)
```

### असिंक्रोनस कॉल

गैर-अवरोधक कॉल के लिए, असिंक्रोनस दृष्टिकोण का उपयोग करें:

```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

```python
response = await async_chat.agenerate([messages])
print(response)
```

### कार्यों के साथ उपयोग करना

GLM-4 मॉडल को कार्य कॉल के साथ भी उपयोग किया जा सकता है, एक सरल LangChain json_chat_agent चलाने के लिए निम्नलिखित कोड का उपयोग करें।

```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```
