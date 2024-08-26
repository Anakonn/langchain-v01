---
translated: true
---

# Google Spanner

> [Google Cloud Spanner](https://cloud.google.com/spanner) एक अत्यधिक स्केलेबल डेटाबेस है जो असीमित स्केलेबिलिटी के साथ रिलेशनल सेमेंटिक्स, जैसे सेकंडरी इंडेक्स, मजबूत सुसंगति, स्कीमा और SQL प्रदान करता है, जो एक आसान समाधान में 99.999% उपलब्धता प्रदान करता है।

यह नोटबुक `Spanner` का उपयोग करके चैट संदेश इतिहास को `SpannerChatMessageHistory` क्लास के साथ संग्रहित करने के बारे में बताता है।
पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-spanner-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/samples/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud Spanner API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [एक Spanner इंस्टेंस बनाएं](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [एक Spanner डेटाबेस बनाएं](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-spanner` पैकेज में है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-spanner
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud तक पहुंचने के लिए, इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) समर्थन पृष्ठ देखें।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-spanner` पैकेज के लिए आपके Google Cloud प्रोजेक्ट में [Spanner API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com) आवश्यक है।

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## मूलभूत उपयोग

### Spanner डेटाबेस मूल्यों को सेट करें

[Spanner इंस्टेंस पृष्ठ](https://console.cloud.google.com/spanner) में अपने डेटाबेस मूल्यों को ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### एक तालिका प्रारंभ करें

`SpannerChatMessageHistory` क्लास को चैट संदेश इतिहास को संग्रहित करने के लिए एक विशिष्ट स्कीमा के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

सहायक विधि `init_chat_history_table()` का उपयोग करके आप आपके लिए उचित स्कीमा के साथ एक तालिका बना सकते हैं।

```python
from langchain_google_spanner import (
    SpannerChatMessageHistory,
)

SpannerChatMessageHistory.init_chat_history_table(table_name=TABLE_NAME)
```

### SpannerChatMessageHistory

`SpannerChatMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करनी होंगी:

1. `instance_id` - Spanner इंस्टेंस का नाम
1. `database_id` - Spanner डेटाबेस का नाम
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `table_name` - चैट संदेश इतिहास को संग्रहित करने के लिए डेटाबेस में तालिका का नाम।

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

## कस्टम क्लाइंट

डिफ़ॉल्ट रूप से बनाया गया क्लाइंट डिफ़ॉल्ट क्लाइंट है। गैर-डिफ़ॉल्ट का उपयोग करने के लिए, [कस्टम क्लाइंट](https://cloud.google.com/spanner/docs/samples/spanner-create-client-with-query-options#spanner_create_client_with_query_options-python) को निर्माता में पारित किया जा सकता है।

```python
from google.cloud import spanner

custom_client_message_history = SpannerChatMessageHistory(
    instance_id="my-instance",
    database_id="my-database",
    client=spanner.Client(...),
)
```

## सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।
नोट: एक बार हटा दिए जाने पर, डेटा Cloud Spanner में नहीं रखा जाता है और यह सदा के लिए चला जाता है।

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.clear()
```
