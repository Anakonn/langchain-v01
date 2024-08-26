---
translated: true
---

यह टेम्पलेट आपको सटीक एम्बेडिंग और संदर्भ संरक्षण के बीच संतुलन बनाने में मदद करता है, जिसके लिए आप दस्तावेज़ों को छोटे टुकड़ों में विभाजित करते हैं और उनके मूल या बड़े पाठ्य जानकारी को पुनः प्राप्त करते हैं।

एक Neo4j वेक्टर इंडेक्स का उपयोग करके, पैकेज वेक्टर समानता खोज का उपयोग करके बच्चे नोड्स को क्वेरी करता है और उचित `retrieval_query` पैरामीटर को परिभाषित करके संबंधित माता-पिता का पाठ्य पुनः प्राप्त करता है।

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
स्क्रिप्ट `dune.txt` फ़ाइल से पाठ्य के खंडों को प्रक्रिया करती है और उन्हें Neo4j ग्राफ डेटाबेस में संग्रहीत करती है।
पहले, पाठ्य को बड़े खंडों ("माता-पिता") में विभाजित किया जाता है और फिर छोटे खंडों ("बच्चे") में और विभाजित किया जाता है, जहां माता-पिता और बच्चे दोनों खंड संदर्भ को बनाए रखने के लिए थोड़ा ओवरलैप करते हैं।
इन खंडों को डेटाबेस में संग्रहीत करने के बाद, बच्चे नोड्स के एम्बेडिंग OpenAI के एम्बेडिंग का उपयोग करके गणना की जाती है और भविष्य के पुनः प्राप्ति या विश्लेषण के लिए ग्राफ में वापस संग्रहीत की जाती है।
इसके अलावा, इन एम्बेडिंग को कुशलतापूर्वक क्वेरी करने के लिए `retrieval` नामक एक वेक्टर इंडेक्स भी बनाया जाता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package neo4j-parent
```

यदि आप किसी मौजूदा प्रोजेक्ट में इसे जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add neo4j-parent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from neo4j_parent import chain as neo4j_parent_chain

add_routes(app, neo4j_parent_chain, path="/neo4j-parent")
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
हम [http://127.0.0.1:8000/neo4j-parent/playground](http://127.0.0.1:8000/neo4j-parent/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-parent")
```
