---
translated: true
---

# गूगल मेमोरीस्टोर फॉर रेडिस

> [गूगल क्लाउड मेमोरीस्टोर फॉर रेडिस](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) एक पूरी तरह से प्रबंधित सेवा है जो रेडिस इन-मेमोरी डेटा स्टोर द्वारा संचालित है ताकि एप्लिकेशन कैश बनाया जा सके जो सब-मिलीसेकंड डेटा एक्सेस प्रदान करें। मेमोरीस्टोर फॉर रेडिस के लैंगचेन एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [गूगल क्लाउड मेमोरीस्टोर फॉर रेडिस](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) का उपयोग करके चैट संदेश इतिहास को संग्रहीत करने के लिए `MemorystoreChatMessageHistory` क्लास का उपयोग करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/) पर मिलती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक गूगल क्लाउड प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [मेमोरीस्टोर फॉर रेडिस API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [एक मेमोरीस्टोर फॉर रेडिस इंस्टेंस बनाएं](https://cloud.google.com/memorystore/docs/redis/create-instance-console)। सुनिश्चित करें कि संस्करण 5.0 या उससे अधिक है।

डेटाबेस तक पहुंच की पुष्टि करने के बाद, इस नोटबुक के रनटाइम वातावरण में निम्नलिखित मूल्य भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please specify an endpoint associated with the instance or demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-memorystore-redis` पैकेज में अपने आप में है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

इस नोटबुक में गूगल क्लाउड संसाधनों का उपयोग करने के लिए अपने गूगल क्लाउड प्रोजेक्ट को सेट करें।

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

गूगल क्लाउड में इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में प्रमाणित करें ताकि आप अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच सकें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### MemorystoreChatMessageHistory

`MemorystoreMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 2 चीजें प्रदान करनी होंगी:

1. `redis_client` - एक मेमोरीस्टोर रेडिस का एक उदाहरण।
1. `session_id` - प्रत्येक चैट संदेश इतिहास वस्तु के पास एक अद्वितीय सत्र आईडी होनी चाहिए। यदि सत्र आईडी में पहले से ही रेडिस में संग्रहीत संदेश हैं, तो उन्हें पुनः प्राप्त किया जा सकता है।

```python
import redis
from langchain_google_memorystore_redis import MemorystoreChatMessageHistory

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

message_history = MemorystoreChatMessageHistory(redis_client, session_id="session1")
```

```python
message_history.messages
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा मेमोरीस्टोर फॉर रेडिस में नहीं रहता है और यह सदा के लिए चला जाता है।

```python
message_history.clear()
```
