---
translated: true
---

यह टेम्पलेट Elasticsearch एनालिटिक्स डेटाबेस के साथ प्राकृतिक भाषा का उपयोग करके एलएलएम का उपयोग करके बातचीत करने की अनुमति देता है।

यह Elasticsearch DSL API (फ़िल्टर और एग्रीगेशन) के माध्यम से खोज क्वेरी बनाता है।

## वातावरण सेटअप

`OPENAI_API_KEY` पर्यावरण चर सेट करें OpenAI मॉडल तक पहुंच प्राप्त करने के लिए।

### Elasticsearch इंस्टॉल करना

Elasticsearch को चलाने के कई तरीके हैं। हालांकि, एक अनुशंसित तरीका Elastic Cloud के माध्यम से है।

[Elastic Cloud](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=langserve) पर एक मुफ्त ट्रायल खाता बनाएं।

एक तैनाती के साथ, कनेक्शन स्ट्रिंग अपडेट करें।

पासवर्ड और कनेक्शन (elasticsearch url) तैनाती कंसोल पर पाया जा सकता है।

ध्यान रखें कि Elasticsearch क्लाइंट को सूची सूचीकरण, मैपिंग विवरण और खोज क्वेरी के लिए अनुमतियां होनी चाहिए।

### डेटा से भरना

यदि आप कुछ उदाहरण जानकारी से डीबी को भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।

इससे एक `customers` इंडेक्स बनेगा। इस पैकेज में, हम क्वेरी जनरेट करने के लिए इंडेक्स निर्दिष्ट करते हैं, और हम `["customers"]` निर्दिष्ट करते हैं। यह आपके Elastic इंडेक्स को सेट करने के लिए विशिष्ट है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package elastic-query-generator
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add elastic-query-generator
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from elastic_query_generator.chain import chain as elastic_query_generator_chain

add_routes(app, elastic_query_generator_chain, path="/elastic-query-generator")
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

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/elastic-query-generator/playground](http://127.0.0.1:8000/elastic-query-generator/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/elastic-query-generator")
```
