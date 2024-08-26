---
translated: true
---

# rag-google-cloud-vertexai-search

यह टेम्पलेट एक एप्लिकेशन है जो Google Vertex AI Search, एक मशीन लर्निंग पावर्ड सर्च सेवा, और PaLM 2 फॉर चैट (chat-bison) का उपयोग करता है। यह एप्लिकेशन आपके दस्तावेज़ों के आधार पर प्रश्नों का उत्तर देने के लिए एक Retrieval चेन का उपयोग करता है।

Vertex AI Search के साथ RAG एप्लिकेशन बनाने पर अधिक जानकारी के लिए,
[यहां देखें](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction)।

## Environment Setup

इस टेम्पलेट का उपयोग करने से पहले, कृपया सुनिश्चित करें कि आप Vertex AI Search के साथ प्रमाणित हैं। प्रमाणन गाइड देखें: [यहां](https://cloud.google.com/generative-ai-app-builder/docs/authentication)।

आपको निम्नलिखित भी बनाना होगा:

- एक सर्च एप्लिकेशन [यहां](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es)
- एक डेटा स्टोर [यहां](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)

इस टेम्पलेट के साथ परीक्षण करने के लिए एक उपयुक्त डेटासेट Alphabet Earnings Reports है, जिसे आप
[यहां](https://abc.xyz/investor/) पा सकते हैं। डेटा भी उपलब्ध है
`gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs` पर।

निम्नलिखित पर्यावरण चर सेट करें:

* `GOOGLE_CLOUD_PROJECT_ID` - आपका Google Cloud प्रोजेक्ट आईडी।
* `DATA_STORE_ID` - Vertex AI Search में डेटा स्टोर का आईडी, जो डेटा स्टोर विवरण पृष्ठ पर पाया जाने वाला 36-अक्षरों वाला अल्फ़ान्यूमेरिक मान है।
* `MODEL_TYPE` - Vertex AI Search के लिए मॉडल प्रकार।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे केवल पैकेज के रूप में इंस्टॉल करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package rag-google-cloud-vertexai-search
```

यदि आप इसे मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप सिर्फ़ चला सकते हैं:

```shell
langchain app add rag-google-cloud-vertexai-search
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from rag_google_cloud_vertexai_search.chain import chain as rag_google_cloud_vertexai_search_chain

add_routes(app, rag_google_cloud_vertexai_search_chain, path="/rag-google-cloud-vertexai-search")
```

(वैकल्पिक) अब चलिए LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डिबग करने में मदद करेगा।
आप LangSmith के लिए साइन अप कर सकते हैं [यहां](https://smith.langchain.com/)।
यदि आपके पास एक्सेस नहीं है, तो आप इस अनुभाग को छोड़ सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस डायरेक्टरी के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस स्पिन अप कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा जिसमें एक सर्वर लोकली चल रहा होगा
[http://localhost:8000](http://localhost:8000)

हम सभी टेम्पलेट्स को देख सकते हैं [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
हम प्लेग्राउंड को एक्सेस कर सकते हैं
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)

हम कोड से टेम्पलेट को एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-vertexai-search")
```
