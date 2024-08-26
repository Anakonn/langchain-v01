---
translated: true
---

यह टेम्पलेट RAG का उपयोग करता है जिसमें Pinecone और OpenAI के साथ-साथ [Cohere द्वारा पुनः रैंकिंग](https://txt.cohere.com/rerank/) भी शामिल है।

पुनः रैंकिंग प्राप्त किए गए दस्तावेजों को निर्दिष्ट फ़िल्टर या मानदंडों का उपयोग करके रैंक करने का एक तरीका प्रदान करता है।

## वातावरण सेटअप

यह टेम्पलेट Pinecone को एक वेक्टर स्टोर के रूप में उपयोग करता है और यह आवश्यक है कि `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` और `PINECONE_INDEX` सेट किए जाएं।

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

Cohere ReRank तक पहुंच प्राप्त करने के लिए `COHERE_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-pinecone-rerank
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-pinecone-rerank
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_pinecone_rerank import chain as rag_pinecone_rerank_chain

add_routes(app, rag_pinecone_rerank_chain, path="/rag-pinecone-rerank")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप यहां [साइन अप कर सकते हैं](https://smith.langchain.com/)।
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
हम [http://127.0.0.1:8000/rag-pinecone-rerank/playground](http://127.0.0.1:8000/rag-pinecone-rerank/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-rerank")
```
