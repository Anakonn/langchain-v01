---
translated: true
---

# RAG के साथ कई सूचकांक (रूटिंग)

एक क्यूए एप्लिकेशन जो उपयोगकर्ता के प्रश्न के आधार पर विभिन्न डोमेन-विशिष्ट पुनर्प्राप्तकर्ताओं के बीच मार्गप्रदर्शन करता है।

## वातावरण सेटअप

यह एप्लिकेशन PubMed, ArXiv, Wikipedia और [Kay AI](https://www.kay.ai) (SEC फाइलिंग के लिए) का प्रश्न करता है।

आपको एक मुफ्त Kay AI खाता बनाना होगा और [यहां से अपना API कुंजी प्राप्त करना होगा](https://www.kay.ai)।
फिर वातावरण चर सेट करें:

```bash
export KAY_API_KEY="<YOUR_API_KEY>"
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-multi-index-router
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-multi-index-router
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_multi_index_router import chain as rag_multi_index_router_chain

add_routes(app, rag_multi_index_router_chain, path="/rag-multi-index-router")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain एप्लिकेशनों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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

हम सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
हम [http://127.0.0.1:8000/rag-multi-index-router/playground](http://127.0.0.1:8000/rag-multi-index-router/playground) पर खेल मैदान तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-index-router")
```
