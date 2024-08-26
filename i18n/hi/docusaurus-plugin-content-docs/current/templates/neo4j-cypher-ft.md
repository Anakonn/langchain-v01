---
translated: true
---

यह टेम्पलेट आपको OpenAI के LLM का उपयोग करके प्राकृतिक भाषा का उपयोग करके Neo4j ग्राफ डेटाबेस के साथ बातचीत करने की अनुमति देता है।

इसका मुख्य कार्य प्राकृतिक भाषा प्रश्नों को Cypher क्वेरियों (Neo4j डेटाबेस को क्वेरी करने के लिए उपयोग किया जाने वाला भाषा) में परिवर्तित करना, इन क्वेरियों को निष्पादित करना और क्वेरी के परिणामों के आधार पर प्राकृतिक भाषा प्रतिक्रियाएं प्रदान करना है।

पैकेज एक पूर्ण-पाठ्य सूचकांक का उपयोग करता है जिससे पाठ्य मूल्यों को डेटाबेस प्रविष्टियों से कुशलतापूर्वक मैप किया जा सकता है, इसलिए सटीक Cypher वक्तव्यों के उत्पादन को बढ़ावा मिलता है।

प्रदान किए गए उदाहरण में, पूर्ण-पाठ्य सूचकांक का उपयोग उपयोगकर्ता के क्वेरी से व्यक्तियों और फिल्मों के नामों को संबंधित डेटाबेस प्रविष्टियों से मैप करने के लिए किया जाता है।

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

इसके अलावा, यदि आप कुछ उदाहरण डेटा को डेटाबेस में भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।
यह स्क्रिप्ट नमूना मूवी डेटा से डेटाबेस को भरेगी और `entity` नाम का एक पूर्ण-पाठ्य सूचकांक बनाएगी, जिसका उपयोग सटीक Cypher वक्तव्य उत्पादन के लिए उपयोगकर्ता इनपुट से व्यक्ति और फिल्मों को मैप करने के लिए किया जाता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-cypher-ft
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add neo4j-cypher-ft
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_cypher_ft import chain as neo4j_cypher_ft_chain

add_routes(app, neo4j_cypher_ft_chain, path="/neo4j-cypher-ft")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इसी निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर सर्वर चलाएगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/neo4j-cypher-ft/playground](http://127.0.0.1:8000/neo4j-cypher-ft/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-ft")
```
