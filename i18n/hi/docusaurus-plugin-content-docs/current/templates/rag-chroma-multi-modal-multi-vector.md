---
translated: true
---

# rag-chroma-बहु-मोडल-बहु-वेक्टर

बहु-मोडल एलएलएम छवियों के बारे में प्रश्न-उत्तर करने में सक्षम दृश्य सहायकों को सक्षम बनाते हैं।

यह टेम्पलेट स्लाइड डेक के लिए एक दृश्य सहायक बनाता है, जिसमें अक्सर ग्राफ या आकृतियां जैसे दृश्य होते हैं।

यह GPT-4V का उपयोग करके प्रत्येक स्लाइड के लिए छवि सारांश बनाता है, सारांश को एम्बेड करता है और उन्हें क्रोमा में संग्रहीत करता है।

किसी प्रश्न के दिए जाने पर, प्रासंगिक स्लाइडों को पुनः प्राप्त किया जाता है और उन्हें GPT-4V को उत्तर संश्लेषण के लिए पास किया जाता है।

## इनपुट

/docs डायरेक्टरी में पीडीएफ के रूप में स्लाइड डेक प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में डेटाडॉग, एक सार्वजनिक प्रौद्योगिकी कंपनी के Q3 आय के बारे में एक स्लाइड डेक है।

पूछे जा सकने वाले उदाहरण प्रश्न हैं:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

स्लाइड डेक का सूचकांक बनाने के लिए, निम्नलिखित चलाएं:

```shell
poetry install
python ingest.py
```

## स्टोरेज

यहां वह प्रक्रिया है जिसका उपयोग टेम्पलेट स्लाइड डेक का सूचकांक बनाने के लिए करेगा (देखें [ब्लॉग](https://blog.langchain.dev/multi-modal-rag-template/))):

* स्लाइडों को छवियों के संग्रह के रूप में निकालें
* प्रत्येक छवि का सारांश बनाने के लिए GPT-4V का उपयोग करें
* मूल छवियों के लिंक के साथ पाठ एम्बेडिंग का उपयोग करके छवि सारांश को एम्बेड करें
* उपयोगकर्ता इनपुट प्रश्न और छवि सारांश के बीच समानता के आधार पर प्रासंगिक छवि को पुनः प्राप्त करें
* उन छवियों को GPT-4V को उत्तर संश्लेषण के लिए पास करें

डिफ़ॉल्ट रूप से, यह छवियों को संग्रहीत करने के लिए [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) और सारांशों को संग्रहीत करने के लिए क्रोमा का उपयोग करेगा।

उत्पादन के लिए, Redis जैसे दूरस्थ विकल्प का उपयोग करना वांछनीय हो सकता है।

आप `chain.py` और `ingest.py` में `local_file_store` फ्लैग को बदलकर दोनों विकल्पों के बीच स्विच कर सकते हैं।

Redis के लिए, टेम्पलेट [UpstashRedisByteStore](https://python.langchain.com/docs/integrations/stores/upstash_redis) का उपयोग करेगा।

हम छवियों को संग्रहीत करने के लिए Upstash का उपयोग करेंगे, जो REST API के साथ Redis प्रदान करता है।

यहां [लॉगिन](https://upstash.com/) करके एक डेटाबेस बनाएं।

इससे आपको निम्नलिखित के साथ एक REST API मिलेगा:

* `UPSTASH_URL`
* `UPSTASH_TOKEN`

अपने डेटाबेस तक पहुंचने के लिए `UPSTASH_URL` और `UPSTASH_TOKEN` को वातावरण चर के रूप में सेट करें।

हम छवि सारांशों को संग्रहीत और अनुक्रमित करने के लिए क्रोमा का उपयोग करेंगे, जो टेम्पलेट निर्देशिका में स्थानीय रूप से बनाया जाएगा।

## एलएलएम

ऐप्लिकेशन पाठ इनपुट और छवि सारांश के बीच समानता के आधार पर छवियों को पुनः प्राप्त करेगी और उन्हें GPT-4V को पास करेगी।

## वातावरण सेटअप

OpenAI GPT-4V तक पहुंचने के लिए `OPENAI_API_KEY` वातावरण चर सेट करें।

यदि आप `UpstashRedisByteStore` का उपयोग करते हैं, तो अपने डेटाबेस तक पहुंचने के लिए `UPSTASH_URL` और `UPSTASH_TOKEN` को वातावरण चर के रूप में सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package rag-chroma-multi-modal-multi-vector
```

यदि आप किसी मौजूदा प्रोजेक्ट में इसे जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-chroma-multi-modal-multi-vector
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_chroma_multi_modal_multi_vector import chain as rag_chroma_multi_modal_chain_mv

add_routes(app, rag_chroma_multi_modal_chain_mv, path="/rag-chroma-multi-modal-multi-vector")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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

यह [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहे सर्वर के साथ FastAPI ऐप शुरू करेगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal-multi-vector")
```
