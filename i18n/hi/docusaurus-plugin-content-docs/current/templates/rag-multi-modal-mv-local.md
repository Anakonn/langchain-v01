---
translated: true
---

यह एक बहुमाध्यम एलएलएम का उपयोग करके निजी दृश्य खोज और प्रश्न-उत्तर करने का एक टेम्पलेट है।

# rag-multi-modal-mv-local

दृश्य खोज एक परिचित अनुप्रयोग है जिसका उपयोग कई लोग iPhone या Android डिवाइस के साथ करते हैं। यह उपयोगकर्ताओं को प्राकृतिक भाषा का उपयोग करके फोटो खोजने की अनुमति देता है।

ओपन सोर्स, बहुमाध्यम एलएलएम के रिलीज के साथ, आप अपने निजी फोटो संग्रह के लिए इस तरह के अनुप्रयोग बना सकते हैं।

यह टेम्पलेट दिखाता है कि आप अपने फोटो संग्रह पर निजी दृश्य खोज और प्रश्न-उत्तर कैसे कर सकते हैं।

यह आपके चयनित बहुमाध्यम एलएलएम का उपयोग करता है ताकि प्रत्येक फोटो के लिए छवि सारांश बनाया जा सके, उन्हें एम्बेड किया जा सके और उन्हें क्रोमा में संग्रहीत किया जा सके।

किसी प्रश्न के दिए जाने पर, प्रासंगिक फोटो पुनः प्राप्त किए जाते हैं और बहुमाध्यम एलएलएम को उत्तर संश्लेषण के लिए पास किए जाते हैं।

## इनपुट

/docs निर्देशिका में एक सेट फोटो प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में 3 खाद्य चित्र हैं।

एप्लिकेशन प्रदान किए गए कीवर्ड या प्रश्नों के आधार पर फोटो को खोजेगा और सारांशित करेगा:

```text
What kind of ice cream did I have?
```

व्यावहारिक रूप से, छवियों का एक बड़ा संग्रह परीक्षण किया जा सकता है।

छवियों का एक सूचकांक बनाने के लिए, निम्नलिखित चलाएं:

```shell
poetry install
python ingest.py
```

## स्टोरेज

यहां वह प्रक्रिया है जिसका उपयोग टेम्पलेट स्लाइड का एक सूचकांक बनाने के लिए करेगा (देखें [ब्लॉग](https://blog.langchain.dev/multi-modal-rag-template/))):

* एक सेट छवियों के साथ दिया गया
* यह एक स्थानीय बहुमाध्यम एलएलएम ([bakllava](https://ollama.ai/library/bakllava))) का उपयोग करता है प्रत्येक छवि का सारांश बनाने के लिए
* मूल छवियों के लिंक के साथ छवि सारांशों को एम्बेड करता है
* उपयोगकर्ता के प्रश्न के आधार पर, यह छवि सारांश और उपयोगकर्ता इनपुट के बीच समानता के आधार पर प्रासंगिक छवि(यों) को पुनः प्राप्त करेगा (Ollama एम्बेडिंग का उपयोग करके)
* वह छवियों को bakllava के लिए उत्तर संश्लेषण के लिए पास करेगा

डिफ़ॉल्ट रूप से, यह [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) का उपयोग करेगा छवियों को संग्रहीत करने और Chroma का उपयोग सारांशों को संग्रहीत करने के लिए।

## एलएलएम और एम्बेडिंग मॉडल

हम छवि सारांश, एम्बेडिंग और अंतिम छवि प्रश्न-उत्तर के लिए [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal) का उपयोग करेंगे।

Ollama का नवीनतम संस्करण डाउनलोड करें: https://ollama.ai/

एक ओपन सोर्स बहुमाध्यम एलएलएम प्राप्त करें: उदाहरण के लिए, https://ollama.ai/library/bakllava

एक ओपन सोर्स एम्बेडिंग मॉडल प्राप्त करें: उदाहरण के लिए, https://ollama.ai/library/llama2:7b

```shell
ollama pull bakllava
ollama pull llama2:7b
```

एप्लिकेशन डिफ़ॉल्ट रूप से `bakllava` के लिए कॉन्फ़िगर किया गया है। लेकिन आप इसे `chain.py` और `ingest.py` में विभिन्न डाउनलोड किए गए मॉडलों के लिए बदल सकते हैं।

एप्लिकेशन पाठ इनपुट और छवि सारांश के बीच समानता के आधार पर छवियों को पुनः प्राप्त करेगा, और उन छवियों को `bakllava` को पास करेगा।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package rag-multi-modal-mv-local
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-multi-modal-mv-local
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_multi_modal_mv_local import chain as rag_multi_modal_mv_local_chain

add_routes(app, rag_multi_modal_mv_local_chain, path="/rag-multi-modal-mv-local")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [साइन अप](https://smith.langchain.com/) कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI एप्लिकेशन को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-multi-modal-mv-local/playground](http://127.0.0.1:8000/rag-multi-modal-mv-local/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-modal-mv-local")
```
