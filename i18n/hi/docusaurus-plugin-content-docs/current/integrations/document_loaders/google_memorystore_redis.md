---
translated: true
---

# गूगल मेमोरीस्टोर फॉर रेडिस

> [गूगल मेमोरीस्टोर फॉर रेडिस](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) एक पूरी तरह से प्रबंधित सेवा है जो रेडिस इन-मेमोरी डेटा स्टोर द्वारा संचालित है ताकि एप्लिकेशन कैश बनाया जा सके जो सब-मिलीसेकंड डेटा एक्सेस प्रदान करें। मेमोरीस्टोर फॉर रेडिस के लैंगचेन एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को एआई-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [मेमोरीस्टोर फॉर रेडिस](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) का उपयोग करके [लैंगचेन दस्तावेज़ों को सहेजने, लोड करने और हटाने](/docs/modules/data_connection/document_loaders/) के बारे में बताता है `MemorystoreDocumentLoader` और `MemorystoreDocumentSaver` का उपयोग करके।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक गूगल क्लाउड प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [मेमोरीस्टोर फॉर रेडिस API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [एक मेमोरीस्टोर फॉर रेडिस इंस्टेंस बनाएं](https://cloud.google.com/memorystore/docs/redis/create-instance-console)। सुनिश्चित करें कि संस्करण 5.0 या उससे अधिक है।

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify an endpoint associated with the instance and a key prefix for demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
KEY_PREFIX = "doc:"  # @param {type:"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-memorystore-redis` पैकेज में अपना खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

अपने गूगल क्लाउड प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में गूगल क्लाउड संसाधनों का उपयोग कर सकें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* समर्थन पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 प्रमाणीकरण

अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में गूगल क्लाउड में प्रमाणित करें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### दस्तावेज़ सहेजें

`MemorystoreDocumentSaver.add_documents(<documents>)` के साथ लैंगचेन दस्तावेज़ सहेजें। `MemorystoreDocumentSaver` क्लास को प्रारंभ करने के लिए आपको 2 चीजें प्रदान करनी होंगी:

1. `client` - एक `redis.Redis` क्लाइंट ऑब्जेक्ट।
1. `key_prefix` - रेडिस में दस्तावेज़ों को स्टोर करने के लिए कुंजियों के लिए एक उपसर्ग।

दस्तावेज़ `key_prefix` के निर्दिष्ट उपसर्ग के साथ यादृच्छिक रूप से उत्पन्न कुंजियों में स्टोर किए जाएंगे। वैकल्पिक रूप से, आप `add_documents` विधि में `ids` निर्दिष्ट करके कुंजियों के उपसर्गों को नामित कर सकते हैं।

```python
import redis
from langchain_core.documents import Document
from langchain_google_memorystore_redis import MemorystoreDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
doc_ids = [f"{i}" for i in range(len(test_docs))]

redis_client = redis.from_url(ENDPOINT)
saver = MemorystoreDocumentSaver(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_field="page_content",
)
saver.add_documents(test_docs, ids=doc_ids)
```

### दस्तावेज़ लोड करें

एक लोडर को प्रारंभ करें जो विशिष्ट उपसर्ग के साथ मेमोरीस्टोर फॉर रेडिस इंस्टेंस में सभी दस्तावेज़ों को लोड करता है।

`MemorystoreDocumentLoader.load()` या `MemorystoreDocumentLoader.lazy_load()` के साथ लैंगचेन दस्तावेज़ लोड करें। `lazy_load` केवल इटरेशन के दौरान डेटाबेस से प्रश्न करता है। `MemorystoreDocumentLoader` क्लास को प्रारंभ करने के लिए आपको निम्नलिखित प्रदान करना होगा:

1. `client` - एक `redis.Redis` क्लाइंट ऑब्जेक्ट।
1. `key_prefix` - रेडिस में दस्तावेज़ों को स्टोर करने के लिए कुंजियों के लिए एक उपसर्ग।

```python
import redis
from langchain_google_memorystore_redis import MemorystoreDocumentLoader

redis_client = redis.from_url(ENDPOINT)
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["page_content"]),
)
for doc in loader.lazy_load():
    print("Loaded documents:", doc)
```

### दस्तावेज़ हटाएं

`MemorystoreDocumentSaver.delete()` के साथ मेमोरीस्टोर फॉर रेडिस इंस्टेंस में निर्दिष्ट उपसर्ग के साथ सभी कुंजियों को हटाएं। यदि आप जानते हैं, तो आप कुंजियों के उपसर्गों को भी निर्दिष्ट कर सकते हैं।

```python
docs = loader.load()
print("Documents before delete:", docs)

saver.delete(ids=[0])
print("Documents after delete:", loader.load())

saver.delete()
print("Documents after delete all:", loader.load())
```

## उन्नत उपयोग

### दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा को अनुकूलित करें

एक से अधिक सामग्री फ़ील्ड के साथ लोडर को प्रारंभ करते समय, लोड किए गए दस्तावेज़ों का `page_content` एक JSON-एन्कोडेड स्ट्रिंग होगा जिसमें `content_fields` में निर्दिष्ट शीर्ष स्तर के फ़ील्ड होंगे।

यदि `metadata_fields` निर्दिष्ट किए जाते हैं, तो लोड किए गए दस्तावेज़ों का `metadata` फ़ील्ड केवल `metadata_fields` में निर्दिष्ट शीर्ष स्तर के फ़ील्ड होंगे। यदि मेटाडेटा फ़ील्डों के मूल्यों में से कोई भी JSON-एन्कोडेड स्ट्रिंग के रूप में स्टोर किया गया है, तो मेटाडेटा फ़ील्डों में लोड करने से पहले इसे डीकोड कर दिया जाएगा।

```python
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["content_field_1", "content_field_2"]),
    metadata_fields=set(["title", "author"]),
)
```
