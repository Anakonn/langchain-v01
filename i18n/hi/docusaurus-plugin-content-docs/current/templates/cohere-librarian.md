---
translated: true
---

यह टेम्पलेट कोहीर को एक लाइब्रेरियन में बदल देता है।

यह एक राउटर का उपयोग करके विभिन्न चीजों को संभालने वाली श्रृंखलाओं के बीच स्विचिंग का प्रदर्शन करता है: कोहीर एम्बेडिंग्स के साथ एक वेक्टर डेटाबेस; एक चैटबॉट जिसमें लाइब्रेरी के बारे में कुछ जानकारी वाला प्रॉम्प्ट है; और अंत में एक RAG चैटबॉट जिसके पास इंटरनेट तक पहुंच है।

पुस्तक की सिफारिश के लिए एक पूर्ण डेमो के लिए, books_with_blurbs.csv को निम्नलिखित डेटासेट से एक बड़े नमूने से बदलने पर विचार करें: https://www.kaggle.com/datasets/jdobrow/57000-books-with-metadata-and-blurbs/ ।

## वातावरण सेटअप

कोहीर मॉडल तक पहुंच के लिए `COHERE_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package cohere-librarian
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add cohere-librarian
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from cohere_librarian.chain import chain as cohere_librarian_chain

add_routes(app, cohere_librarian_chain, path="/cohere-librarian")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [यहां](https://smith.langchain.com/) साइन अप कर सकते हैं।
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

हम [http://localhost:8000/docs](http://localhost:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://localhost:8000/cohere-librarian/playground](http://localhost:8000/cohere-librarian/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cohere-librarian")
```
