---
translated: true
---

# gemini-functions-agent

यह टेम्प्लेट एक एजेंट बनाता है जो Google Gemini फ़ंक्शन कॉलिंग का उपयोग करके अपने निर्णयों पर कार्रवाई करने के लिए संचार करता है।

यह उदाहरण एक ऐसा एजेंट बनाता है जो वैकल्पिक रूप से Tavily के सर्च इंजन का उपयोग करके इंटरनेट पर जानकारी खोज सकता है।

[यहाँ एक उदाहरण LangSmith ट्रेस देखें](https://smith.langchain.com/public/0ebf1bd6-b048-4019-b4de-25efe8d3d18c/r)

## Environment Setup

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

`TAVILY_API_KEY` पर्यावरण चर को Tavily तक पहुंच प्राप्त करने के लिए सेट करें

`GOOGLE_API_KEY` पर्यावरण चर को Google Gemini APIs तक पहुंच प्राप्त करने के लिए सेट करें।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package gemini-functions-agent
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add gemini-functions-agent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from gemini_functions_agent import agent_executor as gemini_functions_agent_chain

add_routes(app, gemini_functions_agent_chain, path="/openai-functions-agent")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/gemini-functions-agent/playground](http://127.0.0.1:8000/gemini-functions-agent/playground) पर खेल सकते हैं।

हम कोड से टेम्प्लेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/gemini-functions-agent")
```
