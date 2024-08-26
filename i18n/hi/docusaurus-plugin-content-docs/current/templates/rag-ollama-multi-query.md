---
translated: true
---

# rag-ollama-multi-query

यह टेम्पलेट Ollama और OpenAI का उपयोग करके RAG (Retrieval Augmented Generation) करता है, जिसमें एक बहु-प्रश्न पुनर्प्राप्ति करने वाला उपकरण है।

बहु-प्रश्न पुनर्प्राप्ति करने वाला उपकरण प्रश्न रूपांतरण का एक उदाहरण है, जो उपयोगकर्ता के इनपुट प्रश्न के आधार पर विभिन्न दृष्टिकोणों से कई प्रश्न उत्पन्न करता है।

प्रत्येक प्रश्न के लिए, यह प्रासंगिक दस्तावेजों का एक सेट पुनर्प्राप्त करता है और उत्तर संश्लेषण के लिए सभी प्रश्नों के अद्वितीय संयोजन को लेता है।

हम एक निजी, स्थानीय LLM का उपयोग प्रश्न उत्पादन के संकीर्ण कार्य के लिए करते हैं, ताकि एक बड़े LLM API पर अत्यधिक कॉल से बचा जा सके।

Ollama LLM द्वारा प्रश्न विस्तार करने के लिए एक उदाहरण ट्रेस [यहाँ](https://smith.langchain.com/public/8017d04d-2045-4089-b47f-f2d66393a999/r) देखें।

लेकिन हम उत्तर संश्लेषण (पूर्ण ट्रेस उदाहरण [यहाँ](https://smith.langchain.com/public/ec75793b-645b-498d-b855-e8d85e1f6738/r))) के अधिक चुनौतीपूर्ण कार्य के लिए OpenAI का उपयोग करते हैं।

## वातावरण सेटअप

वातावरण सेट करने के लिए, आपको Ollama डाउनलोड करना होगा।

[यहाँ](https://python.langchain.com/docs/integrations/chat/ollama) दिए गए निर्देशों का पालन करें।

आप Ollama के साथ इच्छित LLM का चयन कर सकते हैं।

यह टेम्पलेट `zephyr` का उपयोग करता है, जिसे `ollama pull zephyr` का उपयोग करके एक्सेस किया जा सकता है।

[यहाँ](https://ollama.ai/library) कई अन्य विकल्प उपलब्ध हैं।

OpenAI मॉडल तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI स्थापित करना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इस पैकेज को स्थापित करने के लिए, करें:

```shell
langchain app new my-app --package rag-ollama-multi-query
```

किसी मौजूदा प्रोजेक्ट में इस पैकेज को जोड़ने के लिए, चलाएं:

```shell
langchain app add rag-ollama-multi-query
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_ollama_multi_query import chain as rag_ollama_multi_query_chain

add_routes(app, rag_ollama_multi_query_chain, path="/rag-ollama-multi-query")
```

(वैकल्पिक) अब, आइए LangSmith कॉन्फ़िगर करें। LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा। आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं। यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चलने वाले सर्वर के साथ शुरू करेगा।

आप सभी टेम्पलेट [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
आप [http://127.0.0.1:8000/rag-ollama-multi-query/playground](http://127.0.0.1:8000/rag-ollama-multi-query/playground) पर खेल सकते हैं।

कोड से टेम्पलेट तक पहुंचने के लिए, उपयोग करें:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-ollama-multi-query")
```
