---
translated: true
---

# extraction-anthropic-functions

यह टेम्पलेट [Anthropic function calling](https://python.langchain.com/docs/integrations/chat/anthropic_functions) सक्षम बनाता है।

इसका उपयोग विभिन्न कार्यों के लिए किया जा सकता है, जैसे कि extraction या टैगिंग।

function output schema को `chain.py` में सेट किया जा सकता है।

## Environment Setup

Anthropic मॉडल्स तक पहुंचने के लिए `ANTHROPIC_API_KEY` environment variable सेट करें।

## Usage

इस पैकेज का उपयोग करने के लिए, पहले LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे केवल एक पैकेज के रूप में स्थापित करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package extraction-anthropic-functions
```

यदि आप इसे मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस चला सकते हैं:

```shell
langchain app add extraction-anthropic-functions
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from extraction_anthropic_functions import chain as extraction_anthropic_functions_chain

add_routes(app, extraction_anthropic_functions_chain, path="/extraction-anthropic-functions")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain एप्लिकेशन का trace, monitor और debug करने में मदद करेगा।
आप LangSmith के लिए [यहाँ](https://smith.langchain.com/) साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस अनुभाग को छोड़ सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस डायरेक्टरी में हैं, तो आप सीधे एक LangServe instance स्पिन कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को स्टार्ट कर देगा और एक सर्वर लोकली चल रहा होगा
[http://localhost:8000](http://localhost:8000)

हम सभी टेम्पलेट्स को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
हम प्लेग्राउंड को [http://127.0.0.1:8000/extraction-anthropic-functions/playground](http://127.0.0.1:8000/extraction-anthropic-functions/playground) पर एक्सेस कर सकते हैं

हम टेम्पलेट को कोड से एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-anthropic-functions")
```

डिफ़ॉल्ट रूप से, पैकेज आपके द्वारा `chain.py` में निर्दिष्ट जानकारी से पेपर्स के शीर्षक और लेखक को extract करेगा। यह टेम्पलेट डिफ़ॉल्ट रूप से `Claude2` का उपयोग करेगा।
