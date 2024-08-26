---
translated: true
---

# पोर्टकी

[पोर्टकी](https://portkey.ai) एआई एप्लिकेशन के लिए कंट्रोल पैनल है। इसके लोकप्रिय एआई गेटवे और ऑब्जर्वेबिलिटी सूट के साथ, सैकड़ों टीम **विश्वसनीय**, **लागत-प्रभावी**, और **तेज़** एप्लिकेशन भेजते हैं।

## लैंगचेन के लिए LLMOps

पोर्टकी लैंगचेन को उत्पादन तैयारी प्रदान करता है। पोर्टकी के साथ, आप
- [x] एक एकीकृत एपीआई के माध्यम से 150+ मॉडल से जुड़ सकते हैं,
- [x] सभी अनुरोधों के लिए 42+ **मेट्रिक्स और लॉग** देख सकते हैं,
- [x] **सेमांटिक कैश** को सक्षम करके लेटेंसी और लागत को कम कर सकते हैं,
- [x] विफल अनुरोधों के लिए स्वचालित **पुनः प्रयास और फॉलबैक** लागू कर सकते हैं,
- [x] बेहतर ट्रैकिंग और विश्लेषण के लिए **कस्टम टैग** जोड़ सकते हैं और [और भी कुछ](https://portkey.ai/docs)।

## त्वरित शुरुआत - पोर्टकी और लैंगचेन

चूंकि पोर्टकी OpenAI हस्ताक्षर के साथ पूरी तरह से संगत है, आप `ChatOpenAI` इंटरफ़ेस के माध्यम से पोर्टकी एआई गेटवे से जुड़ सकते हैं।

- `base_url` को `PORTKEY_GATEWAY_URL` के रूप में सेट करें
- पोर्टकी द्वारा आवश्यक हेडर का उपयोग करने के लिए `createHeaders` हेल्पर मेथड का उपयोग करके `default_headers` जोड़ें।

शुरू करने के लिए, [यहां साइन अप करके](https://app.portkey.ai/signup) अपना पोर्टकी API कुंजी प्राप्त करें। (नीचे बाएं प्रोफ़ाइल आइकन पर क्लिक करें, फिर "API कुंजी कॉपी करें" पर क्लिक करें) या [अपने स्वयं के वातावरण](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md) में ओपन सोर्स एआई गेटवे तैनात करें।

अगला कदम, पोर्टकी एसडीके इंस्टॉल करना है।

```python
pip install -U portkey_ai
```

अब हम पोर्टकी एआई गेटवे से जुड़ सकते हैं क्योंकि हमने `ChatOpenAI` मॉडल को अपडेट किया है।

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..." # Not needed when hosting your own gateway
PROVIDER_API_KEY = "..." # Add the API key of the AI provider being used

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,provider="openai")

llm = ChatOpenAI(api_key=PROVIDER_API_KEY, base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

अनुरोध पोर्टकी एआई गेटवे के माध्यम से निर्दिष्ट `प्रदाता` को भेजा जाता है। पोर्टकी भी आपके खाते में सभी अनुरोधों को लॉग करना शुरू कर देगा जो डीबगिंग को बहुत सरल बना देता है।

![लैंगचेन से पोर्टकी में लॉग देखें](https://assets.portkey.ai/docs/langchain-logs.gif)

## 150+ मॉडल का उपयोग एआई गेटवे के माध्यम से

एआई गेटवे की शक्ति तब आती है जब आप उपरोक्त कोड स्निपेट का उपयोग करके 20+ प्रदाताओं द्वारा समर्थित 150+ मॉडल से जुड़ सकते हैं।

आइए उपरोक्त कोड को संशोधित करें ताकि एंथ्रोपिक के `claude-3-opus-20240229` मॉडल को कॉल किया जा सके।

पोर्टकी **[वर्चुअल कुंजी](https://docs.portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/virtual-keys)** का समर्थन करता है जो एक सुरक्षित वॉल्ट में एपीआई कुंजी को संग्रहीत और प्रबंधित करने का एक आसान तरीका है। चलो वर्चुअल कुंजी का उपयोग करके एलएलएम कॉल करने का प्रयास करते हैं। आप पोर्टकी के वर्चुअल कुंजी टैब पर जा सकते हैं और एंथ्रोपिक के लिए एक नई कुंजी बना सकते हैं।

`virtual_key` पैरामीटर प्रमाणीकरण और उपयोग किए जा रहे एआई प्रदाता के लिए सेट करता है। हमारे मामले में हम एंथ्रोपिक वर्चुअल कुंजी का उपयोग कर रहे हैं।

> ध्यान दें कि `api_key` को खाली छोड़ा जा सकता है क्योंकि उस प्रमाणीकरण का उपयोग नहीं किया जाएगा।

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..."
VIRTUAL_KEY = "..." # Anthropic's virtual key we copied above

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,virtual_key=VIRTUAL_KEY)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, model="claude-3-opus-20240229")

llm.invoke("What is the meaning of life, universe and everything?")
```

पोर्टकी एआई गेटवे एंथ्रोपिक को API अनुरोध प्रमाणित करेगा और OpenAI प्रारूप में प्रतिक्रिया वापस लाएगा ताकि आप इसका उपयोग कर सकें।

एआई गेटवे लैंगचेन के `ChatOpenAI` वर्ग का विस्तार करता है, जिससे यह किसी भी प्रदाता और किसी भी मॉडल को कॉल करने का एकल इंटरफ़ेस बन जाता है।

## उन्नत रूटिंग - लोड बैलेंसिंग, फॉलबैक, पुनः प्रयास

पोर्टकी एआई गेटवे लैंगचेन को लोड-बैलेंसिंग, फॉलबैक, प्रयोग और कैनरी परीक्षण जैसी क्षमताएं एक कॉन्फ़िगरेशन-प्रथम दृष्टिकोण के माध्यम से प्रदान करता है।

चलो एक **उदाहरण** लें जहां हम `gpt-4` और `claude-opus` के बीच 50:50 का ट्रैफ़िक विभाजन करना चाहते हैं ताकि हम दो बड़े मॉडलों का परीक्षण कर सकें। इस के लिए गेटवे कॉन्फ़िगरेशन निम्नानुसार दिखेगा:

```python
config = {
    "strategy": {
         "mode": "loadbalance"
    },
    "targets": [{
        "virtual_key": "openai-25654", # OpenAI's virtual key
        "override_params": {"model": "gpt4"},
        "weight": 0.5
    }, {
        "virtual_key": "anthropic-25654", # Anthropic's virtual key
        "override_params": {"model": "claude-3-opus-20240229"},
        "weight": 0.5
    }]
}
```

हम फिर इस कॉन्फ़िग का उपयोग लैंगचेन से किए जा रहे अनुरोधों में कर सकते हैं।

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    config=config
)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

जब एलएलएम को कॉल किया जाता है, तो पोर्टकी परिभाषित वजनों के अनुपात में `gpt-4` और `claude-3-opus-20240229` के बीच अनुरोधों को वितरित करेगा।

आप और अधिक कॉन्फ़िग उदाहरण [यहां](https://docs.portkey.ai/docs/api-reference/config-object#examples) पा सकते हैं।

## **श्रृंखला और एजेंट का ट्रेसिंग**

पोर्टकी का लैंगचेन एकीकरण आपको एक एजेंट के चलने के बारे में पूरी दृश्यता प्रदान करता है। चलो एक [लोकप्रिय एजेंटिक वर्कफ़्लो](https://python.langchain.com/docs/use_cases/tool_use/quickstart/#agents) का उदाहरण लें।

हमें केवल `ChatOpenAI` वर्ग को उपरोक्त तरह से एआई गेटवे का उपयोग करने के लिए संशोधित करना है।

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Portkey"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "Portkey"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "Portkey"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

prompt = hub.pull("hwchase17/openai-tools-agent")

portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    virtual_key=OPENAI_VIRTUAL_KEY,
    trace_id="uuid-uuid-uuid-uuid"
)

@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]

model = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
})
```

**आप पोर्टकी डैशबोर्ड पर अनुरोधों के लॉग और ट्रेस आईडी देख सकते हैं:**
![लैंगचेन एजेंट लॉग पोर्टकी पर](https://assets.portkey.ai/docs/agent_tracing.gif)

अतिरिक्त दस्तावेज़ यहां उपलब्ध हैं:
- ऑब्जर्वेबिलिटी - https://portkey.ai/docs/product/observability-modern-monitoring-for-llms
- एआई गेटवे - https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations
- प्रॉम्प्ट लाइब्रेरी - https://portkey.ai/docs/product/prompt-library

आप हमारे लोकप्रिय ओपन सोर्स एआई गेटवे को यहां देख सकते हैं - https://github.com/portkey-ai/gateway

प्रत्येक सुविधा के बारे में विस्तृत जानकारी और इसका उपयोग कैसे करें, [कृपया पोर्टकी दस्तावेज़ देखें](https://portkey.ai/docs)। यदि आपके कोई प्रश्न हैं या और सहायता की आवश्यकता है, तो [ट्विटर पर हमसे संपर्क करें।](https://twitter.com/portkeyai) या हमारे [समर्थन ईमेल](mailto:hello@portkey.ai) पर।
