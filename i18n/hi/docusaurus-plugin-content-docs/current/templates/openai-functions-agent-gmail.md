---
translated: true
---

# OpenAI Functions Agent - Gmail

क्या आप कभी इनबॉक्स शून्य तक पहुंचने में संघर्ष कर चुके हैं?

इस टेम्प्लेट का उपयोग करके, आप अपने Gmail खाते का प्रबंधन करने के लिए अपना स्वयं का AI सहायक बना सकते हैं। डिफ़ॉल्ट Gmail उपकरणों का उपयोग करके, यह ईमेल पढ़ सकता है, खोज सकता है और आपकी ओर से प्रतिक्रिया देने के लिए ईमेल ड्राफ्ट कर सकता है। इसके पास Tavily खोज इंजन तक भी पहुंच है, ताकि यह ईमेल थ्रेड में किसी भी विषयों या लोगों के बारे में प्रासंगिक जानकारी खोज सके और लिखने से पहले सुनिश्चित कर सके कि ड्राफ्ट में सभी प्रासंगिक जानकारी शामिल है।

## विवरण

यह सहायक OpenAI के [function calling](https://python.langchain.com/docs/modules/chains/how_to/openai_functions) समर्थन का उपयोग करता है ताकि आप प्रदान किए गए उपकरणों को विश्वसनीय रूप से चुन और उन्हें लागू कर सकें।

यह टेम्प्लेट [langchain-core](https://pypi.org/project/langchain-core/) और [`langchain-community`](https://pypi.org/project/langchain-community/) से सीधे आयात करता है, जहां उचित हो। हमने LangChain को पुनर्गठित किया है ताकि आप अपने उपयोग मामले के लिए आवश्यक विशिष्ट एकीकरण का चयन कर सकें। हालांकि आप अभी भी `langchain` से आयात कर सकते हैं (हम इस संक्रमण को पीछे की ओर संगत बना रहे हैं), हमने अधिकांश वर्गों के घरों को स्वामित्व और आपकी निर्भरता सूचियों को हल्का करने के लिए अलग कर दिया है। आपको जो अधिकांश एकीकरण की आवश्यकता है, उन्हें `langchain-community` पैकेज में पाया जा सकता है, और यदि आप केवल कोर अभिव्यक्ति भाषा API का उपयोग कर रहे हैं, तो आप `langchain-core` पर भी केवल निर्मित कर सकते हैं।

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

OpenAI मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

Tavily खोज तक पहुंच के लिए `TAVILY_API_KEY` पर्यावरण चर सेट करें।

Gmail से OAuth क्लाइंट ID शामिल करने के लिए एक [`credentials.json`](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application) फ़ाइल बनाएं। प्रमाणीकरण को अनुकूलित करने के लिए, [Customize Auth](#customize-auth) अनुभाग देखें।

*नोट: जब आप पहली बार इस ऐप को चलाते हैं, तो यह आपको एक उपयोगकर्ता प्रमाणीकरण प्रवाह से गुजरने के लिए मजबूर करेगा।*

(वैकल्पिक): `GMAIL_AGENT_ENABLE_SEND` को `true` पर सेट करें (या इस टेम्प्लेट में `agent.py` फ़ाइल को संशोधित करें) ताकि इसे "भेजें" उपकरण तक पहुंच मिल जाए। इससे आपके सहायक को आपकी स्पष्ट समीक्षा के बिना ईमेल भेजने की अनुमति मिलेगी, जो सिफारिश नहीं की जाती है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package openai-functions-agent-gmail
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add openai-functions-agent-gmail
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent-gmail")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [साइन अप कर सकते हैं](https://smith.langchain.com/)।
यदि आपके पास पहुंच नहीं है, तो आप इस अनुभाग को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/openai-functions-agent-gmail/playground](http://127.0.0.1:8000/openai-functions-agent/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्प्लेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent-gmail")
```

## प्रमाणीकरण अनुकूलित करें

```python
from langchain_community.tools.gmail.utils import build_resource_service, get_gmail_credentials

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```
