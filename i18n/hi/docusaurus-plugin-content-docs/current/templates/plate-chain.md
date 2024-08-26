---
translated: true
---

# प्लेट-श्रृंखला

यह टेम्प्लेट प्रयोगशाला प्लेटों से डेटा को पार्स करने में सक्षम बनाता है।

जैव रसायन विज्ञान या आणविक जीवविज्ञान के संदर्भ में, प्रयोगशाला प्लेट आमतौर पर नमूनों को ग्रिड-जैसे प्रारूप में रखने के लिए सामान्य रूप से उपयोग किए जाने वाले उपकरण हैं।

यह परिणामी डेटा को आगे प्रसंस्करण के लिए मानकीकृत (उदा., JSON) प्रारूप में पार्स कर सकता है।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

प्लेट-श्रृंखला का उपयोग करने के लिए, आपके पास LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और प्लेट-श्रृंखला को एकमात्र पैकेज के रूप में स्थापित करने के लिए निम्नलिखित कमांड का उपयोग किया जा सकता है:

```shell
langchain app new my-app --package plate-chain
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो बस निम्नलिखित कमांड चलाएं:

```shell
langchain app add plate-chain
```

फिर अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from plate_chain import chain as plate_chain

add_routes(app, plate_chain, path="/plate-chain")
```

(वैकल्पिक) LangSmith कॉन्फ़िगर करने के लिए, जो LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करता है, निम्नलिखित कोड का उपयोग करें:

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर एक सर्वर चलाते हुए FastAPI ऐप शुरू करता है।

सभी टेम्प्लेट [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देखे जा सकते हैं
[http://127.0.0.1:8000/plate-chain/playground](http://127.0.0.1:8000/plate-chain/playground) पर प्लेबुक तक पहुंचें

आप कोड से टेम्प्लेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/plate-chain")
```
