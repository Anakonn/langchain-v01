---
translated: true
---

यह टेम्पलेट एक ऐसे एजेंट को लागू करने के लिए डिज़ाइन किया गया है जो OpenAI फ़ंक्शन कॉलिंग का उपयोग करके नियो4जे ग्राफ़ डेटाबेस के साथ एक सेमांटिक लेयर के माध्यम से बातचीत कर सकता है।
सेमांटिक लेयर एजेंट को एक रोबस्ट टूल सूट प्रदान करता है, जिससे वह उपयोगकर्ता के इरादे के आधार पर ग्राफ़ डेटाबेस के साथ बातचीत कर सकता है।
सेमांटिक लेयर टेम्पलेट के बारे में अधिक जानकारी के लिए [corresponding blog post](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49) देखें।

## उपकरण

एजेंट नियो4जे ग्राफ़ डेटाबेस के साथ प्रभावी ढंग से बातचीत करने के लिए कई उपकरणों का उपयोग करता है:

1. **सूचना उपकरण**:
   - मूवीज या व्यक्तियों के बारे में डेटा प्राप्त करता है, ताकि एजेंट को नवीनतम और सबसे प्रासंगिक जानकारी तक पहुंच मिल सके।
2. **अनुशंसा उपकरण**:
   - उपयोगकर्ता की पसंद और इनपुट के आधार पर मूवी अनुशंसाएं प्रदान करता है।
3. **मेमोरी उपकरण**:
   - उपयोगकर्ता की पसंद के बारे में जानकारी को ज्ञान ग्राफ़ में संग्रहीत करता है, जिससे कई इंटरैक्शन के दौरान एक अनुकूलित अनुभव प्राप्त हो सके।

## वातावरण सेटअप

आपको निम्नलिखित पर्यावरण चर परिभाषित करने की आवश्यकता है।

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## डेटा से भरना

यदि आप उदाहरण मूवी डेटासेट के साथ डीबी को भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।
स्क्रिप्ट मूवीज और उपयोगकर्ताओं द्वारा उनके रेटिंग के बारे में जानकारी आयात करती है।
इसके अलावा, स्क्रिप्ट दो [fulltext indices](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/) बनाती है, जो उपयोगकर्ता इनपुट से डेटाबेस में जानकारी को मैप करने के लिए उपयोग किए जाते हैं।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-semantic-layer
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add neo4j-semantic-layer
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-layer")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
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

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/neo4j-semantic-layer/playground](http://127.0.0.1:8000/neo4j-semantic-layer/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-layer")
```
