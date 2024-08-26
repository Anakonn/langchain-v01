---
translated: true
---

यह टेम्पलेट [Elasticsearch](https://python.langchain.com/docs/integrations/vectorstores/elasticsearch) का उपयोग करके RAG (Retrieval Augmented Generation) करता है।

यह `MiniLM-L6-v2` सेंटेंस ट्रांसफॉर्मर का उपयोग करता है पैसेज और प्रश्नों को एम्बेड करने के लिए।

## वातावरण सेटअप

`OPENAI_API_KEY` पर्यावरण चर सेट करें OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए।

अपने Elasticsearch इंस्टेंस से कनेक्ट करने के लिए, निम्नलिखित पर्यावरण चरों का उपयोग करें:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

स्थानीय विकास के लिए Docker के साथ, इस्तेमाल करें:

```bash
export ES_URL="http://localhost:9200"
```

और एक Elasticsearch इंस्टेंस चलाएं Docker में

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package rag-elasticsearch
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-elasticsearch
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_elasticsearch import chain as rag_elasticsearch_chain

add_routes(app, rag_elasticsearch_chain, path="/rag-elasticsearch")
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

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-elasticsearch")
```

काल्पनिक कार्यस्थल दस्तावेजों को लोड करने के लिए, इस रिपॉजिटरी के रूट से निम्नलिखित कमांड चलाएं:

```bash
python ingest.py
```

हालांकि, आप [यहां](https://python.langchain.com/docs/integrations/document_loaders) दस्तावेज लोडर्स की एक बड़ी संख्या से चुन सकते हैं।
