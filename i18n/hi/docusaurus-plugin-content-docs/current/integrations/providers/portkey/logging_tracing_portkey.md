---
translated: true
---

# लॉग, ट्रेस और मॉनिटर करना

जब आप लैंगचेन का उपयोग करके ऐप्स या एजेंट बना रहे होते हैं, तो एक ही उपयोगकर्ता अनुरोध को पूरा करने के लिए आप कई API कॉल करते हैं। हालांकि, जब आप इन अनुरोधों का विश्लेषण करना चाहते हैं, तो ये अनुरोध चेन नहीं होते हैं। [**Portkey**](/docs/integrations/providers/portkey/) के साथ, एक ही उपयोगकर्ता अनुरोध से संबंधित सभी एम्बेडिंग, पूर्णता और अन्य अनुरोध लॉग और ट्रेस किए जाते हैं, जिससे आप उपयोगकर्ता इंटरैक्शन की पूरी जानकारी प्राप्त कर सकते हैं।

यह नोटबुक लैंगचेन LLM कॉल को `Portkey` का उपयोग करके लॉग, ट्रेस और मॉनिटर करने के लिए चरण-दर-चरण मार्गदर्शिका है।

पहले, आइए Portkey, OpenAI और एजेंट टूल आयात करते हैं।

```python
import os

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders
```

नीचे अपना OpenAI API कुंजी दर्ज करें। [(आप इसे यहां पा सकते हैं)](https://platform.openai.com/account/api-keys)

```python
os.environ["OPENAI_API_KEY"] = "..."
```

## Portkey API कुंजी प्राप्त करें

1. [यहां Portkey के लिए साइन अप करें](https://app.portkey.ai/signup)
2. अपने [डैशबोर्ड](https://app.portkey.ai/) पर, नीचे बाएं कोने पर प्रोफ़ाइल आइकन पर क्लिक करें, फिर "API कुंजी कॉपी करें" पर क्लिक करें
3. इसे नीचे चिपकाएं

```python
PORTKEY_API_KEY = "..."  # Paste your Portkey API Key here
```

## ट्रेस आईडी सेट करें

1. नीचे अपने अनुरोध के लिए ट्रेस आईडी सेट करें
2. ट्रेस आईडी एक ही अनुरोध से उत्पन्न सभी API कॉल के लिए समान हो सकता है

```python
TRACE_ID = "uuid-trace-id"  # Set trace id here
```

## Portkey हेडर जनरेट करें

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY, provider="openai", trace_id=TRACE_ID
)
```

प्रोम्प्ट और उपयोग करने के लिए उपकरण को परिभाषित करें

```python
from langchain import hub
from langchain_core.tools import tool

prompt = hub.pull("hwchase17/openai-tools-agent")


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]
```

अपने एजेंट को सामान्य रूप से चलाएं। **एकमात्र** बदलाव यह है कि हम अब **उपरोक्त हेडर** को अनुरोध में शामिल करेंगे।

```python
model = ChatOpenAI(
    base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0
)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[33;1m[1;3m243[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 36}`


[0m[36;1m[1;3m8748[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 8748, 'exponent': 2}`


[0m[33;1m[1;3m76527504[0m[32;1m[1;3mThe result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by thirty six, then square the result',
 'output': 'The result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.'}
```

## Portkey पर लॉगिंग और ट्रेसिंग कैसे काम करता है

**लॉगिंग**
- Portkey के माध्यम से अपना अनुरोध भेजना सुनिश्चित करता है कि सभी अनुरोध डिफ़ॉल्ट रूप से लॉग किए जाते हैं
- प्रत्येक अनुरोध लॉग में `timestamp`, `model name`, `total cost`, `request time`, `request json`, `response json`, और अतिरिक्त Portkey सुविधाएं शामिल होती हैं

**[ट्रेसिंग](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/traces)**
- ट्रेस आईडी को प्रत्येक अनुरोध के साथ पास किया जाता है और यह Portkey डैशबोर्ड पर लॉग पर दिखाई देता है
- आप प्रत्येक अनुरोध के लिए **अलग-अलग ट्रेस आईडी** भी सेट कर सकते हैं
- आप ट्रेस आईडी के साथ उपयोगकर्ता प्रतिक्रिया भी जोड़ सकते हैं। [इस बारे में अधिक जानकारी यहां है](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/feedback)

उपरोक्त अनुरोध के लिए, आप पूरे लॉग ट्रेस को इस प्रकार देख सकते हैं
![View Langchain traces on Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)

## उन्नत LLMOps सुविधाएं - कैशिंग, टैगिंग, रीट्राइज

लॉगिंग और ट्रेसिंग के अलावा, Portkey और भी कई सुविधाएं प्रदान करता है जो आपके मौजूदा कार्यप्रवाहों में उत्पादन क्षमताएं जोड़ती हैं:

**कैशिंग**

पहले से सर्व किए गए ग्राहकों के प्रश्नों को कैश से प्रतिक्रिया दें बजाय उन्हें फिर से OpenAI को भेजें। सटीक स्ट्रिंग या semantically समान स्ट्रिंग मैच करें। कैश लागत और लेटेंसी को 20 गुना तक कम कर सकता है। [दस्तावेज़](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/cache-simple-and-semantic)

**रीट्राइज**

किसी भी असफल API अनुरोध को स्वचालित रूप से **`5 बार तक`** पुनः प्रक्रिया करें। **`एक्सपोनेंशियल बैकऑफ`** रणनीति का उपयोग करता है, जो नेटवर्क ओवरलोड को रोकने के लिए रीट्राई प्रयासों को अलग-अलग करता है। [दस्तावेज़](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations)

**टैगिंग**

पूर्व-परिभाषित टैग के साथ प्रत्येक उपयोगकर्ता इंटरैक्शन को विस्तृत रूप से ट्रैक और ऑडिट करें। [दस्तावेज़](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/metadata)
