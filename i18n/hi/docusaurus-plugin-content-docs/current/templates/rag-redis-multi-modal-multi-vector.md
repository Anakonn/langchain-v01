---
translated: true
---

# rag-redis-बहु-मोडल-बहु-वेक्टर

बहु-मोडल एलएलएम छवियों के बारे में प्रश्न-उत्तर करने में सक्षम दृश्य सहायकों को सक्षम बनाते हैं।

यह टेम्पलेट स्लाइड डेक के लिए एक दृश्य सहायक बनाता है, जिसमें अक्सर ग्राफ या आकृतियां जैसे दृश्य होते हैं।

यह GPT-4V का उपयोग करता है ताकि प्रत्येक स्लाइड के लिए छवि सारांश बनाया जा सके, उन्हें एम्बेड किया जा सके और उन्हें Redis में संग्रहीत किया जा सके।

एक प्रश्न दिए जाने पर, प्रासंगिक स्लाइडों को पुनः प्राप्त किया जाता है और उन्हें उत्तर संश्लेषण के लिए GPT-4V को पास किया जाता है।

## इनपुट

PDF में स्लाइड डेक को `/docs` निर्देशिका में प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में NVIDIA के हाल के कमाई के बारे में एक स्लाइड डेक है।

पूछने के लिए उदाहरण प्रश्न हो सकते हैं:

```text
1/ how much can H100 TensorRT improve LLama2 inference performance?
2/ what is the % change in GPU accelerated applications from 2020 to 2023?
```

स्लाइड डेक का सूचकांक बनाने के लिए, निम्नलिखित चलाएं:

```shell
poetry install
poetry shell
python ingest.py
```

## स्टोरेज

यहां टेम्पलेट द्वारा स्लाइडों का सूचकांक बनाने की प्रक्रिया है (देखें [ब्लॉग](https://blog.langchain.dev/multi-modal-rag-template/))):

* छवियों के संग्रह के रूप में स्लाइडों को निकालें
* प्रत्येक छवि का सारांश बनाने के लिए GPT-4V का उपयोग करें
* मूल छवियों के लिंक के साथ पाठ एम्बेडिंग का उपयोग करके छवि सारांश को एम्बेड करें
* उपयोगकर्ता इनपुट प्रश्न और छवि सारांश के बीच समानता के आधार पर प्रासंगिक छवियों को पुनः प्राप्त करें
* उन छवियों को उत्तर संश्लेषण के लिए GPT-4V को पास करें

### Redis

यह टेम्पलेट [MultiVectorRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/multi_vector) को संचालित करने के लिए [Redis](https://redis.com) का उपयोग करता है, जिसमें शामिल हैं:
- छवि सारांश एम्बेडिंग को संग्रहीत और अनुक्रमित करने के लिए Redis के रूप में [VectorStore](https://python.langchain.com/docs/integrations/vectorstores/redis)
- छवियों को संग्रहीत करने के लिए Redis के रूप में [ByteStore](https://python.langchain.com/docs/integrations/stores/redis)

[क्लाउड](https://redis.com/try-free) (मुफ्त) या [docker](https://redis.io/docs/install/install-stack/docker/) के साथ स्थानीय रूप से एक Redis इंस्टांस तैनात करना सुनिश्चित करें।

यह आपको एक पहुंच योग्य Redis एंडपॉइंट देगा जिसका URL के रूप में उपयोग किया जा सकता है। स्थानीय रूप से तैनात करने पर, केवल `redis://localhost:6379` का उपयोग करें।

## एलएलएम

ऐप्लिकेशन पाठ इनपुट और छवि सारांश (पाठ) के बीच समानता के आधार पर छवियों को पुनः प्राप्त करेगा और उन छवियों को उत्तर संश्लेषण के लिए GPT-4V को पास करेगा।

## वातावरण सेटअप

OpenAI GPT-4V का उपयोग करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

अपने Redis डेटाबेस तक पहुंचने के लिए `REDIS_URL` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package rag-redis-multi-modal-multi-vector
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-redis-multi-modal-multi-vector
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_redis_multi_modal_multi_vector import chain as rag_redis_multi_modal_chain_mv

add_routes(app, rag_redis_multi_modal_chain_mv, path="/rag-redis-multi-modal-multi-vector")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इसी निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis-multi-modal-multi-vector")
```
