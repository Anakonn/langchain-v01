---
sidebar_position: 2
title: उपकरण/कार्य कॉलिंग
translated: true
---

# उपकरण कॉलिंग

:::info
हम "उपकरण कॉलिंग" और "कार्य कॉलिंग" को आपसी रूप से प्रयुक्त करते हैं। हालांकि कार्य कॉलिंग कभी-कभी एक अकेले कार्य के आह्वान को संदर्भित करने के लिए उपयोग किया जाता है, हम सभी मॉडलों को ऐसे मानते हैं जो प्रत्येक संदेश में कई उपकरण या कार्य कॉल वापस कर सकते हैं।
:::

:::tip
[यहाँ](/docs/integrations/chat/) उन सभी मॉडलों की सूची देखें जो उपकरण कॉलिंग का समर्थन करते हैं।
:::

उपकरण कॉलिंग एक मॉडल को किसी दिए गए प्रॉम्प्ट का जवाब देने में सक्षम बनाता है जो एक उपयोगकर्ता-परिभाषित स्कीमा से मेल खाता है। नाम से पता चलता है कि मॉडल कोई कार्रवाई कर रहा है, लेकिन वास्तव में ऐसा नहीं है! मॉडल उपकरण के तर्कों को तैयार कर रहा है, और वास्तव में उपकरण चलाना (या नहीं) उपयोगकर्ता पर निर्भर करता है - उदाहरण के लिए, यदि आप [अनरूपित पाठ से कुछ स्कीमा से मेल खाते आउटपुट निकालना](/docs/use_cases/extraction/) चाहते हैं, तो आप एक "निकासी" उपकरण दे सकते हैं जो इच्छित स्कीमा से मेल खाते पैरामीटर लेता है, फिर उत्पन्न आउटपुट को अपना अंतिम परिणाम मान सकते हैं।

एक उपकरण कॉल में एक नाम, तर्क डिक्शनरी और एक वैकल्पिक पहचानकर्ता शामिल होता है। तर्क डिक्शनरी संरचित है `{तर्क_नाम: तर्क_मान}`।

