---
translated: true
---

# cassandra-entomology-rag

यह टेम्पलेट Apache Cassandra® या Astra DB के माध्यम से CQL (`Cassandra` vector store class) का उपयोग करके RAG करेगा

## वातावरण सेटअप

सेटअप के लिए, आपको निम्नलिखित की आवश्यकता होगी:
- एक [Astra](https://astra.datastax.com) Vector Database। आपके पास एक [डेटाबेस प्रशासक टोकन](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure) होना चाहिए, विशेष रूप से `AstraCS:...` से शुरू होने वाला स्ट्रिंग।
- [डेटाबेस आईडी](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier)।
- एक **OpenAI API कुंजी**। (अधिक जानकारी [यहां](https://cassio.org/start_here/#llm-access))

आप एक नियमित Cassandra क्लस्टर का भी उपयोग कर सकते हैं। इस मामले में, `.env.template` में दिखाए गए `USE_CASSANDRA_CLUSTER` प्रविष्टि और इसके बाद के वातावरण चर प्रदान करें ताकि इसे कनेक्ट करने के लिए कैसे निर्दिष्ट किया जाए।

कनेक्शन पैरामीटर और गोपनीय जानकारी को वातावरण चरों के माध्यम से प्रदान किया जाना चाहिए। आवश्यक चरों के लिए `.env.template` देखें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package cassandra-entomology-rag
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस निम्नलिखित चला सकते हैं:

```shell
langchain app add cassandra-entomology-rag
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from cassandra_entomology_rag import chain as cassandra_entomology_rag_chain

add_routes(app, cassandra_entomology_rag_chain, path="/cassandra-entomology-rag")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/cassandra-entomology-rag/playground](http://127.0.0.1:8000/cassandra-entomology-rag/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-entomology-rag")
```

## संदर्भ

LangServe श्रृंखला के साथ स्टैंडअलोन रिपॉजिटरी: [यहां](https://github.com/hemidactylus/langserve_cassandra_entomology_rag)।
