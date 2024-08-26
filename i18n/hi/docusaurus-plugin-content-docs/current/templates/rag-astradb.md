---
translated: true
---

# rag-astradb

यह टेम्पलेट AstraDB (`AstraDB` वेक्टर स्टोर क्लास) का उपयोग करके RAG करेगा

## वातावरण सेटअप

एक [Astra DB](https://astra.datastax.com) डेटाबेस की आवश्यकता है; मुफ्त टियर ठीक है।

- आपको डेटाबेस **API एंडपॉइंट** (जैसे `https://0123...-us-east1.apps.astra.datastax.com`) की आवश्यकता है...
- ... और एक **टोकन** (`AstraCS:...`)।

इसके अलावा, एक **OpenAI API कुंजी** की आवश्यकता है। _ध्यान दें कि बिना किसी संशोधन के यह डेमो केवल OpenAI का समर्थन करता है।_

कनेक्शन पैरामीटर और गोपनीय जानकारी को पर्यावरण चर के माध्यम से प्रदान करें। कृपया `.env.template` देखें चर के नाम के लिए।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-astradb
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-astradb
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from astradb_entomology_rag import chain as astradb_entomology_rag_chain

add_routes(app, astradb_entomology_rag_chain, path="/rag-astradb")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [sign up for LangSmith](https://smith.langchain.com/)।
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

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-astradb/playground](http://127.0.0.1:8000/rag-astradb/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-astradb")
```

## संदर्भ

LangServe श्रृंखला के साथ स्टैंडअलोन रिपॉजिटरी: [यहां](https://github.com/hemidactylus/langserve_astradb_entomology_rag)।
