---
translated: true
---

# हाइड

यह टेम्पलेट RAG के साथ HyDE का उपयोग करता है।

हाइड एक पुनर्प्राप्ति विधि है जो कि कल्पनात्मक दस्तावेज़ एम्बेडिंग्स (HyDE) के लिए खड़ा है। यह एक ऐसी विधि है जिसका उपयोग पुनर्प्राप्ति को बढ़ाने के लिए किया जाता है, जिसमें एक आने वाली क्वेरी के लिए एक कल्पनात्मक दस्तावेज़ उत्पन्न किया जाता है।

फिर दस्तावेज़ को एम्बेड किया जाता है, और उस एम्बेडिंग का उपयोग वास्तविक दस्तावेजों को खोजने के लिए किया जाता है जो कि कल्पनात्मक दस्तावेज़ के समान हैं।

मूलभूत अवधारणा यह है कि कल्पनात्मक दस्तावेज़ एम्बेडिंग स्पेस में क्वेरी से अधिक नज़दीक हो सकता है।

अधिक विस्तृत विवरण के लिए, कृपया [यहां](https://arxiv.org/abs/2212.10496) पेपर देखें।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package hyde
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add hyde
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from hyde.chain import chain as hyde_chain

add_routes(app, hyde_chain, path="/hyde")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
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

यह FastAPI ऐप को चालू करेगा जिसका सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/hyde/playground](http://127.0.0.1:8000/hyde/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hyde")
```
