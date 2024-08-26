---
translated: true
---

यह टेम्पलेट एक एजेंट को लागू करने के लिए डिज़ाइन किया गया है जो नियो4j जैसे ग्राफ़ डेटाबेस के साथ मिक्स्ट्रल के माध्यम से JSON-आधारित एजेंट के रूप में एक सेमेंटिक लेयर के माध्यम से बातचीत कर सकता है।
सेमेंटिक लेयर एजेंट को एक रोबस्ट टूल सूट से लैस करता है, जो उसे उपयोगकर्ता के इरादे के आधार पर ग्राफ़ डेटाबेस के साथ बातचीत करने में सक्षम बनाता है।
सेमेंटिक लेयर टेम्पलेट के बारे में अधिक जानकारी के लिए [संबंधित ब्लॉग पोस्ट](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49) और विशेष रूप से [ओल्लामा के साथ मिक्स्ट्रल एजेंट](https://blog.langchain.dev/json-based-agents-with-ollama-and-langchain/) के बारे में जानें।

## उपकरण

एजेंट नियो4j ग्राफ़ डेटाबेस के साथ प्रभावी ढंग से बातचीत करने के लिए कई उपकरणों का उपयोग करता है:

1. **सूचना उपकरण**:
   - फिल्मों या व्यक्तियों के बारे में डेटा प्राप्त करता है, जिससे एजेंट को नवीनतम और सबसे प्रासंगिक जानकारी तक पहुंच मिलती है।
2. **अनुशंसा उपकरण**:
   - उपयोगकर्ता की प्राथमिकताओं और इनपुट के आधार पर फिल्म अनुशंसाएं प्रदान करता है।
3. **मेमोरी उपकरण**:
   - उपयोगकर्ता की प्राथमिकताओं के बारे में जानकारी ज्ञान ग्राफ में संग्रहीत करता है, जिससे कई इंटरैक्शनों के माध्यम से एक व्यक्तिगत अनुभव प्रदान किया जा सकता है।
4. **छोटी बातचीत उपकरण**:
   - एजेंट को छोटी बातचीत से निपटने में सक्षम बनाता है।

## वातावरण सेटअप

इस टेम्पलेट का उपयोग करने से पहले, आपको ओल्लामा और नियो4j डेटाबेस को सेट अप करना होगा।

1. [यहां](https://python.langchain.com/docs/integrations/chat/ollama) दिए गए निर्देशों का पालन करें ताकि आप ओल्लामा डाउनलोड कर सकें।

2. अपने रुचि के एलएलएम को डाउनलोड करें:

    * यह पैकेज `mixtral` का उपयोग करता है: `ollama pull mixtral`
    * आप [यहां](https://ollama.ai/library) से कई एलएलएम का चयन कर सकते हैं

आपको निम्नलिखित पर्यावरण चर परिभाषित करने की आवश्यकता है।

```shell
OLLAMA_BASE_URL=<YOUR_OLLAMA_URL>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## डेटा से भरना

यदि आप उदाहरण फिल्म डेटासेट के साथ डीबी को भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।
स्क्रिप्ट फिल्मों और उपयोगकर्ताओं द्वारा उनके रेटिंग के बारे में जानकारी आयात करती है।
इसके अलावा, स्क्रिप्ट दो [पूर्णपाठ सूचकांक](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/) बनाती है, जिनका उपयोग उपयोगकर्ता इनपुट से डेटाबेस में जानकारी मैप करने के लिए किया जाता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-semantic-ollama
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add neo4j-semantic-ollama
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-ollama")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/neo4j-semantic-ollama/playground](http://127.0.0.1:8000/neo4j-semantic-ollama/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-ollama")
```
