---
translated: true
---

यह टेम्पलेट आपको वीवेट में हाइब्रिड खोज सुविधा का उपयोग करने का तरीका दिखाता है। हाइब्रिड खोज कई खोज एल्गोरिदम का उपयोग करके खोज परिणामों की सटीकता और प्रासंगिकता को बेहतर बनाता है।

वीवेट स्पार्स और घने वेक्टर का उपयोग करता है ताकि खोज क्वेरी और दस्तावेजों का अर्थ और संदर्भ प्रतिनिधित्व किया जा सके। परिणाम `bm25` और वेक्टर खोज रैंकिंग का संयोजन का उपयोग करते हैं ताकि शीर्ष परिणाम प्राप्त किए जा सकें।

## कॉन्फ़िगरेशन

`chain.py` में कुछ env متغीरों को सेट करके अपने होस्ट किए गए वीवेट वेक्टर स्टोर से कनेक्ट करें:

* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

आप OpenAI मॉडल का उपयोग करने के लिए `OPENAI_API_KEY` भी सेट करना होगा।

## शुरू करें

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI स्थापित किया होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package hybrid-search-weaviate
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add hybrid-search-weaviate
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from hybrid_search_weaviate import chain as hybrid_search_weaviate_chain

add_routes(app, hybrid_search_weaviate_chain, path="/hybrid-search-weaviate")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/hybrid-search-weaviate/playground](http://127.0.0.1:8000/hybrid-search-weaviate/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hybrid-search-weaviate")
```
