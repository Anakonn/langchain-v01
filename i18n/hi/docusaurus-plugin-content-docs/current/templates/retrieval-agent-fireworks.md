---
translated: true
---

# retrieval-agent-fireworks

यह पैकेज FireworksAI पर होस्ट किए गए ओपन सोर्स मॉडल का उपयोग करके एक एजेंट वास्तुकला का उपयोग करके पुनर्प्राप्ति करता है। डिफ़ॉल्ट रूप से, यह Arxiv पर पुनर्प्राप्ति करता है।

हम `Mixtral8x7b-instruct-v0.1` का उपयोग करेंगे, जो इस ब्लॉग में दिखाया गया है कि यह कार्य कॉलिंग के साथ उचित परिणाम देता है, भले ही यह इस कार्य के लिए फ़ाइन-ट्यून नहीं किया गया है: https://huggingface.co/blog/open-source-llms-as-agents

## वातावरण सेटअप

ओएसएस मॉडल को चलाने के लिए कई महान तरीके हैं। हम FireworksAI का उपयोग करेंगे क्योंकि यह मॉडल को चलाने का एक आसान तरीका है। अधिक जानकारी के लिए [यहां](https://python.langchain.com/docs/integrations/providers/fireworks) देखें।

`FIREWORKS_API_KEY` पर्यावरण चर को Fireworks तक पहुंच प्राप्त करने के लिए सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package retrieval-agent-fireworks
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add retrieval-agent-fireworks
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from retrieval_agent_fireworks import chain as retrieval_agent_fireworks_chain

add_routes(app, retrieval_agent_fireworks_chain, path="/retrieval-agent-fireworks")
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

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/retrieval-agent-fireworks/playground](http://127.0.0.1:8000/retrieval-agent-fireworks/playground) पर खेल सकते हैं।

हम कोड से टेम्प्लेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent-fireworks")
```
