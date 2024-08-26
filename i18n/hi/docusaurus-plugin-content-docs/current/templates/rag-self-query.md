---
translated: true
---

यह टेम्पलेट RAG का उपयोग करता है, जिसमें सेल्फ-क्वेरी रिट्रीवल तकनीक का उपयोग किया जाता है। मुख्य विचार यह है कि एक एलएलएम को अव्यवस्थित क्वेरी को संरचित क्वेरी में परिवर्तित करने दिया जाए। इस कार्य के बारे में अधिक जानकारी के लिए [दस्तावेज़ देखें](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query)।

## वातावरण सेटअप

इस टेम्पलेट में हम OpenAI मॉडल और एक Elasticsearch वेक्टर स्टोर का उपयोग करेंगे, लेकिन यह दृष्टिकोण सभी एलएलएम/चैट मॉडल और [कई वेक्टर स्टोर](https://python.langchain.com/docs/integrations/retrievers/self_query/) के लिए सामान्य है।

OpenAI मॉडल का उपयोग करने के लिए, `OPENAI_API_KEY` पर्यावरण चर को सेट करें।

अपने Elasticsearch इंस्टांस से कनेक्ट करने के लिए, निम्नलिखित पर्यावरण चरों का उपयोग करें:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

Docker के साथ स्थानीय विकास के लिए, इसका उपयोग करें:

```bash
export ES_URL = "http://localhost:9200"
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package rag-self-query
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-self-query
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_self_query import chain

add_routes(app, chain, path="/rag-elasticsearch")
```

वेक्टर स्टोर को नमूना डेटा से भरने के लिए, डायरेक्टरी के रूट से चलाएं:

```bash
python ingest.py
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस डायरेक्टरी के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा, जिसका सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-self-query")
```
