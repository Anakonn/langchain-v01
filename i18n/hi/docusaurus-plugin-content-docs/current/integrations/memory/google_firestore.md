---
translated: true
---

# Google Firestore (नेटिव मोड)

> [Google Cloud Firestore](https://cloud.google.com/firestore) एक सर्वरलेस दस्तावेज़-उन्मुख डेटाबेस है जो किसी भी मांग को पूरा करने के लिए स्केल करता है। `Firestore के` Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [Google Cloud Firestore](https://cloud.google.com/firestore) का उपयोग करके चैट संदेश इतिहास को संग्रहित करने के लिए `FirestoreChatMessageHistory` क्लास का उपयोग करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-firestore-python/) पर मिल सकती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Firestore API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [एक Firestore डेटाबेस बनाएं](https://cloud.google.com/firestore/docs/manage-databases)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण अपने `langchain-google-firestore` पैकेज में मौजूद है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिंकित सेल को अनकमेंट करें या कर्नल को पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ अपने Google Cloud प्रोजेक्ट को सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

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

अपने Google Cloud प्रोजेक्ट तक पहुंच प्राप्त करने के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### FirestoreChatMessageHistory

`FirestoreChatMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करनी होंगी:

1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `collection`: Firestore संग्रह का एकल `/`-डिलिमिटेड पथ।

```python
from langchain_google_firestore import FirestoreChatMessageHistory

chat_history = FirestoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```

```python
chat_history.messages
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और इसे डेटाबेस और मेमोरी से हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा Firestore में और संग्रहीत नहीं होता है और यह सदा के लिए चला जाता है।

```python
chat_history.clear()
```

### कस्टम क्लाइंट

क्लाइंट को डिफ़ॉल्ट रूप से उपलब्ध वातावरण चर का उपयोग करके बनाया जाता है। [कस्टम क्लाइंट](https://cloud.google.com/python/docs/reference/firestore/latest/client) को निर्माता को पारित किया जा सकता है।

```python
from google.auth import compute_engine
from google.cloud import firestore

client = firestore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = FirestoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
