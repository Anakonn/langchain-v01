---
translated: true
---

यह टेम्पलेट एक एजेंट बनाता है जो एक एकल एलएलएम को कई व्यक्तित्वों के साथ स्वयं-सहयोग करके एक संज्ञानात्मक सहयोगी में बदल देता है।
संज्ञानात्मक सहयोगी का अर्थ है एक बुद्धिमान एजेंट जो कई मनों के साथ सहयोग करता है, उनकी व्यक्तिगत ताकतों और ज्ञान को मिलाकर, जटिल कार्यों में समस्या-समाधान और समग्र प्रदर्शन को बढ़ाता है। कार्य इनपुट के आधार पर विभिन्न व्यक्तित्वों को गतिशील रूप से पहचानकर और उनका अनुकरण करके, SPP एलएलएम में संज्ञानात्मक सहयोग की क्षमता को खोलता है।

यह टेम्पलेट `DuckDuckGo` खोज एपीआई का उपयोग करेगा।

## वातावरण सेटअप

यह टेम्पलेट `OpenAI` का उपयोग करेगा।
सुनिश्चित करें कि आपके वातावरण में `OPENAI_API_KEY` सेट है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package solo-performance-prompting-agent
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add solo-performance-prompting-agent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from solo_performance_prompting_agent.agent import agent_executor as solo_performance_prompting_agent_chain

add_routes(app, solo_performance_prompting_agent_chain, path="/solo-performance-prompting-agent")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
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

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/solo-performance-prompting-agent/playground](http://127.0.0.1:8000/solo-performance-prompting-agent/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/solo-performance-prompting-agent")
```
