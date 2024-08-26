---
translated: true
---

# rag-google-cloud-sensitive-data-protection

यह टेम्प्लेट एक एप्लिकेशन है जो Google Vertex AI Search, एक मशीन लर्निंग संचालित खोज सेवा, और PaLM 2 for Chat (chat-bison) का उपयोग करता है। एप्लिकेशन आपके दस्तावेजों के आधार पर प्रश्नों का उत्तर देने के लिए एक Retrieval चेन का उपयोग करता है।

यह टेम्प्लेट एक एप्लिकेशन है जो Google Sensitive Data Protection, एक सेवा जो पाठ में संवेदनशील डेटा का पता लगाने और संशोधन के लिए है, और PaLM 2 for Chat (chat-bison) का उपयोग करता है, हालांकि आप किसी भी मॉडल का उपयोग कर सकते हैं।

Sensitive Data Protection का उपयोग करने के संदर्भ में अधिक जानकारी के लिए,
[यहाँ देखें](https://cloud.google.com/dlp/docs/sensitive-data-protection-overview)।

## Environment Setup

इस टेम्प्लेट का उपयोग करने से पहले, कृपया सुनिश्चित करें कि आपने अपने Google Cloud प्रोजेक्ट में [DLP API](https://console.cloud.google.com/marketplace/product/google/dlp.googleapis.com)
और [Vertex AI API](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com) सक्षम किया है।

Google Cloud से संबंधित कुछ सामान्य पर्यावरण समस्या निवारण चरणों के लिए, इस readme के नीचे देखें।

निम्नलिखित पर्यावरण वेरिएबल्स सेट करें:

* `GOOGLE_CLOUD_PROJECT_ID` - आपका Google Cloud प्रोजेक्ट ID।
* `MODEL_TYPE` - Vertex AI Search के लिए मॉडल प्रकार (उदा. `chat-bison`)

## Usage

इस पैकेज का उपयोग करने के लिए, आपको पहले LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package rag-google-cloud-sensitive-data-protection
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल चला सकते हैं:

```shell
langchain app add rag-google-cloud-sensitive-data-protection
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from rag_google_cloud_sensitive_data_protection.chain import chain as rag_google_cloud_sensitive_data_protection_chain

add_routes(app, rag_google_cloud_sensitive_data_protection_chain, path="/rag-google-cloud-sensitive-data-protection")
```

(वैकल्पिक) अब चलिए LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डिबग करने में मदद करेगा।
आप LangSmith के लिए [यहाँ साइन अप कर सकते हैं](https://smith.langchain.com/)।
यदि आपके पास एक्सेस नहीं है, तो आप इस सेक्शन को छोड़ सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस डाइरेक्टरी के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चालू कर सकते हैं:

```shell
langchain serve
```

यह एक स्थानीय सर्वर के साथ FastAPI ऐप को चालू करेगा
[http://localhost:8000](http://localhost:8000)

हम सभी टेम्प्लेट्स को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
हम प्लेग्राउंड तक पहुँच सकते हैं
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)

हम कोड के साथ टेम्प्लेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-sensitive-data-protection")
```

# Troubleshooting Google Cloud

आप अपने `gcloud` क्रेडेंशियल्स को उनके CLI का उपयोग कर `gcloud auth application-default login` से सेट कर सकते हैं

आप अपने `gcloud` प्रोजेक्ट को निम्नलिखित कमांड्स के साथ सेट कर सकते हैं

```bash
gcloud config set project <your project>
gcloud auth application-default set-quota-project <your project>
export GOOGLE_CLOUD_PROJECT_ID=<your project>
```
