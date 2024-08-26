---
translated: true
---

# गूगल जनरेटिव एआई एम्बेडिंग्स

`GoogleGenerativeAIEmbeddings` क्लास का उपयोग करके गूगल के जनरेटिव एआई एम्बेडिंग्स सेवा से कनेक्ट करें, जो [langchain-google-genai](https://pypi.org/project/langchain-google-genai/) पैकेज में मिलती है।

## इंस्टॉलेशन

```python
%pip install --upgrade --quiet  langchain-google-genai
```

## क्रेडेंशियल्स

```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass("Provide your Google API key here")
```

## उपयोग

```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector = embeddings.embed_query("hello, world!")
vector[:5]
```

```output
[0.05636945, 0.0048285457, -0.0762591, -0.023642512, 0.05329321]
```

## बैच

आप एक साथ कई स्ट्रिंग्स को एम्बेड कर सकते हैं जिससे प्रोसेसिंग गति में तेजी आएगी:

```python
vectors = embeddings.embed_documents(
    [
        "Today is Monday",
        "Today is Tuesday",
        "Today is April Fools day",
    ]
)
len(vectors), len(vectors[0])
```

```output
(3, 768)
```

## टास्क प्रकार

`GoogleGenerativeAIEmbeddings` वैकल्पिक रूप से `task_type` का समर्थन करता है, जिसका वर्तमान में निम्नलिखित में से एक होना चाहिए:

- task_type_unspecified
- retrieval_query
- retrieval_document
- semantic_similarity
- classification
- clustering

डिफ़ॉल्ट रूप से, हम `embed_documents` मेथड में `retrieval_document` और `embed_query` मेथड में `retrieval_query` का उपयोग करते हैं। यदि आप एक टास्क प्रकार प्रदान करते हैं, तो हम सभी मेथड्स के लिए उसका उपयोग करेंगे।

```python
%pip install --upgrade --quiet  matplotlib scikit-learn
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
query_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_query"
)
doc_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_document"
)
```

ये सभी 'retrieval_query' टास्क सेट के साथ एम्बेड किए जाएंगे

```python
query_vecs = [query_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

ये सभी 'retrieval_document' टास्क सेट के साथ एम्बेड किए जाएंगे

```python
doc_vecs = [doc_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

रिट्रीवल में, सापेक्ष दूरी महत्वपूर्ण है। ऊपर के चित्र में, आप देख सकते हैं कि "प्रासंगिक दस्तावेज़" और "समान दस्तावेज़" के बीच समानता स्कोर में अंतर है, और "प्रासंगिक प्रश्न" और "समान प्रश्न" के बीच अंतर अधिक है।

## अतिरिक्त कॉन्फ़िगरेशन

आप ChatGoogleGenerativeAI में निम्नलिखित पैरामीटर पास कर सकते हैं ताकि SDK का व्यवहार अनुकूलित किया जा सके:

- `client_options`: गूगल एपीआई क्लाइंट को पास करने के लिए [क्लाइंट विकल्प](https://googleapis.dev/python/google-api-core/latest/client_options.html#module-google.api_core.client_options), जैसे कि कस्टम `client_options["api_endpoint"]`
- `transport`: उपयोग करने के लिए परिवहन विधि, जैसे `rest`, `grpc`, या `grpc_asyncio`।
