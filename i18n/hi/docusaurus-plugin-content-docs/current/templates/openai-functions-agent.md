---
translated: true
---

# openai-functions-agent

यह टेम्पलेट एक एजेंट बनाता है जो OpenAI फ़ंक्शन कॉलिंग का उपयोग करके अपने निर्णयों पर कार्रवाई करने के लिए संचार करता है।

यह उदाहरण एक ऐसा एजेंट बनाता है जो वैकल्पिक रूप से Tavily के सर्च इंजन का उपयोग करके इंटरनेट पर जानकारी खोज सकता है।

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

OpenAI मॉडल तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

Tavily तक पहुंच के लिए `TAVILY_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package openai-functions-agent
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add openai-functions-agent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/openai-functions-agent/playground](http://127.0.0.1:8000/openai-functions-agent/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent")
```
