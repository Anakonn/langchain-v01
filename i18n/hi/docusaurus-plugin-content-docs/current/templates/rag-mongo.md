---
translated: true
---

# rag-mongo

यह टेम्पलेट MongoDB और OpenAI का उपयोग करके RAG करता है।

## वातावरण सेटअप

आपको दो पर्यावरण चर निर्यात करने चाहिए, एक MongoDB URI और दूसरा OpenAI API KEY।
यदि आपके पास MongoDB URI नहीं है, तो नीचे दिए गए `Setup Mongo` खंड में निर्देशों का पालन करें।

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-mongo
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस निम्नलिखित चला सकते हैं:

```shell
langchain app add rag-mongo
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_mongo import chain as rag_mongo_chain

add_routes(app, rag_mongo_chain, path="/rag-mongo")
```

यदि आप एक इंजेस्टन पाइपलाइन सेट करना चाहते हैं, तो आप अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ सकते हैं:

```python
from rag_mongo import ingest as rag_mongo_ingest

add_routes(app, rag_mongo_ingest, path="/rag-mongo-ingest")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आपके पास पहले से कोई Mongo Search Index नहीं है जिससे आप कनेक्ट करना चाहते हैं, तो आगे बढ़ने से पहले `MongoDB Setup` खंड देखें।

यदि आपके पास एक MongoDB Search index है जिससे आप कनेक्ट करना चाहते हैं, तो `rag_mongo/chain.py` में कनेक्शन विवरण संपादित करें।

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
हम [http://127.0.0.1:8000/rag-mongo/playground](http://127.0.0.1:8000/rag-mongo/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-mongo")
```

अधिक संदर्भ के लिए, कृपया [इस नोटबुक](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB) का संदर्भ लें।

## MongoDB Setup

यह कदम उपयोग करें यदि आपको अपने MongoDB खाते और डेटा इंजेस्ट करने की आवश्यकता है।
हम पहले मानक MongoDB Atlas सेटअप निर्देशों का पालन करेंगे [यहाँ](https://www.mongodb.com/docs/atlas/getting-started/)।

1. एक खाता बनाएं (यदि पहले से नहीं किया गया है)
2. एक नया प्रोजेक्ट बनाएं (यदि पहले से नहीं किया गया है)
3. अपने MongoDB URI का पता लगाएं।

यह डिप्लॉयमेंट ओवरव्यू पेज पर जाकर और अपने डेटाबेस से कनेक्ट करके किया जा सकता है।

फिर हम उपलब्ध ड्राइवरों पर नज़र डालते हैं।

जिनमें से हमें हमारा URI सूचीबद्ध दिखाई देगा।

चलो फिर उसे स्थानीय रूप से एक पर्यावरण चर के रूप में सेट करते हैं:

```shell
export MONGO_URI=...
```

4. हम OpenAI के लिए भी एक पर्यावरण चर सेट करेंगे (जिसका हम एक LLM के रूप में उपयोग करेंगे)।

```shell
export OPENAI_API_KEY=...
```

5. अब कुछ डेटा इंजेस्ट करते हैं! हम इस निर्देशिका में जाकर और `ingest.py` में कोड चलाकर ऐसा कर सकते हैं, उदाहरण के लिए:

```shell
python ingest.py
```

ध्यान रखें कि आप इसे अपने पसंद के डेटा को इंजेस्ट करने के लिए बदल सकते हैं।

6. अब हमें अपने डेटा पर एक वेक्टर इंडेक्स सेट करना होगा।

हम पहले उस क्लस्टर से कनेक्ट कर सकते हैं जहां हमारा डेटाबेस मौजूद है।

फिर हम उन सभी संग्रहों की सूची में नेविगेट कर सकते हैं।

फिर हम उस संग्रह को ढूंढ सकते हैं जिसे हम चाहते हैं और उसके लिए खोज इंडेक्स देख सकते हैं।

यह संभवतः खाली होगा, और हमें एक नया बनाना होगा:

हम JSON एडिटर का उपयोग करके इसे बनाएंगे।

और हम निम्नलिखित JSON को पेस्ट करेंगे:

```text
 {
   "mappings": {
     "dynamic": true,
     "fields": {
       "embedding": {
         "dimensions": 1536,
         "similarity": "cosine",
         "type": "knnVector"
       }
     }
   }
 }
```

वहां से, "Next" पर क्लिक करें और फिर "Create Search Index" पर। यह थोड़ा समय लेगा लेकिन आपके पास फिर अपने डेटा पर एक इंडेक्स होना चाहिए!
