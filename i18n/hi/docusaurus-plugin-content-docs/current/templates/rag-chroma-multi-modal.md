---
translated: true
---

# राग-क्रोमा-मल्टी-मोडल

मल्टी-मोडल LLMs विज़ुअल असिस्टेंट्स को सक्षम बनाते हैं जो छवियों के बारे में प्रश्न-उत्तर कर सकते हैं।

यह टेम्पलेट स्लाइड डेक्स के लिए एक विज़ुअल असिस्टेंट बनाता है, जिसमें अक्सर ग्राफ़ या आकृतियों जैसी दृश्य सामग्री होती है।

यह स्लाइड छवियों को एम्बेड करने के लिए OpenCLIP एम्बेडिंग्स का उपयोग करता है और उन्हें क्रोमा में संग्रहीत करता है।

एक प्रश्न देने पर, प्रासंगिक स्लाइड्स को पुनः प्राप्त किया जाता है और उत्तर संश्लेषण के लिए GPT-4V को भेजा जाता है।

## इनपुट

`/docs` निर्देशिका में एक पीडीएफ के रूप में एक स्लाइड डेक प्रदान करें।

डिफ़ॉल्ट रूप से, इस टेम्पलेट में DataDog, एक सार्वजनिक प्रौद्योगिकी कंपनी के Q3 आय के बारे में एक स्लाइड डेक है।

उदाहरण प्रश्न जो पूछे जा सकते हैं:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

स्लाइड डेक का इंडेक्स बनाने के लिए, चलाएं:

```shell
poetry install
python ingest.py
```

## स्टोरेज

यह टेम्पलेट छवियों को एम्बेड करने के लिए [OpenCLIP](https://github.com/mlfoundations/open_clip) मल्टी-मोडल एम्बेडिंग्स का उपयोग करेगा।

आप विभिन्न एम्बेडिंग मॉडल विकल्प चुन सकते हैं (परिणाम [यहां देखें](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))।

पहली बार जब आप ऐप चलाते हैं, तो यह स्वचालित रूप से मल्टीमॉडल एम्बेडिंग मॉडल डाउनलोड करेगा।

डिफ़ॉल्ट रूप से, LangChain एक एम्बेडिंग मॉडल का उपयोग करेगा जिसमें मध्यम प्रदर्शन लेकिन कम मेमोरी आवश्यकताएँ होती हैं, `ViT-H-14`।

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

## LLM

ऐप टेक्स्ट इनपुट और छवि के बीच समानता के आधार पर छवियों को पुनः प्राप्त करेगा, जो दोनों मल्टी-मोडल एम्बेडिंग स्पेस में मैप होते हैं। फिर यह छवियों को GPT-4V को भेजेगा।

## एनवायरनमेंट सेटअप

OpenAI GPT-4V तक पहुंचने के लिए `OPENAI_API_KEY` एनवायरनमेंट वेरिएबल सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI इंस्टॉल करना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस चला सकते हैं:

```shell
langchain app add rag-chroma-multi-modal
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
```

(वैकल्पिक) आइए अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain एप्लिकेशन का पता लगाने, मॉनिटर करने और डिबग करने में मदद करेगा।
आप LangSmith के लिए [यहां साइन अप करें](https://smith.langchain.com/)।
यदि आपके पास पहुंच नहीं है, तो आप इस अनुभाग को छोड़ सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह एक लोकल सर्वर के साथ FastAPI ऐप शुरू करेगा जो लोकल पर चल रहा है
[http://localhost:8000](http://localhost:8000)

हम सभी टेम्पलेट्स को यहां देख सकते हैं [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
हम प्लेग्राउंड को यहां एक्सेस कर सकते हैं [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)

हम कोड से टेम्पलेट को एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
