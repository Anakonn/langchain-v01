---
translated: true
---

यह टेम्पलेट दिखाता है कि कैसे समय-आधारित घटक के साथ स्वयं-प्रश्न पुनर्प्राप्तकर्ता का उपयोग करके समानता और समय पर हाइब्रिड खोज करने के लिए timescale-vector का उपयोग किया जाता है।
यह तब उपयोगी है जब आपके डेटा में एक मजबूत समय-आधारित घटक होता है। ऐसे डेटा के कुछ उदाहरण हैं:
- समाचार लेख (राजनीति, व्यापार आदि)
- ब्लॉग पोस्ट, प्रलेखन या अन्य प्रकाशित सामग्री (सार्वजनिक या निजी)।
- सोशल मीडिया पोस्ट
- किसी भी प्रकार के परिवर्तन लॉग
- संदेश

ऐसी वस्तुएं अक्सर समानता और समय दोनों के आधार पर खोजी जाती हैं। उदाहरण के लिए: मुझे 2022 से टोयोटा ट्रकों के बारे में सभी समाचार दिखाएं।

[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) समय-सीमा के भीतर एम्बेडिंग को खोजने में उत्कृष्ट प्रदर्शन प्रदान करता है, क्योंकि यह विशिष्ट समय-सीमाओं के लिए डेटा को अलग करने के लिए स्वचालित तालिका पार्टिशनिंग का उपयोग करता है।

Langchain का स्वयं-प्रश्न पुनर्प्राप्तकर्ता उपयोगकर्ता के प्रश्नों के पाठ्य से समय-सीमाओं (और अन्य खोज मानदंडों) को निकालने की अनुमति देता है।

## Timescale Vector क्या है?

**[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) AI अनुप्रयोगों के लिए PostgreSQL++।**

Timescale Vector आपको `PostgreSQL` में अरबों वेक्टर एम्बेडिंग को कुशलतापूर्वक संग्रहित और क्वेरी करने में सक्षम बनाता है।
- `pgvector` को DiskANN प्रेरित इंडेक्सिंग एल्गोरिदम के माध्यम से 1B+ वेक्टरों पर तेज और अधिक सटीक समानता खोज के साथ बढ़ाता है।
- स्वचालित समय-आधारित पार्टिशनिंग और इंडेक्सिंग के माध्यम से तेज समय-आधारित वेक्टर खोज सक्षम करता है।
- वेक्टर एम्बेडिंग और संबंधित डेटा को क्वेरी करने के लिए परिचित SQL इंटरफ़ेस प्रदान करता है।

Timescale Vector POC से उत्पादन तक आपके साथ पैमाने में बढ़ने वाला क्लाउड PostgreSQL है:
- संबंधित मेटाडेटा, वेक्टर एम्बेडिंग और समय-श्रृंखला डेटा को एक ही डेटाबेस में संग्रहित करने से परिचालन को सरल बनाता है।
- उद्यम-स्तरीय सुविधाओं जैसे स्ट्रीमिंग बैकअप और प्रतिलिपि, उच्च उपलब्धता और पंक्ति-स्तरीय सुरक्षा के साथ PostgreSQL के मजबूत आधार का लाभ उठाता है।
- उद्यम-स्तरीय सुरक्षा और अनुपालन के साथ चिंता मुक्त अनुभव प्रदान करता है।

### Timescale Vector कैसे एक्सेस करें

Timescale Vector [Timescale](https://www.timescale.com/products?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) पर उपलब्ध है, जो क्लाउड PostgreSQL प्लेटफ़ॉर्म है। (इस समय कोई स्वयं-होस्ट संस्करण नहीं है।)

- LangChain उपयोगकर्ता Timescale Vector के लिए 90 दिनों का मुफ्त ट्रायल प्राप्त करते हैं।
- शुरू करने के लिए, [साइन अप](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) करें Timescale, एक नया डेटाबेस बनाएं और इस नोटबुक का पालन करें!
- अधिक जानकारी के लिए [स्थापना निर्देश](https://github.com/timescale/python-vector) देखें।

## वातावरण सेटअप

यह टेम्पलेट Timescale Vector को एक वेक्टर स्टोर के रूप में उपयोग करता है और `TIMESCALES_SERVICE_URL` की आवश्यकता होती है। यदि आपके पास अभी तक खाता नहीं है, तो [यहां](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) 90 दिनों का ट्रायल साइन अप करें।

नमूना डेटासेट लोड करने के लिए, `LOAD_SAMPLE_DATA=1` सेट करें। अपना खुद का डेटासेट लोड करने के लिए नीचे दिए गए खंड देखें।

OpenAI मॉडल तक पहुंचने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-timescale-hybrid-search-time
```

और यदि आप किसी मौजूदा प्रोजेक्ट में इसे जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-timescale-hybrid-search-time
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_timescale_hybrid_search.chain import chain as rag_timescale_hybrid_search_chain

add_routes(app, rag_timescale_hybrid_search_chain, path="/rag-timescale-hybrid-search")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-timescale-hybrid-search/playground](http://127.0.0.1:8000/rag-timescale-hybrid-search/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-hybrid-search")
```

## अपना खुद का डेटासेट लोड करना

अपना खुद का डेटासेट लोड करने के लिए, आपको `chain.py` के `DATASET SPECIFIC CODE` खंड में कोड को संशोधित करना होगा।
यह कोड संग्रह का नाम, डेटा कैसे लोड किया जाए, और संग्रह की सामग्री और सभी मेटाडेटा का मानव-भाषा वर्णन परिभाषित करता है। मानव-भाषा वर्णन स्वयं-प्रश्न पुनर्प्राप्तकर्ता द्वारा Timescale-vector में डेटा खोजते समय मेटाडेटा पर फ़िल्टर बनाने के लिए LLM को प्रश्न को रूपांतरित करने में मदद करते हैं।
