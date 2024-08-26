---
translated: true
---

# cassandra-synonym-caching

यह टेम्पलेट Apache Cassandra® या Astra DB के माध्यम से CQL द्वारा समर्थित LLM कैशिंग का उपयोग दर्शाने के लिए एक सरल श्रृंखला टेम्पलेट प्रदान करता है।

## वातावरण सेटअप

अपना वातावरण सेट करने के लिए, आपको निम्नलिखित की आवश्यकता होगी:

- एक [Astra](https://astra.datastax.com) Vector Database (मुफ्त स्तर भी ठीक है!). **आपको एक [डेटाबेस प्रशासक टोकन](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)** की आवश्यकता है, विशेष रूप से `AstraCS:...` से शुरू होने वाला स्ट्रिंग;
- इसी तरह, अपना [डेटाबेस आईडी](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier) तैयार रखें, आपको इसे नीचे दर्ज करना होगा;
- एक **OpenAI API कुंजी**. (अधिक जानकारी [यहाँ](https://cassio.org/start_here/#llm-access), ध्यान दें कि बाहर से इस डेमो में OpenAI का समर्थन है जब तक कि आप कोड में छेड़छाड़ न करें.)

_नोट:_ आप एक नियमित Cassandra क्लस्टर का भी उपयोग कर सकते हैं: ऐसा करने के लिए, सुनिश्चित करें कि आप `.env.template` में दिखाए गए `USE_CASSANDRA_CLUSTER` प्रविष्टि और इसे कनेक्ट करने के लिए आवश्यक वातावरण चर प्रदान करते हैं।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI स्थापित किया जाना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package cassandra-synonym-caching
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add cassandra-synonym-caching
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from cassandra_synonym_caching import chain as cassandra_synonym_caching_chain

add_routes(app, cassandra_synonym_caching_chain, path="/cassandra-synonym-caching")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/cassandra-synonym-caching/playground](http://127.0.0.1:8000/cassandra-synonym-caching/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-synonym-caching")
```

## संदर्भ

स्टैंडअलोन LangServe टेम्पलेट रिपॉजिटरी: [यहाँ](https://github.com/hemidactylus/langserve_cassandra_synonym_caching)।
