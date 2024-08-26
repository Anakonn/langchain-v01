---
translated: true
---

# rag-gemini-बहु-मोडल

बहु-मोडल एलएलएम दृश्य सहायकों को सक्षम बनाते हैं जो छवियों के बारे में प्रश्न-उत्तर कर सकते हैं।

यह टेम्पलेट स्लाइड डेक के लिए एक दृश्य सहायक बनाता है, जिसमें अक्सर ग्राफ या आकृतियों जैसे दृश्य होते हैं।

यह OpenCLIP एम्बेडिंग का उपयोग करता है ताकि सभी स्लाइड छवियों को एम्बेड किया जा सके और उन्हें क्रोमा में संग्रहीत किया जा सके।

एक प्रश्न दिए जाने पर, प्रासंगिक स्लाइडों को पुनः प्राप्त किया जाता है और उन्हें [Google Gemini](https://deepmind.google/technologies/gemini/#introduction) के लिए उत्तर संश्लेषण के लिए पास किया जाता है।

## इनपुट

/docs डायरेक्टरी में पीडीएफ के रूप में स्लाइड डेक प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में DataDog, एक सार्वजनिक प्रौद्योगिकी कंपनी, के Q3 आय के बारे में एक स्लाइड डेक है।

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

यह टेम्पलेट [OpenCLIP](https://github.com/mlfoundations/open_clip) बहु-मोडल एम्बेडिंग का उपयोग करेगा ताकि छवियों को एम्बेड किया जा सके।

आप विभिन्न एम्बेडिंग मॉडल विकल्पों का चयन कर सकते हैं (परिणाम [यहां](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv)) देखें)।

जब आप पहली बार ऐप चलाते हैं, तो यह स्वचालित रूप से बहु-मोडल एम्बेडिंग मॉडल डाउनलोड करेगा।

डिफ़ॉल्ट रूप से, LangChain `ViT-H-14` जैसे मॉडरेट प्रदर्शन लेकिन कम मेमोरी आवश्यकताओं वाले एम्बेडिंग मॉडल का उपयोग करेगा।

आप `rag_chroma_multi_modal/ingest.py` में वैकल्पिक `OpenCLIPEmbeddings` मॉडल का चयन कर सकते हैं:

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

ऐप बहु-मोडल एम्बेडिंग का उपयोग करके छवियों को पुनः प्राप्त करेगा और उन्हें Google Gemini को पास करेगा।

## पर्यावरण सेटअप

Gemini तक पहुंचने के लिए अपना `GOOGLE_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-gemini-multi-modal
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल निम्नलिखित चला सकते हैं:

```shell
langchain app add rag-gemini-multi-modal
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_gemini_multi_modal import chain as rag_gemini_multi_modal_chain

add_routes(app, rag_gemini_multi_modal_chain, path="/rag-gemini-multi-modal")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-gemini-multi-modal/playground](http://127.0.0.1:8000/rag-gemini-multi-modal/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gemini-multi-modal")
```
