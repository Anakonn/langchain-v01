---
translated: true
---

यह टेम्पलेट आपको एक एलएलएम को नियो4जे के वेक्टर स्टोर का उपयोग करके वेक्टर-आधारित पुनर्प्राप्ति प्रणाली के साथ एकीकृत करने की अनुमति देता है।
इसके अलावा, यह नियो4जे डेटाबेस की ग्राफ क्षमताओं का उपयोग करके किसी विशिष्ट उपयोगकर्ता के सत्र की संवाद इतिहास को संग्रहीत और पुनर्प्राप्त करता है।
ग्राफ के रूप में संवाद इतिहास को संग्रहीत करने से न केवल सुचारु वार्तालाप प्रवाह होता है, बल्कि ग्राफ विश्लेषण के माध्यम से उपयोगकर्ता व्यवहार और पाठ खंड पुनर्प्राप्ति का विश्लेषण करने की भी क्षमता होती है।

## वातावरण सेटअप

आपको निम्नलिखित पर्यावरण चर परिभाषित करने की आवश्यकता है।

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## डेटा से भरना

यदि आप कुछ उदाहरण डेटा से डीबी को भरना चाहते हैं, तो आप `python ingest.py` चला सकते हैं।
स्क्रिप्ट `dune.txt` फ़ाइल से पाठ के खंडों को प्रक्रिया करती है और उन्हें एक नियो4जे ग्राफ डेटाबेस में संग्रहीत करती है।
इसके अलावा, इन एम्बेडिंग्स को कुशलतापूर्वक क्वेरी करने के लिए `dune` नामक एक वेक्टर इंडेक्स भी बनाया जाता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-vector-memory
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add neo4j-vector-memory
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_vector_memory import chain as neo4j_vector_memory_chain

add_routes(app, neo4j_vector_memory_chain, path="/neo4j-vector-memory")
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

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/neo4j-vector-memory/playground](http://127.0.0.1:8000/neo4j-parent/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-vector-memory")
```
