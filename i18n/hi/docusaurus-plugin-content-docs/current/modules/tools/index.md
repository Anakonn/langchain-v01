---
sidebar_class_name: hidden
sidebar_position: 4
translated: true
---

# उपकरण

उपकरण वह इंटरफ़ेस हैं जिनका उपयोग एक एजेंट, श्रृंखला या LLM दुनिया के साथ संवाद करने के लिए कर सकता है।
ये कुछ चीजों को जोड़ते हैं:

1. उपकरण का नाम
2. उपकरण क्या है, का वर्णन
3. उपकरण के इनपुट के लिए JSON स्कीमा
4. कॉल करने वाली फ़ंक्शन
5. क्या उपकरण का परिणाम सीधे उपयोगकर्ता को लौटाया जाना चाहिए

यह सभी जानकारी रखना उपयोगी है क्योंकि इस जानकारी का उपयोग कार्रवाई करने वाली प्रणालियां बनाने के लिए किया जा सकता है! नाम, वर्णन और JSON स्कीमा का उपयोग LLM को प्रेरित करने के लिए किया जा सकता है ताकि वह जान सके कि कौन सी कार्रवाई करनी है, और फिर कॉल करने वाली फ़ंक्शन उस कार्रवाई को करने के बराबर है।

एक उपकरण के इनपुट को जितना सरल बनाया जाता है, LLM के लिए उसका उपयोग करना उतना ही आसान होता है।
कई एजेंट केवल एक स्ट्रिंग इनपुट वाले उपकरणों के साथ काम करेंगे।
एजेंट प्रकारों और कौन से एजेंट अधिक जटिल इनपुट के साथ काम करते हैं, के बारे में जानकारी के लिए कृपया [इस दस्तावेज़](../agents/agent_types) देखें।

महत्वपूर्ण बात यह है कि नाम, वर्णन और JSON स्कीमा (यदि उपयोग किया गया हो) सभी प्रेरक में उपयोग किए जाते हैं। इसलिए, यह बहुत महत्वपूर्ण है कि वे स्पष्ट हों और यह बताएं कि उपकरण का उपयोग कैसे किया जाना चाहिए। यदि LLM उपकरण का उपयोग करना समझ नहीं पा रहा है, तो आप डिफ़ॉल्ट नाम, वर्णन या JSON स्कीमा को बदलना होगा।

## डिफ़ॉल्ट उपकरण

चलो उपकरणों के साथ काम करने का तरीका देखते हैं। ऐसा करने के लिए, हम एक अंतर्निहित उपकरण के साथ काम करेंगे।

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```

अब हम उपकरण को इनिशियलाइज़ करते हैं। यह वह जगह है जहां हम इसे अपनी पसंद के अनुसार कॉन्फ़िगर कर सकते हैं।

```python
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
```

यह डिफ़ॉल्ट नाम है।

```python
tool.name
```

```output
'Wikipedia'
```

यह डिफ़ॉल्ट वर्णन है।

```python
tool.description
```

```output
'A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.'
```

यह इनपुट के डिफ़ॉल्ट JSON स्कीमा है।

```python
tool.args
```

```output
{'query': {'title': 'Query', 'type': 'string'}}
```

हम देख सकते हैं कि क्या उपकरण को सीधे उपयोगकर्ता को लौटाना चाहिए।

```python
tool.return_direct
```

```output
False
```

हम एक डिक्शनरी इनपुट के साथ इस उपकरण को कॉल कर सकते हैं।

```python
tool.run({"query": "langchain"})
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

हम इस उपकरण को एक एकल स्ट्रिंग इनपुट के साथ भी कॉल कर सकते हैं।
हम ऐसा कर सकते हैं क्योंकि यह उपकरण केवल एक इनपुट की उम्मीद करता है।
यदि इसके लिए कई इनपुट आवश्यक होते, तो हम ऐसा नहीं कर सकते।

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## डिफ़ॉल्ट उपकरणों को अनुकूलित करना

हम बिल्ट-इन नाम, वर्णन और तर्क के JSON स्कीमा को भी संशोधित कर सकते हैं।

तर्कों के JSON स्कीमा को परिभाषित करते समय, यह महत्वपूर्ण है कि इनपुट फ़ंक्शन के समान ही रहें, इसलिए आप उन्हें बदल नहीं सकते। लेकिन आप प्रत्येक इनपुट के लिए अनुकूलित वर्णन आसानी से परिभाषित कर सकते हैं।

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
```

```python
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
```

```python
tool.name
```

```output
'wiki-tool'
```

```python
tool.description
```

```output
'look up things in wikipedia'
```

```python
tool.args
```

```output
{'query': {'title': 'Query',
  'description': 'query to look up in Wikipedia, should be 3 or less words',
  'type': 'string'}}
```

```python
tool.return_direct
```

```output
True
```

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## और अधिक विषय

यह LangChain में उपकरणों के बारे में एक त्वरित परिचय था, लेकिन सीखने के लिए बहुत कुछ है।

**[बिल्ट-इन उपकरण](/docs/integrations/tools/)**: सभी बिल्ट-इन उपकरणों की सूची के लिए, [इस पृष्ठ](/docs/integrations/tools/) देखें।

**[कस्टम उपकरण](./custom_tools)**: हालांकि बिल्ट-इन उपकरण उपयोगी हैं, लेकिन बहुत संभावना है कि आपको अपने खुद के उपकरण परिभाषित करने होंगे। ऐसा करने के लिए निर्देशों के लिए, [इस गाइड](./custom_tools) देखें।

**[उपकरण किट](./toolkits)**: उपकरण किट उपकरणों का एक संग्रह हैं जो अच्छी तरह से एक साथ काम करते हैं। अधिक गहन वर्णन और सभी बिल्ट-इन उपकरण किटों की सूची के लिए, [इस पृष्ठ](./toolkits) देखें।

**[OpenAI फ़ंक्शन के रूप में उपकरण](./tools_as_openai_functions)**: उपकरण OpenAI फ़ंक्शन के बहुत समान हैं, और आसानी से उस प्रारूप में परिवर्तित किए जा सकते हैं। ऐसा करने के लिए निर्देशों के लिए, [इस नोटबुक](./tools_as_openai_functions) देखें।
