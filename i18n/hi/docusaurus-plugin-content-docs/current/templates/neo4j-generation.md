---
translated: true
---

# neo4j-generation

यह टेम्प्लेट एलएलएम-आधारित नॉलेज ग्राफ एक्सट्रैक्शन को Neo4j AuraDB, एक पूरी तरह से प्रबंधित क्लाउड ग्राफ डेटाबेस के साथ जोड़ता है।

आप [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve) पर एक मुफ्त इंस्टेंस बना सकते हैं।

जब आप एक मुफ्त डेटाबेस इंस्टेंस शुरू करते हैं, तो आपको डेटाबेस तक पहुंचने के लिए क्रेडेंशियल मिलेंगे।

यह टेम्प्लेट लचीला है और उपयोगकर्ताओं को नोड लेबल और रिश्ते के प्रकारों की एक सूची निर्दिष्ट करके निष्कर्षण प्रक्रिया को मार्गदर्शित करने की अनुमति देता है।

इस पैकेज की कार्यक्षमता और क्षमताओं के बारे में अधिक जानकारी के लिए, कृपया [इस ब्लॉग पोस्ट](https://blog.langchain.dev/constructing-knowledge-graphs-from-text-using-openai-functions/) देखें।

## वातावरण सेटअप

आपको निम्नलिखित पर्यावरण चर सेट करने की आवश्यकता है:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-generation
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add neo4j-generation
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_generation.chain import chain as neo4j_generation_chain

add_routes(app, neo4j_generation_chain, path="/neo4j-generation")
```

(वैकल्पिक) अब चलो LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/neo4j-generation/playground](http://127.0.0.1:8000/neo4j-generation/playground) पर खेल सकते हैं।

हम कोड से टेम्प्लेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-generation")
```
