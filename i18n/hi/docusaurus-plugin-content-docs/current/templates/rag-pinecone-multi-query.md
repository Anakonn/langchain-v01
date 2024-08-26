---
translated: true
---

# rag-pinecone-multi-query

यह टेम्पलेट पाइनकोन और ओपनएआई का उपयोग करके एक बहु-क्वेरी रिट्रीवर के साथ RAG करता है।

यह एक एलएलएम का उपयोग करता है ताकि उपयोगकर्ता के इनपुट क्वेरी के आधार पर विभिन्न दृष्टिकोणों से कई क्वेरी उत्पन्न कर सके।

प्रत्येक क्वेरी के लिए, यह प्रासंगिक दस्तावेजों का एक सेट पुनर्प्राप्त करता है और उत्तर संश्लेषण के लिए सभी क्वेरियों के अद्वितीय संयोजन को लेता है।

## वातावरण सेटअप

यह टेम्पलेट पाइनकोन को एक वेक्टर स्टोर के रूप में उपयोग करता है और यह आवश्यक है कि `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, और `PINECONE_INDEX` सेट किए जाएं।

ओपनएआई मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपको पहले लैंगचेन CLI स्थापित करना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया लैंगचेन प्रोजेक्ट बनाने और इस पैकेज को स्थापित करने के लिए, करें:

```shell
langchain app new my-app --package rag-pinecone-multi-query
```

किसी मौजूदा प्रोजेक्ट में इस पैकेज को जोड़ने के लिए, चलाएं:

```shell
langchain app add rag-pinecone-multi-query
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_pinecone_multi_query import chain as rag_pinecone_multi_query_chain

add_routes(app, rag_pinecone_multi_query_chain, path="/rag-pinecone-multi-query")
```

(वैकल्पिक) अब, आइए लैंगस्मिथ को कॉन्फ़िगर करें। लैंगस्मिथ हमें लैंगचेन अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा। आप यहां [यहां](https://smith.langchain.com/) लैंगस्मिथ के लिए साइन अप कर सकते हैं। यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक लैंगसर्व इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहे सर्वर के साथ FastAPI ऐप शुरू करेगा।

आप [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
आप [http://127.0.0.1:8000/rag-pinecone-multi-query/playground](http://127.0.0.1:8000/rag-pinecone-multi-query/playground) पर खेल सकते हैं।

कोड से टेम्पलेट तक पहुंचने के लिए, उपयोग करें:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-multi-query")
```
