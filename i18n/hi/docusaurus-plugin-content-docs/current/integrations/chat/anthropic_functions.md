---
sidebar_class_name: hidden
translated: true
---

# [डिप्रीकेटेड] एक्सपेरिमेंटल एंथ्रोपिक टूल्स रैपर

::: {.callout-warning}

एंथ्रोपिक एपीआई आधिकारिक रूप से टूल कॉलिंग का समर्थन करता है, इसलिए यह समाधान अब आवश्यक नहीं है। कृपया [ChatAnthropic](/docs/integrations/chat/anthropic) का उपयोग करें `langchain-anthropic>=0.1.5` के साथ।

:::

यह नोटबुक दिखाता है कि एंथ्रोपिक के इर्द-गिर्द एक प्रयोगात्मक रैपर का उपयोग कैसे किया जाए जो इसे टूल कॉलिंग और संरचित आउटपुट क्षमताएं देता है। यह एंथ्रोपिक के मार्गदर्शन [यहाँ](https://docs.anthropic.com/claude/docs/functions-external-tools) का पालन करता है।

रैपर `langchain-anthropic` पैकेज से उपलब्ध है, और इसके लिए वैकल्पिक निर्भरता `defusedxml` भी आवश्यक है जो एलएलएम से XML आउटपुट को पार्स करने के लिए है।

नोट: यह एक बीटा सुविधा है जिसे एंथ्रोपिक के औपचारिक कार्यान्वयन द्वारा प्रतिस्थापित किया जाएगा, लेकिन इसका उपयोग परीक्षण और प्रयोग के लिए उपयोगी है।

```python
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## टूल बाइंडिंग

`ChatAnthropicTools` एक `bind_tools` मेथड एक्सपोज़ करता है जो आपको पायडांटिक मॉडल या बेसटूल्स को एलएलएम में पास करने की अनुमति देता है।

```python
from langchain_core.pydantic_v1 import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("I am a 27 year old named Erick")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```

## संरचित आउटपुट

`ChatAnthropicTools` [`with_structured_output` विनिर्देश](/docs/modules/model_io/chat/structured_output) को भी क्रियान्वित करता है जिससे मूल्य निकाले जा सकते हैं। नोट: यह उन मॉडल्स के साथ स्थिर नहीं हो सकता जो स्पष्ट रूप से टूल कॉलिंग प्रदान करते हैं।

```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("I am a 27 year old named Erick")
```

```output
Person(name='Erick', age=27)
```
