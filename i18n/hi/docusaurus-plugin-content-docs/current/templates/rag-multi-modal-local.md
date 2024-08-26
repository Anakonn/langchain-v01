---
translated: true
---

# rag-multi-modal-local

दृश्य खोज एक परिचित अनुप्रयोग है जिसे कई लोग iPhone या Android डिवाइस के साथ जानते हैं। यह उपयोगकर्ताओं को प्राकृतिक भाषा का उपयोग करके फोटो खोजने की अनुमति देता है।

ओपन सोर्स, मल्टी-मोडल एलएलएम के रिलीज के साथ, आप अपने निजी फोटो संग्रह के लिए इस तरह के अनुप्रयोग को खुद बना सकते हैं।

यह टेम्पलेट दिखाता है कि आप अपने फोटो संग्रह पर निजी दृश्य खोज और प्रश्न-उत्तर कैसे कर सकते हैं।

यह OpenCLIP एम्बेडिंग का उपयोग करता है ताकि सभी फोटो को एम्बेड किया जा सके और उन्हें क्रोमा में संग्रहीत किया जा सके।

एक प्रश्न दिए जाने पर, प्रासंगिक फोटो पुनः प्राप्त किए जाते हैं और उन्हें उत्तर संश्लेषण के लिए किसी भी ओपन सोर्स मल्टी-मोडल एलएलएम को पास किया जाता है।

## इनपुट

/docs निर्देशिका में एक सेट फोटो प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में 3 खाद्य चित्रों का एक खिलौना संग्रह है।

पूछे जा सकने वाले उदाहरण प्रश्न हैं:

```text
What kind of soft serve did I have?
```

व्यावहारिक रूप से, छवियों का एक बड़ा कॉर्पस परीक्षण किया जा सकता है।

छवियों का एक सूचकांक बनाने के लिए, चलाएं:

```shell
poetry install
python ingest.py
```

## भंडारण

यह टेम्पलेट [OpenCLIP](https://github.com/mlfoundations/open_clip) मल्टी-मोडल एम्बेडिंग का उपयोग करेगा ताकि छवियों को एम्बेड किया जा सके।

आप विभिन्न एम्बेडिंग मॉडल विकल्प चुन सकते हैं (परिणाम [यहां](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv)) देखें)।

जब आप पहली बार ऐप चलाते हैं, तो यह स्वचालित रूप से मल्टी-मोडल एम्बेडिंग मॉडल डाउनलोड करेगा।

डिफ़ॉल्ट रूप से, LangChain `ViT-H-14` नामक एक मॉडरेट प्रदर्शन वाले लेकिन कम मेमोरी आवश्यकता वाले एम्बेडिंग मॉडल का उपयोग करेगा।

आप `rag_chroma_multi_modal/ingest.py` में वैकल्पिक `OpenCLIPEmbeddings` मॉडल चुन सकते हैं:

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## एलएलएम

यह टेम्पलेट [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal) का उपयोग करेगा।

Ollama का नवीनतम संस्करण डाउनलोड करें: https://ollama.ai/

एक ओपन सोर्स मल्टी-मोडल एलएलएम पुल करें: उदाहरण के लिए, https://ollama.ai/library/bakllava

```shell
ollama pull bakllava
```

ऐप डिफ़ॉल्ट रूप से `bakllava` के लिए कॉन्फ़िगर किया गया है। लेकिन आप `chain.py` और `ingest.py` में इसे अलग-अलग डाउनलोड किए गए मॉडलों के लिए बदल सकते हैं।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल चला सकते हैं:

```shell
langchain app add rag-chroma-multi-modal
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
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

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
