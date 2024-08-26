---
translated: true
---

# Google Bigtable

> [Google Cloud Bigtable](https://cloud.google.com/bigtable) एक कुंजी-मूल्य और व्यापक-स्तंभ स्टोर है, जो संरचित, अर्ध-संरचित या अव्यवस्थित डेटा तक तेज़ पहुंच के लिए उपयुक्त है। Bigtable के Langchain एकीकरण का उपयोग करके अपने डेटाबेस अनुप्रयोग को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक [Google Cloud Bigtable](https://cloud.google.com/bigtable) का उपयोग करके चैट संदेश इतिहास को `BigtableChatMessageHistory` क्लास के साथ संग्रहीत करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/) पर।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने की आवश्यकता होगी:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Bigtable API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [एक Bigtable इंस्टेंस बनाएं](https://cloud.google.com/bigtable/docs/creating-instance)
* [एक Bigtable टेबल बनाएं](https://cloud.google.com/bigtable/docs/managing-tables)
* [Bigtable एक्सेस क्रेडेंशियल बनाएं](https://developers.google.com/workspace/guides/create-credentials)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-bigtable` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**केवल Colab**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या कर्नल को पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

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

अपने Google Cloud प्रोजेक्ट तक पहुंचने के लिए इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

## मूलभूत उपयोग

### Bigtable स्कीमा को इनिशियलाइज़ करें

BigtableChatMessageHistory के लिए स्कीमा में इंस्टेंस और टेबल मौजूद होने की आवश्यकता है, और `langchain` नामक एक कॉलम परिवार होना चाहिए।

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

यदि टेबल या कॉलम परिवार मौजूद नहीं हैं, तो आप उन्हें बनाने के लिए निम्नलिखित फ़ंक्शन का उपयोग कर सकते हैं:

```python
from google.cloud import bigtable
from langchain_google_bigtable import create_chat_history_table

create_chat_history_table(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)
```

### BigtableChatMessageHistory

`BigtableChatMessageHistory` क्लास को इनिशियलाइज़ करने के लिए आपको केवल 3 चीज़ें प्रदान करने की आवश्यकता है:

1. `instance_id` - चैट संदेश इतिहास के लिए उपयोग किया जाने वाला Bigtable इंस्टेंस।
1. `table_id`: चैट संदेश इतिहास को संग्रहीत करने के लिए Bigtable टेबल।
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।

```python
from langchain_google_bigtable import BigtableChatMessageHistory

message_history = BigtableChatMessageHistory(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और हटाया जा सकता है, तो इसे निम्नलिखित तरीके से किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा Bigtable में नहीं रखा जाता है और यह सदा के लिए चला जाता है।

```python
message_history.clear()
```

## उन्नत उपयोग

### कस्टम क्लाइंट

डिफ़ॉल्ट रूप से बनाया गया क्लाइंट केवल admin=True विकल्प का उपयोग करता है। गैर-डिफ़ॉल्ट का उपयोग करने के लिए, [कस्टम क्लाइंट](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) को निर्माता में पास किया जा सकता है।

```python
from google.cloud import bigtable

client = (bigtable.Client(...),)

create_chat_history_table(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)

custom_client_message_history = BigtableChatMessageHistory(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)
```