कई एलएलएम प्रदाता, जिनमें [एंथ्रोपिक](https://www.anthropic.com/), [कोहीर](https://cohere.com/), [गूगल](https://cloud.google.com/vertex-ai), [मिस्ट्रल](https://mistral.ai/), [OpenAI](https://openai.com/) और अन्य शामिल हैं, उपकरण कॉलिंग सुविधा के विभिन्न संस्करणों का समर्थन करते हैं। ये सुविधाएं आमतौर पर एलएलएम के अनुरोधों में उपलब्ध उपकरणों और उनकी स्कीमाओं को शामिल करने और प्रतिक्रियाओं में इन उपकरणों को कॉल करने की अनुमति देती हैं। उदाहरण के लिए, एक खोज इंजन उपकरण दिए जाने पर, एक एलएलएम पहले खोज इंजन को कॉल करके एक क्वेरी को संभाल सकता है। एलएलएम को कॉल करने वाली प्रणाली उपकरण कॉल प्राप्त कर सकती है, इसे निष्पादित कर सकती है और एलएलएम के प्रतिक्रिया को सूचित करने के लिए आउटपुट वापस कर सकती है। LangChain [बिल्ट-इन उपकरणों](/docs/integrations/tools/) का एक सेट और अपने खुद के [कस्टम उपकरण](/docs/modules/tools/custom_tools) को परिभाषित करने के कई तरीकों का समर्थन करता है। उपकरण कॉलिंग [उपकरण-उपयोग श्रृंखलाओं और एजेंटों](/docs/use_cases/tool_use) को बनाने और मॉडलों से अधिक संरचित आउटपुट प्राप्त करने के लिए बहुत उपयोगी है।

प्रदाता उपकरण स्कीमाओं और उपकरण कॉल को प्रारूपित करने के लिए अलग-अलग कन्वेंशन अपनाते हैं।
उदाहरण के लिए, एंथ्रोपिक एक बड़े सामग्री ब्लॉक के भीतर पार्स किए गए संरचनाओं के रूप में उपकरण कॉल वापस करता है:

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

जबकि OpenAI उपकरण कॉल को एक अलग पैरामीटर में अलग करता है, तर्कों को JSON स्ट्रिंग के रूप में:

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChain उपकरणों को परिभाषित करने, उन्हें एलएलएम को पास करने और उपकरण कॉल को प्रस्तुत करने के लिए मानक इंटरफ़ेस लागू करता है।

## अनुरोध: मॉडल को उपकरण पास करना

एक मॉडल को उपकरण कॉल करने में सक्षम होने के लिए, आपको चैट अनुरोध करते समय उपकरण स्कीमाएं उसे पास करनी होंगी।
उपकरण कॉलिंग सुविधाओं का समर्थन करने वाले LangChain ChatModels एक `.bind_tools` मेथड लागू करते हैं, जो LangChain [उपकरण ऑब्जेक्ट](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool), Pydantic क्लास या JSON स्कीमा की एक सूची प्राप्त करता है और उन्हें प्रदाता-विशिष्ट अपेक्षित प्रारूप में चैट मॉडल से बांधता है। बाद के बार बंधे चैट मॉडल के आह्वान में प्रत्येक कॉल में उपकरण स्कीमाएं शामिल होंगी।

### उपकरण स्कीमाओं को परिभाषित करना: LangChain Tool

उदाहरण के लिए, हम Python फ़ंक्शनों पर `@tool` डिकोरेटर का उपयोग करके कस्टम उपकरणों के लिए स्कीमा को परिभाषित कर सकते हैं:

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### उपकरण स्कीमाओं को परिभाषित करना: Pydantic क्लास

हम इसे समकक्ष रूप से Pydantic का उपयोग करके परिभाषित कर सकते हैं। जब आपके उपकरण इनपुट अधिक जटिल हों, तो Pydantic उपयोगी होता है:

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

हम उन्हें निम्नानुसार चैट मॉडल से बांध सकते हैं:

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### उपकरण स्कीमाओं को बांधना

हम `bind_tools()` मेथड का उपयोग कर सकते हैं ताकि `Multiply` को एक "उपकरण" में बदल सकें और उसे मॉडल से बांध सकें (यानी, मॉडल को प्रत्येक बार आह्वान करते समय इसे पास करें)।

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## अनुरोध: एक उपकरण कॉल को मजबूर करना

जब आप `bind_tools(tools)` का उपयोग करते हैं, तो मॉडल एक उपकरण कॉल, कई उपकरण कॉल या कोई उपकरण कॉल नहीं करने का विकल्प चुन सकता है। कुछ मॉडल `tool_choice` पैरामीटर का समर्थन करते हैं जो आपको मॉडल को एक उपकरण कॉल करने के लिए मजबूर करने में कुछ क्षमता देते हैं। इस सुविधा का समर्थन करने वाले मॉडलों के लिए, आप उस उपकरण का नाम जिसे आप हमेशा कॉल करना चाहते हैं `tool_choice="xyz_tool_name"` पास कर सकते हैं। या आप `tool_choice="any"` पास कर सकते हैं ताकि मॉडल कम से कम एक उपकरण कॉल करने के लिए मजबूर हो, बिना किसी विशिष्ट उपकरण का उल्लेख किए।

:::note
वर्तमान में `tool_choice="any"` कार्यक्षमता का समर्थन OpenAI, MistralAI, FireworksAI और Groq द्वारा किया जाता है।

वर्तमान में एंथ्रोपिक `tool_choice` का कोई भी समर्थन नहीं करता है।
:::

यदि हम चाहते हैं कि हमारा मॉडल हमेशा गुणा उपकरण कॉल करे, तो हम ऐसा कर सकते हैं:

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

और यदि हम चाहते हैं कि यह कम से कम एक जोड़ या गुणा कॉल करे, तो हम ऐसा कर सकते हैं:

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## प्रतिक्रिया: मॉडल आउटपुट से पढ़ने वाले उपकरण कॉल

यदि उपकरण कॉल LLM प्रतिक्रिया में शामिल हैं, तो वे संबंधित [AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage) या [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) (स्ट्रीमिंग के दौरान) में `.tool_calls` गुण में [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall) वस्तुओं की सूची के रूप में संलग्न होते हैं। `ToolCall` एक प्रकार का डिक्शनरी है जिसमें एक उपकरण नाम, तर्क मूल्यों का डिक्शनरी और (वैकल्पिक रूप से) एक पहचानकर्ता शामिल हैं। उन संदेशों में जिनमें कोई उपकरण कॉल नहीं हैं, इस गुण के लिए डिफ़ॉल्ट रूप से खाली सूची होती है।

उदाहरण:

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

`.tool_calls` गुण में वैध उपकरण कॉल होने चाहिए। ध्यान दें कि कभी-कभी मॉडल प्रदाता गलत रूप में उपकरण कॉल (जैसे, मान्य JSON नहीं हैं) आउटपुट कर सकते हैं। इन मामलों में पार्सिंग में विफलता होने पर, [InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall) के उदाहरण `.invalid_tool_calls` गुण में भरे जाते हैं। एक `InvalidToolCall` में नाम, स्ट्रिंग तर्क, पहचानकर्ता और त्रुटि संदेश हो सकते हैं।

यदि इच्छित हो, तो [आउटपुट पार्सर](/docs/modules/model_io/output_parsers) आउटपुट को और प्रोसेस कर सकते हैं। उदाहरण के लिए, हम मूल Pydantic वर्ग में वापस परिवर्तित कर सकते हैं:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## प्रतिक्रिया: स्ट्रीमिंग

जब उपकरणों को स्ट्रीमिंग संदर्भ में कॉल किया जाता है, तो [संदेश टुकड़े](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) `.tool_call_chunks` गुण में [उपकरण कॉल टुकड़े](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk) वस्तुओं की सूची के माध्यम से भरे जाएंगे। एक `ToolCallChunk` में उपकरण `name`, `args` और `id` के लिए वैकल्पिक स्ट्रिंग फ़ील्ड और `index` के लिए वैकल्पिक इंटीजर फ़ील्ड शामिल हैं। फ़ील्ड वैकल्पिक हैं क्योंकि उपकरण कॉल के हिस्से विभिन्न टुकड़ों में स्ट्रीम किए जा सकते हैं (उदाहरण के लिए, तर्कों का एक उपसर्ग शामिल करने वाले टुकड़े में उपकरण नाम और id के लिए null मान हो सकते हैं)।

क्योंकि संदेश टुकड़े अपने माता-पिता संदेश वर्ग से वारिस होते हैं, इसलिए एक [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) में उपकरण कॉल टुकड़ों के साथ `.tool_calls` और `.invalid_tool_calls` फ़ील्ड भी होंगे। इन फ़ील्डों को संदेश के उपकरण कॉल टुकड़ों से सर्वश्रेष्ठ प्रयास से पार्स किया जाता है।

ध्यान दें कि वर्तमान में सभी प्रदाता उपकरण कॉल के लिए स्ट्रीमिंग का समर्थन नहीं करते हैं।

उदाहरण:

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

ध्यान दें कि संदेश टुकड़ों को जोड़ने से उनके संबंधित उपकरण कॉल टुकड़ों को मर्ज कर दिया जाएगा। यह वह सिद्धांत है जिसके माध्यम से LangChain के विभिन्न [उपकरण आउटपुट पार्सर](/docs/modules/model_io/output_parsers/types/openai_tools/) स्ट्रीमिंग का समर्थन करते हैं।

उदाहरण के लिए, नीचे हम उपकरण कॉल टुकड़ों को संचित करते हैं:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

और नीचे हम आंशिक पार्सिंग दिखाने के लिए उपकरण कॉल को संचित करते हैं:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## अनुरोध: उपकरण आउटपुट को मॉडल में पारित करना

यदि हम मॉडल द्वारा उत्पन्न उपकरण आह्वानों का उपयोग वास्तव में उपकरणों को कॉल करने और उपकरण परिणामों को मॉडल को वापस पारित करने के लिए करना चाहते हैं, तो हम `ToolMessage` का उपयोग कर सकते हैं।

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## अनुरोध: कम-शॉट प्रोम्पटिंग

अधिक जटिल उपकरण उपयोग के लिए प्रोम्पट में कुछ उदाहरण जोड़ना बहुत उपयोगी होता है। हम `AIMessage` में `ToolCall` और संबंधित `ToolMessage` जोड़कर ऐसा कर सकते हैं।

:::note
अधिकांश मॉडलों के लिए यह महत्वपूर्ण है कि ToolCall और ToolMessage आईडी मेल खाते हों, ताकि ToolCalls के साथ प्रत्येक AIMessage के बाद संबंधित आईडी के साथ ToolMessages हों।

उदाहरण के लिए, कुछ विशेष निर्देशों के साथ भी हमारा मॉडल ऑपरेशन के क्रम से गड़बड़ा सकता है:

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

मॉडल को अभी कुछ भी जोड़ने की कोशिश नहीं करनी चाहिए, क्योंकि तकनीकी रूप से वह 119 * 8 के परिणाम को अभी नहीं जान सकता।

कुछ उदाहरणों के साथ एक प्रोम्पट जोड़कर हम इस व्यवहार को ठीक कर सकते हैं:

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

लगता है कि इस बार हम सही आउटपुट प्राप्त कर रहे हैं।

यहां [LangSmith ट्रेस](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r) दिखाया गया है।

## अगले कदम

- **आउटपुट पार्सिंग**: [OpenAI Tools आउटपुट पार्सर](/docs/modules/model_io/output_parsers/types/openai_tools/) और [OpenAI Functions आउटपुट पार्सर](/docs/modules/model_io/output_parsers/types/openai_functions/) देखें ताकि विभिन्न प्रारूपों में फ़ंक्शन कॉलिंग API प्रतिक्रियाओं को निकाला जा सके।
- **संरचित आउटपुट श्रृंखला**: [कुछ मॉडल निर्माताओं के पास](/docs/modules/model_io/chat/structured_output/) आपके लिए संरचित आउटपुट श्रृंखला बनाने का कंस्ट्रक्टर होता है।
- **उपकरण उपयोग**: [इन गाइड](/docs/use_cases/tool_use/)में देखें कि कैसे श्रृंखलाएं और एजेंट बनाए जाते हैं जो आमंत्रित उपकरणों को कॉल करते हैं।
