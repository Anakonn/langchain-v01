---
translated: true
---

# Google Vertex AI PaLM

>[Vertex AI PaLM API](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview) एक Google Cloud पर एक सेवा है जो एम्बेडिंग मॉडल को एक्सपोज़ करता है।

नोट: यह एकीकरण Google PaLM एकीकरण से अलग है।

डिफ़ॉल्ट रूप से, Google Cloud [उपयोगकर्ता डेटा का उपयोग नहीं करता](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) Google Cloud के AI/ML गोपनीयता प्रतिबद्धता के हिस्से के रूप में अपने फाउंडेशन मॉडल को प्रशिक्षित करने के लिए। Google द्वारा डेटा प्रसंस्करण के बारे में अधिक जानकारी [Google के ग्राहक डेटा प्रसंस्करण एड्डेंडम (CDPA)](https://cloud.google.com/terms/data-processing-addendum) में भी मिल सकती है।

Vertex AI PaLM का उपयोग करने के लिए आपके पास `langchain-google-vertexai` Python पैकेज इंस्टॉल होना चाहिए और या तो:
- आपके वातावरण के लिए क्रेडेंशियल कॉन्फ़िगर किए गए हों (gcloud, workload identity, आदि...)
- GOOGLE_APPLICATION_CREDENTIALS पर्यावरण चर के रूप में एक सर्विस अकाउंट JSON फ़ाइल का पथ संग्रहित किया गया हो

यह कोडबेस `google.auth` लाइब्रेरी का उपयोग करता है जो पहले उपर्युक्त एप्लिकेशन क्रेडेंशियल चर को देखता है, और फिर सिस्टम-स्तर प्रमाणीकरण को देखता है।

अधिक जानकारी के लिए, देखें:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain langchain-google-vertexai
```

```python
from langchain_google_vertexai import VertexAIEmbeddings
```

```python
embeddings = VertexAIEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
