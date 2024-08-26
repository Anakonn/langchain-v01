---
translated: true
---

यह टेम्पलेट चेन, एट. अल. द्वारा प्रस्तावित बहु-वेक्टर इंडेक्सिंग रणनीति का प्रदर्शन करता है [घना X पुनर्प्राप्ति: हमें किस पुनर्प्राप्ति विस्तार का उपयोग करना चाहिए?](https://arxiv.org/abs/2312.06648)। प्रोम्प्ट, जिसे आप [हब पर आज़मा सकते हैं](https://smith.langchain.com/hub/wfh/proposal-indexing), एक एलएलएम को संदर्भ-रहित "प्रस्ताव" उत्पन्न करने के लिए निर्देशित करता है जिन्हें वेक्टराइज़ किया जा सकता है ताकि पुनर्प्राप्ति सटीकता बढ़ाई जा सके। आप `proposal_chain.py` में पूर्ण परिभाषा देख सकते हैं।

## भंडारण

इस डेमो के लिए, हम `RecursiveUrlLoader` का उपयोग करके एक सरल शैक्षिक पेपर इंडेक्स करते हैं, और सभी पुनर्प्राप्ति जानकारी को स्थानीय रूप से (क्रोमा और स्थानीय फ़ाइलसिस्टम पर संग्रहीत एक बाइटस्टोर का उपयोग करके) संग्रहीत करते हैं। आप `storage.py` में स्टोरेज लेयर को संशोधित कर सकते हैं।

## वातावरण सेटअप

`OPENAI_API_KEY` वातावरण चर को `gpt-3.5` और OpenAI Embeddings क्लासेस तक पहुंच प्राप्त करने के लिए सेट करें।

## इंडेक्सिंग

निम्नलिखित चलाकर इंडेक्स बनाएं:

```python
poetry install
poetry run python propositional_retrieval/ingest.py
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package propositional-retrieval
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add propositional-retrieval
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from propositional_retrieval import chain

add_routes(app, chain, path="/propositional-retrieval")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/propositional-retrieval/playground](http://127.0.0.1:8000/propositional-retrieval/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/propositional-retrieval")
```
