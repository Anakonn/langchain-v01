---
translated: true
---

# rag-momento-vector-index

यह टेम्पलेट RAG का उपयोग करता है Momento Vector Index (MVI) और OpenAI का उपयोग करके।

> MVI: आपके डेटा के लिए सबसे उत्पादक, सबसे आसान उपयोग करने योग्य, सर्वरलेस वेक्टर इंडेक्स। MVI के साथ शुरू करने के लिए, बस एक खाता साइन अप करें। सर्वर्स को संभालने, स्केलिंग के बारे में चिंता करने की आवश्यकता नहीं है। MVI एक सेवा है जो आपकी जरूरतों को पूरा करने के लिए स्वचालित रूप से स्केल होता है। Momento Cache जैसी अन्य Momento सेवाओं के साथ संयोजित करें ताकि प्रोम्प्ट्स को कैश किया जा सके और सत्र स्टोर के रूप में या Momento Topics को एक pub/sub सिस्टम के रूप में उपयोग किया जा सके जो आपके एप्लिकेशन को इवेंट्स प्रसारित करें।

MVI के साथ साइन अप करने और उपयोग करने के लिए, [Momento Console](https://console.gomomento.com/) पर जाएं।

## Environment Setup

यह टेम्पलेट Momento Vector Index को एक वेक्टर स्टोर के रूप में उपयोग करता है और यह आवश्यक है कि `MOMENTO_API_KEY` और `MOMENTO_INDEX_NAME` सेट किए जाएं।

API कुंजी प्राप्त करने के लिए [कंसोल](https://console.gomomento.com/) पर जाएं।

OpenAI मॉडल्स तक पहुंचने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-momento-vector-index
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-momento-vector-index
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_momento_vector_index import chain as rag_momento_vector_index_chain

add_routes(app, rag_momento_vector_index_chain, path="/rag-momento-vector-index")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-momento-vector-index/playground](http://127.0.0.1:8000/rag-momento-vector-index/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-momento-vector-index")
```

## डेटा इंडेक्सिंग

हमने डेटा इंडेक्स करने के लिए एक नमूना मॉड्यूल शामिल किया है। वह `rag_momento_vector_index/ingest.py` पर उपलब्ध है। आप `chain.py` में एक टिप्पणी वाली लाइन देखेंगे जो इसे कॉल करता है। उपयोग करने के लिए इसे अनकमेंट करें।
