---
fixed: true
translated: true
---

# 🦜🕸️LangGraph

[![Downloads](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

⚡ ग्राफ़ के रूप में भाषा एजेंट्स का निर्माण ⚡

## अवलोकन

[LangGraph](https://langchain-ai.github.io/langgraph/) एक लाइब्रेरी है जो LLMs के साथ राज्यपूर्ण, बहु-अभिनेता अनुप्रयोगों के निर्माण के लिए है।
[Pregel](https://research.google/pubs/pub37252/) और [Apache Beam](https://beam.apache.org/) से प्रेरित, LangGraph आपको नियमित पायथन फंक्शन्स (या [JS](https://github.com/langchain-ai/langgraphjs))) का उपयोग करते हुए चक्रीय गणना चरणों में कई चेन (या अभिनेताओं) को समन्वयित और चेकपॉइंट करने देता है। सार्वजनिक इंटरफ़ेस [NetworkX](https://networkx.org/documentation/latest/) से प्रेरणा लेता है।

मुख्य उपयोग आपके LLM अनुप्रयोग में **cycles** और **persistence** जोड़ने के लिए है। यदि आपको केवल त्वरित Directed Acyclic Graphs (DAGs) की आवश्यकता है, तो आप पहले ही [LangChain Expression Language](https://python.langchain.com/docs/expression_language/) का उपयोग करके इसे प्राप्त कर सकते हैं।

चक्रीय व्यवहारों के लिए चक्र महत्वपूर्ण हैं, जहां आप एक लूप में एक LLM को कॉल करते हैं, यह पूछते हुए कि अगला कार्य क्या करना है।

## इंस्टालेशन

```shell
pip install -U langgraph
```

## त्वरित शुरूआत

LangGraph के केंद्रीय अवधारणाओं में से एक राज्य है। प्रत्येक ग्राफ निष्पादन एक राज्य बनाता है जो ग्राफ में नोड्स के बीच निष्पादन के रूप में पारित होता है, और प्रत्येक नोड अपने निष्पादन के बाद अपने आंतरिक राज्य को अपने रिटर्न मूल्य के साथ अपडेट करता है। जिस तरह से ग्राफ अपने आंतरिक राज्य को अपडेट करता है, वह या तो चुने गए ग्राफ के प्रकार या एक कस्टम फंक्शन द्वारा परिभाषित होता है।

LangGraph में राज्य काफी सामान्य हो सकता है, लेकिन इसे सरल बनाए रखने के लिए, हम एक उदाहरण दिखाएंगे जहां ग्राफ का राज्य चैट संदेशों की एक सूची तक सीमित है, जो अंतर्निर्मित `MessageGraph` क्लास का उपयोग करता है। यह LangGraph को LangChain चैट मॉडल्स के साथ उपयोग करते समय सुविधाजनक है क्योंकि हम सीधे चैट मॉडल आउटपुट को रिटर्न कर सकते हैं।

पहले, LangChain OpenAI इंटीग्रेशन पैकेज इंस्टॉल करें:

```python
pip install langchain_openai
```

हमें कुछ पर्यावरण चर भी निर्यात करने की आवश्यकता है:

```shell
export OPENAI_API_KEY=sk-...
```

और अब हम तैयार हैं! नीचे दिया गया ग्राफ एकल नोड को `"oracle"` कहा जाता है जो एक चैट मॉडल को निष्पादित करता है, फिर परिणाम को लौटाता है:

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END, MessageGraph

model = ChatOpenAI(temperature=0)

graph = MessageGraph()

graph.add_node("oracle", model)
graph.add_edge("oracle", END)

graph.set_entry_point("oracle")

runnable = graph.compile()
```

चलो इसे चलाते हैं!

```python
runnable.invoke(HumanMessage("What is 1 + 1?"))
```

```python
[HumanMessage(content='What is 1 + 1?'), AIMessage(content='1 + 1 equals 2.')]
```

तो हमने यहाँ क्या किया? आइए इसे चरण दर चरण तोड़ें:

1. पहले, हम अपने मॉडल और एक `MessageGraph` को प्रारंभ करते हैं।
2. इसके बाद, हम ग्राफ में एकल नोड जोड़ते हैं, जिसे `"oracle"` कहा जाता है, जो दिए गए इनपुट के साथ मॉडल को कॉल करता है।
3. हम इस `"oracle"` नोड से विशेष स्ट्रिंग `END` (`"__end__"`) तक एक एज जोड़ते हैं। इसका मतलब है कि वर्तमान नोड के बाद निष्पादन समाप्त हो जाएगा।
4. हम `"oracle"` को ग्राफ के एंट्रीपॉइंट के रूप में सेट करते हैं।
5. हम ग्राफ को संकलित करते हैं, इसे निम्न-स्तरीय [pregel operations](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/) में अनुवादित करते हैं ताकि यह चलाया जा सके।

फिर, जब हम ग्राफ निष्पादित करते हैं:

1. LangGraph इनपुट संदेश को आंतरिक राज्य में जोड़ता है, फिर राज्य को एंट्रीपॉइंट नोड, `"oracle"` को पास करता है।
2. `"oracle"` नोड निष्पादित होता है, चैट मॉडल को आमंत्रित करता है।
3. चैट मॉडल एक `AIMessage` लौटाता है। LangGraph इसे राज्य में जोड़ता है।
4. निष्पादन विशेष `END` मान पर प्रगति करता है और अंतिम राज्य को आउटपुट करता है।

और परिणामस्वरूप, हमें आउटपुट के रूप में दो चैट संदेशों की एक सूची मिलती है।

### LCEL के साथ इंटरैक्शन

जो लोग पहले से ही LangChain से परिचित हैं, उनके लिए एक साइड नोट - `add_node` वास्तव में किसी भी फंक्शन या [runnable](https://python.langchain.com/docs/expression_language/interface/) को इनपुट के रूप में लेता है। ऊपर दिए गए उदाहरण में, मॉडल को "जैसा है" उपयोग किया गया था, लेकिन हम एक फंक्शन भी पास कर सकते थे:

```python
def call_oracle(messages: list):
    return model.invoke(messages)

graph.add_node("oracle", call_oracle)
```

बस यह सुनिश्चित करें कि आप इस तथ्य के प्रति जागरूक हैं कि [runnable](https://python.langchain.com/docs/expression_language/interface/) का इनपुट **पूरा वर्तमान राज्य** है। इसलिए यह विफल हो जाएगा:

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
# This will not work with MessageGraph!
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named {name} who always speaks in pirate dialect"),
    MessagesPlaceholder(variable_name="messages"),
])

chain = prompt | model

# State is a list of messages, but our chain expects a dict input:
#
# { "name": some_string, "messages": [] }
#
# Therefore, the graph will throw an exception when it executes here.
graph.add_node("oracle", chain)
```

## सशर्त एज

अब, चलिए कुछ कम सामान्य पर चलते हैं। LLMs गणित के साथ संघर्ष करते हैं, इसलिए चलिए LLM को [tool calling](https://python.langchain.com/docs/modules/model_io/chat/function_calling/) का उपयोग करते हुए `"multiply"` नोड को सशर्त रूप से कॉल करने दें।

हम अपने ग्राफ को फिर से बनाएंगे जिसमें एक अतिरिक्त `"multiply"` होगा जो सबसे हाल के संदेश का परिणाम लेगा, अगर यह एक टूल कॉल है, और परिणाम की गणना करेगा।
हम OpenAI मॉडल को एक टूल के रूप में कैलकुलेटर की स्कीमा को [bind](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) भी करेंगे ताकि मॉडल आवश्यक टूल का उपयोग कर सके जो वर्तमान राज्य का उत्तर देने के लिए आवश्यक हो:

```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def multiply(first_number: int, second_number: int):
    """Multiplies two numbers together."""
    return first_number * second_number

model = ChatOpenAI(temperature=0)
model_with_tools = model.bind_tools([multiply])

builder = MessageGraph()

builder.add_node("oracle", model_with_tools)

tool_node = ToolNode([multiply])
builder.add_node("multiply", tool_node)

builder.add_edge("multiply", END)

builder.set_entry_point("oracle")
```

अब चलिए सोचते हैं - हमें क्या हुआ होना चाहिए?

- यदि `"oracle"` नोड एक संदेश लौटाता है जो एक टूल कॉल की अपेक्षा करता है, तो हम `"multiply"` नोड को निष्पादित करना चाहते हैं
- यदि नहीं, तो हम बस निष्पादन समाप्त कर सकते हैं

हम इसे **सशर्त एजों** का उपयोग करके प्राप्त कर सकते हैं, जो वर्तमान राज्य पर एक फंक्शन को कॉल करता है और फंक्शन के आउटपुट को एक नोड पर रूट करता है।

यहाँ यह कैसा दिखता है:

```python
from typing import Literal

def router(state: List[BaseMessage]) -> Literal["multiply", "__end__"]:
    tool_calls = state[-1].additional_kwargs.get("tool_calls", [])
    if len(tool_calls):
        return "multiply"
    else:
        return "__end__"

builder.add_conditional_edges("oracle", router)
```

यदि मॉडल आउटपुट में एक टूल कॉल शामिल है, तो हम `"multiply"` नोड पर जाते हैं। अन्यथा, हम निष्पादन समाप्त करते हैं।

बहुत बढ़िया! अब बस ग्राफ को संकलित करना और इसे आजमाना बाकी है। गणित-संबंधी प्रश्न कैलकुलेटर टूल पर रूटेड होते हैं:

```python
runnable = builder.compile()

runnable.invoke(HumanMessage("What is 123 * 456?"))
```

```output

[HumanMessage(content='What is 123 * 456?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_OPbdlm8Ih1mNOObGf3tMcNgb', 'function': {'arguments': '{"first_number":123,"second_number":456}', 'name': 'multiply'}, 'type': 'function'}]}),
 ToolMessage(content='56088', tool_call_id='call_OPbdlm8Ih1mNOObGf3tMcNgb')]
```

जबकि बातचीत के उत्तर सीधे आउटपुट होते हैं:

```python
runnable.invoke(HumanMessage("What is your name?"))
```

```output
[HumanMessage(content='What is your name?'),
 AIMessage(content='My name is Assistant. How can I assist you today?')]
```

## चक्र

अब, चलिए एक अधिक सामान्य चक्रीय उदाहरण पर चलते हैं। हम LangChain से `AgentExecutor` क्लास को फिर से बनाएंगे। एजेंट स्वयं चैट मॉडल्स और टूल कॉलिंग का उपयोग करेगा।
यह एजेंट अपनी सभी स्थिति को संदेशों की एक सूची के रूप में प्रदर्शित करेगा।

हमें कुछ LangChain समुदाय पैकेज, साथ ही एक उदाहरण टूल के रूप में [Tavily](https://app.tavily.com/sign-in) को इंस्टॉल करने की आवश्यकता होगी।

```shell
pip install -U langgraph langchain_openai tavily-python
```

हमें OpenAI और Tavily API एक्सेस के लिए कुछ अतिरिक्त पर्यावरण चर भी निर्यात करने की आवश्यकता है।

```shell
export OPENAI_API_KEY=sk-...
export TAVILY_API_KEY=tvly-...
```

वैकल्पिक रूप से, हम बेहतरीन अवलोकन के लिए [LangSmith](https://docs.smith.langchain.com/) सेटअप कर सकते हैं।

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=ls__...
```

### टूल्स सेटअप करें

जैसा कि ऊपर बताया गया है, हम पहले उन टूल्स को परिभाषित करेंगे जिनका हम उपयोग करना चाहते हैं।
इस सरल उदाहरण के लिए, हम एक वेब सर्च टूल का उपयोग करेंगे।
हालांकि, अपने खुद के टूल्स बनाना वास्तव में आसान है - इसे कैसे करना है इस पर दस्तावेज़ देखें [यहाँ](https://python.langchain.com/docs/modules/agents/tools/custom_tools)।

```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
```

हम अब इन टूल्स को एक सरल LangGraph [ToolNode](https://langchain-ai.github.io/langgraph/reference/prebuilt/#toolnode) में रैप कर सकते हैं।
यह क्लास संदेशों की सूची प्राप्त करता है (जिसमें [tool_calls](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.tool_calls) शामिल हैं), टूल(s) को कॉल करता है जिसे LLM ने चलाने का अनुरोध किया है, और आउटपुट को नए [ToolMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolMessage.html#langchain_core.messages.tool.ToolMessage)(s) के रूप में लौटाता है।

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
```

### मॉडल सेटअप करें

अब हमें उपयोग करने के लिए चैट मॉडल को लोड करने की आवश्यकता है।

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI

# We will set streaming=True so that we can stream tokens
# See the streaming section for more information on this.
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)
```

इसके बाद, हमें यह सुनिश्चित करना चाहिए कि मॉडल जानता है कि इसके पास ये टूल्स कॉल करने के लिए उपलब्ध हैं।
हम यह LangChain टूल्स को OpenAI टूल कॉलिंग के फॉर्मेट में बदलकर कर सकते हैं [bind_tools()](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) मेथड का उपयोग करके।

```python
model = model.bind_tools(tools)
```

### एजेंट राज्य परिभाषित करें

इस बार, हम अधिक सामान्य `StateGraph` का उपयोग करेंगे।
यह ग्राफ एक राज्य ऑब्जेक्ट द्वारा पैरामीट्राइज्ड होता है जिसे यह प्रत्येक नोड को पास करता है।
याद रखें कि प्रत्येक नोड फिर राज्य को अपडेट करने के लिए ऑपरेशंस लौटाता है।
ये ऑपरेशंस या तो राज्य पर विशिष्ट विशेषताओं को सेट (जैसे मौजूदा मूल्यों को ओवरराइट करना) कर सकते हैं या मौजूदा विशेषता में जोड़ सकते हैं।
सेट या जोड़ना दूसरे पैरामीटर (`operator.add`) का उपयोग करके राज्य ऑब्जेक्ट की एनोटेशन द्वारा दर्शाया जाता है।

इस उदाहरण के लिए, हम जो राज्य ट्रैक करेंगे वह सिर्फ संदेशों की एक सूची होगी।
हम चाहते हैं कि प्रत्येक नोड बस उस सूची में संदेश जोड़ें।
इसलिए, हम एक `TypedDict` का उपयोग करेंगे जिसमें एक कुंजी (`messages`) होगी और इसे एनोटेट करेंगे ताकि जब इसे अपडेट किया जाए तो हम हमेशा `messages` कुंजी में जोड़ें।
(नोट: राज्य कोई भी [type](https://docs.python.org/3/library/stdtypes.html#type-objects) हो सकता है, इसमें [pydantic BaseModel's](https://docs.pydantic.dev/latest/api/base_model/)) शामिल हैं।

```python
from typing import TypedDict, Annotated

def add_messages(left: list, right: list):
    """Add-don't-overwrite."""
    return left + right

class AgentState(TypedDict):
    # The `add_messages` function within the annotation defines
    # *how* updates should be merged into the state.
    messages: Annotated[list, add_messages]
```

आप पहले उदाहरण में उपयोग किए गए `MessageGraph` को इस ग्राफ का एक प्री-कॉन्फ़िगर संस्करण मान सकते हैं, जहां राज्य सीधे संदेशों की एक सरणी होता है,
और अपडेट चरण हमेशा नोड के रिटर्न किए गए मूल्यों को आंतरिक राज्य में जोड़ता है।

### नोड्स परिभाषित करें

अब हमें अपने ग्राफ में कुछ अलग-अलग नोड्स को परिभाषित करने की आवश्यकता है।
`langgraph` में, एक नोड एक सामान्य पायथन फ़ंक्शन या एक [रननेबल](https://python.langchain.com/docs/expression_language/) हो सकता है।

इसके लिए हमें दो मुख्य नोड्स की आवश्यकता है:

1. एजेंट: यह तय करने के लिए उत्तरदायी होता है कि क्या (यदि कोई) कार्रवाई करनी है।
2. टूल्स को इनवोक करने का एक फ़ंक्शन: यदि एजेंट कार्रवाई करने का निर्णय लेता है, तो यह नोड उस कार्रवाई को निष्पादित करेगा। हमने इसे पहले ही ऊपर परिभाषित कर लिया है।

हमें कुछ एजेस भी परिभाषित करनी होंगी।
इनमें से कुछ एजेस सशर्त हो सकती हैं।
वे सशर्त इसलिये हैं क्योंकि गंतव्य ग्राफ के `State` की सामग्री पर निर्भर करता है।

जो पथ लिया जाता है वह तब तक ज्ञात नहीं होता जब तक कि वह नोड नहीं चलाया जाता (LLM निर्णय लेता है)। हमारे उपयोग के मामले के लिए, हमें प्रत्येक प्रकार के एज की एक आवश्यकता होगी:

1. सशर्त एज: एजेंट को कॉल करने के बाद, हमें या तो:

   a. टूल्स चलाएं यदि एजेंट ने कार्रवाई करने के लिए कहा है, या

   b. समाप्त करें (उपयोगकर्ता को उत्तर दें) यदि एजेंट ने टूल्स चलाने के लिए नहीं कहा है

2. सामान्य एज: टूल्स को इनवोक करने के बाद, ग्राफ को हमेशा यह तय करने के लिए एजेंट के पास लौटना चाहिए कि आगे क्या करना है

आइए नोड्स को परिभाषित करें, साथ ही सशर्त एज को परिभाषित करने के लिए एक फ़ंक्शन भी बनाएं।

```python
from typing import Literal

# Define the function that determines whether to continue or not
def should_continue(state: AgentState) -> Literal["action", "__end__"]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "action" node
    if last_message.tool_calls:
        return "action"
    # Otherwise, we stop (reply to the user)
    return "__end__"


# Define the function that calls the model
def call_model(state: AgentState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}
```

### ग्राफ को परिभाषित करें

अब हम इसे सब एक साथ रख सकते हैं और ग्राफ को परिभाषित कर सकते हैं!

```python
from langgraph.graph import StateGraph, END
# Define a new graph
workflow = StateGraph(AgentState)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.set_entry_point("agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge('action', 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable
app = workflow.compile()
```

### इसका उपयोग करें!

अब हम इसका उपयोग कर सकते हैं!
यह अब सभी अन्य LangChain रननेबल्स की तरह ही [इंटरफेस](https://python.langchain.com/docs/expression_language/) को उजागर करता है।
यह [रननेबल](https://python.langchain.com/docs/expression_language/interface/) संदेशों की एक सूची को स्वीकार करता है।

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.messages import HumanMessage

inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
app.invoke(inputs)
```

इसमें थोड़ा समय लग सकता है - यह पर्दे के पीछे कुछ कॉल कर रहा है।
जैसे ही वे होते हैं कुछ मध्यवर्ती परिणाम देखना शुरू करने के लिए, हम स्ट्रीमिंग का उपयोग कर सकते हैं - इसके बारे में अधिक जानकारी के लिए नीचे देखें।

## स्ट्रीमिंग

LangGraph में कई अलग-अलग प्रकार की स्ट्रीमिंग के लिए समर्थन है।

### स्ट्रीमिंग नोड आउटपुट

LangGraph का उपयोग करने के फायदों में से एक यह है कि प्रत्येक नोड द्वारा उत्पादित आउटपुट को स्ट्रीम करना आसान है।

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
for output in app.stream(inputs, stream_mode="updates"):
    # stream() yields dictionaries with output keyed by node name
    for key, value in output.items():
        print(f"Output from node '{key}':")
        print("---")
        print(value)
    print("\n---\n")
```

```output
Output from node 'agent':
---
{'messages': [AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}})]}

---

Output from node 'action':
---
{'messages': [FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json')]}

---

Output from node 'agent':
---
{'messages': [AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---

Output from node '__end__':
---
{'messages': [HumanMessage(content='what is the weather in sf'), AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}}), FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json'), AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---
```

### स्ट्रीमिंग LLM टोकन

आप प्रत्येक नोड द्वारा उत्पादित LLM टोकन तक भी पहुँच सकते हैं।
इस मामले में केवल "एजेंट" नोड LLM टोकन उत्पन्न करता है।
इसे ठीक से काम करने के लिए, आपको एक ऐसे LLM का उपयोग करना होगा जो स्ट्रीमिंग का समर्थन करता है और LLM को बनाते समय इसे सेट किया हो (उदा. `ChatOpenAI(model="gpt-3.5-turbo-1106", streaming=True)`)

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
async for output in app.astream_log(inputs, include_types=["llm"]):
    # astream_log() yields the requested logs (here LLMs) in JSONPatch format
    for op in output.ops:
        if op["path"] == "/streamed_output/-":
            # this is the output from .stream()
            ...
        elif op["path"].startswith("/logs/") and op["path"].endswith(
            "/streamed_output/-"
        ):
            # because we chose to only include LLMs, these are LLM tokens
            print(op["value"])
```

```output
content='' additional_kwargs={'function_call': {'arguments': '', 'name': 'tavily_search_results_json'}}
content='' additional_kwargs={'function_call': {'arguments': '{\n', 'name': ''}}}
content='' additional_kwargs={'function_call': {'arguments': ' ', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': ' "', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': 'query', 'name': ''}}
...
```

## कब उपयोग करें

आपको इसे कब [LangChain एक्सप्रेशन लैंग्वेज](https://python.langchain.com/docs/expression_language/) के मुकाबले उपयोग करना चाहिए?

यदि आपको चक्रों की आवश्यकता है।

Langchain एक्सप्रेशन लैंग्वेज आपको चेन (DAGs) को आसानी से परिभाषित करने की अनुमति देता है लेकिन चक्रों को जोड़ने के लिए एक अच्छा तंत्र नहीं है।
`langgraph` वह सिंटैक्स जोड़ता है।

## प्रलेखन

हमें उम्मीद है कि इससे आपको यह समझने में मदद मिली होगी कि आप क्या बना सकते हैं! अधिक जानने के लिए बाकी दस्तावेज़ देखें।

### ट्यूटोरियल्स

[LangGraph ट्यूटोरियल्स](https://langchain-ai.github.io/langgraph/tutorials/) में मार्गदर्शित उदाहरणों के माध्यम से LangGraph के साथ निर्माण करना सीखें।

हम अनुशंसा करते हैं कि अधिक उन्नत गाइड आज़माने से पहले [LangGraph का परिचय](https://langchain-ai.github.io/langgraph/tutorials/introduction/) से शुरू करें।

### कैसे-कैसे गाइड

[LangGraph कैसे-कैसे गाइड](https://langchain-ai.github.io/langgraph/how-tos/) दिखाते हैं कि LangGraph के भीतर विशिष्ट चीजें कैसे पूरी की जाएं, स्ट्रीमिंग से लेकर मेमोरी और स्थायित्व जोड़ने तक, सामान्य डिज़ाइन पैटर्न (ब्रांचिंग, सबग्राफ, आदि) तक, ये वह स्थान हैं जहाँ आपको किसी विशिष्ट कोड स्निपेट को कॉपी और चलाने की आवश्यकता होती है।

### संदर्भ

LangGraph के API में कुछ महत्वपूर्ण क्लासेस और मेथड्स हैं जो सभी [संदर्भ दस्तावेज़ों](https://langchain-ai.github.io/langgraph/reference/graphs/) में शामिल हैं। विशिष्ट फ़ंक्शन आर्गुमेंट्स और ग्राफ + चेकपॉइंटिंग APIs का उपयोग करने के सरल उदाहरण देखने के लिए या कुछ उच्च-स्तरीय पूर्वनिर्मित घटकों को देखने के लिए इन्हें देखें।
