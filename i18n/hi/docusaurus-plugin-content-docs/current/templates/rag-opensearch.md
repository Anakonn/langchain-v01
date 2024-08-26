---
translated: true
---

यह टेम्पलेट [OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch) का उपयोग करके RAG को करता है।

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करें।

- `OPENAI_API_KEY` - OpenAI एम्बेडिंग्स और मॉडल्स तक पहुंचने के लिए।

और वैकल्पिक रूप से, यदि डिफ़ॉल्ट का उपयोग नहीं कर रहे हैं, तो OpenSearch वाले भी सेट करें:

- `OPENSEARCH_URL` - होस्ट किए गए OpenSearch इंस्टेंस का URL
- `OPENSEARCH_USERNAME` - OpenSearch इंस्टेंस के लिए उपयोगकर्ता नाम
- `OPENSEARCH_PASSWORD` - OpenSearch इंस्टेंस के लिए पासवर्ड
- `OPENSEARCH_INDEX_NAME` - सूचकांक का नाम

डॉकर में डिफ़ॉल्ट OpenSeach इंस्टेंस चलाने के लिए, आप निम्न कमांड का उपयोग कर सकते हैं।

```shell
docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" --name opensearch-node -d opensearchproject/opensearch:latest
```

नोट: `langchain-test` नामक डमी सूचकांक में डमी दस्तावेज़ लोड करने के लिए, पैकेज में `python dummy_index_setup.py` चलाएं।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-opensearch
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस निम्न चला सकते हैं:

```shell
langchain app add rag-opensearch
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_opensearch import chain as rag_opensearch_chain

add_routes(app, rag_opensearch_chain, path="/rag-opensearch")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [LangSmith](https://smith.langchain.com/) के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/rag-opensearch/playground](http://127.0.0.1:8000/rag-opensearch/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-opensearch")
```
