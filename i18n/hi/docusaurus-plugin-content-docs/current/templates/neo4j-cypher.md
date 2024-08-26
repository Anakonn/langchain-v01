---
translated: true
---

# neo4j_cypher

यह टेम्प्लेट आपको OpenAI LLM का उपयोग करके प्राकृतिक भाषा में एक Neo4j ग्राफ डेटाबेस के साथ संवाद करने में मदद करता है।

यह एक प्राकृतिक भाषा प्रश्न को Cypher क्वेरी (Neo4j डेटाबेस से डेटा प्राप्त करने के लिए उपयोग किया जाता है) में रूपांतरित करता है, क्वेरी को निष्पादित करता है, और क्वेरी परिणामों के आधार पर एक प्राकृतिक भाषा प्रतिक्रिया प्रदान करता है।

[](https://medium.com/neo4j/langchain-cypher-search-tips-tricks-f7c9e9abca4d)

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर परिभाषित करें:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Neo4j डेटाबेस सेटअप

Neo4j डेटाबेस सेट करने के कई तरीके हैं।

### Neo4j Aura

Neo4j AuraDB एक पूरी तरह से प्रबंधित क्लाउड ग्राफ डेटाबेस सेवा है।
[Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve) पर एक मुफ्त उदाहरण बनाएं।
जब आप एक मुफ्त डेटाबेस उदाहरण प्रारंभ करते हैं, तो आप डेटाबेस तक पहुंच प्राप्त करने के लिए क्रेडेंशियल प्राप्त करेंगे।

## डेटा से भरना

यदि आप डेटाबेस को कुछ उदाहरण डेटा से भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।
यह स्क्रिप्ट डेटाबेस में नमूना फिल्म डेटा भर देगी।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-cypher
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add neo4j-cypher
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_cypher import chain as neo4j_cypher_chain

add_routes(app, neo4j_cypher_chain, path="/neo4j-cypher")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe उदाहरण चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/neo4j_cypher/playground](http://127.0.0.1:8000/neo4j_cypher/playground) पर खेल सकते हैं।

हम कोड से टेम्प्लेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher")
```
