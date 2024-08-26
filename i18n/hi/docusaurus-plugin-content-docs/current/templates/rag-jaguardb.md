---
translated: true
---

# rag-jaguardb

यह टेम्पलेट JaguarDB और OpenAI का उपयोग करके RAG करता है।

## वातावरण सेटअप

आपको दो पर्यावरण चर निर्यात करने चाहिए, एक आपका Jaguar URI और दूसरा आपका OpenAI API कुंजी।
यदि आपके पास JaguarDB सेट अप नहीं है, तो नीचे दिए गए `सेटअप जगुआर` खंड में दिए गए निर्देशों का पालन करके ऐसा करें।

```shell
export JAGUAR_API_KEY=...
export OPENAI_API_KEY=...
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-jaguardb
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-jagaurdb
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_jaguardb import chain as rag_jaguardb

add_routes(app, rag_jaguardb_chain, path="/rag-jaguardb")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/rag-jaguardb/playground](http://127.0.0.1:8000/rag-jaguardb/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-jaguardb")
```

## JaguarDB सेटअप

JaguarDB का उपयोग करने के लिए, आप docker pull और docker run कमांड का उपयोग करके JaguarDB को तेजी से सेट अप कर सकते हैं।

```shell
docker pull jaguardb/jaguardb
docker run -d -p 8888:8888 --name jaguardb jaguardb/jaguardb
```

JaguarDB सर्वर के साथ बातचीत करने के लिए JaguarDB क्लाइंट टर्मिनल लॉन्च करने के लिए:

```shell
docker exec -it jaguardb /home/jaguar/jaguar/bin/jag

```

एक और विकल्प है कि आप Linux पर पहले से बने बाइनरी पैकेज डाउनलोड करें और एक नोड या नोड के क्लस्टर पर डेटाबेस को तैनात करें। इस सरलीकृत प्रक्रिया से आप JaguarDB का उपयोग शुरू कर सकते हैं और इसकी शक्तिशाली सुविधाओं और कार्यक्षमता का लाभ उठा सकते हैं। [यहाँ](http://www.jaguardb.com/download.html)।
