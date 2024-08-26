---
translated: true
---

# rag-azure-search

यह टेम्पलेट [Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) को वेक्टर स्टोर के रूप में और Azure OpenAI चैट और एम्बेडिंग मॉडल का उपयोग करके दस्तावेजों पर RAG (Retrieval Augmented Generation) करता है।

Azure AI Search के साथ RAG के बारे में अधिक जानकारी के लिए, [इस नोटबुक](https://github.com/langchain-ai/langchain/blob/master/docs/docs/integrations/vectorstores/azuresearch.ipynb) का संदर्भ लें।

## वातावरण सेटअप

***पूर्वापेक्षाएं:*** मौजूदा [Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) और [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview) संसाधन।

***पर्यावरण चर:***

इस टेम्पलेट को चलाने के लिए, आपको निम्नलिखित पर्यावरण चर सेट करने की आवश्यकता होगी:

***आवश्यक:***

- AZURE_SEARCH_ENDPOINT - Azure AI Search सेवा का एंडपॉइंट।
- AZURE_SEARCH_KEY - Azure AI Search सेवा के लिए API कुंजी।
- AZURE_OPENAI_ENDPOINT - Azure OpenAI सेवा का एंडपॉइंट।
- AZURE_OPENAI_API_KEY - Azure OpenAI सेवा के लिए API कुंजी।
- AZURE_EMBEDDINGS_DEPLOYMENT - एम्बेडिंग के लिए उपयोग करने के लिए Azure OpenAI तैनाती का नाम।
- AZURE_CHAT_DEPLOYMENT - चैट के लिए उपयोग करने के लिए Azure OpenAI तैनाती का नाम।

***वैकल्पिक:***

- AZURE_SEARCH_INDEX_NAME - उपयोग करने के लिए मौजूदा Azure AI Search सूचकांक का नाम। यदि प्रदान नहीं किया गया है, तो "rag-azure-search" नाम के साथ एक सूचकांक बनाया जाएगा।
- OPENAI_API_VERSION - उपयोग करने के लिए Azure OpenAI API संस्करण। डिफ़ॉल्ट "2023-05-15" है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-azure-search
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-azure-search
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_azure_search import chain as rag_azure_search_chain

add_routes(app, rag_azure_search_chain, path="/rag-azure-search")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
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

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-azure-search/playground](http://127.0.0.1:8000/rag-azure-search/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-azure-search")
```
