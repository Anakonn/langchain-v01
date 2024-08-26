---
translated: true
---

# Google AlloyDB for PostgreSQL

> [Google Cloud AlloyDB for PostgreSQL](https://cloud.google.com/alloydb) एक पूरी तरह से प्रबंधित `PostgreSQL` संगत डेटाबेस सेवा है जो आपके सबसे अधिक मांग वाले उद्यम कार्यभार के लिए है। `AlloyDB` `Google Cloud` और `PostgreSQL` के सर्वश्रेष्ठ को मिलाता है, जिससे उत्कृष्ट प्रदर्शन, स्केल और उपलब्धता मिलती है। `AlloyDB` Langchain एकीकरण का उपयोग करके अपने डेटाबेस अनुप्रयोग को AI-संचालित अनुभवों को बनाने के लिए विस्तारित करें।

यह नोटबुक `Google Cloud AlloyDB for PostgreSQL` का उपयोग करके चैट संदेश इतिहास को `AlloyDBChatMessageHistory` क्लास के साथ संग्रहित करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/) पर मिलती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB API को सक्षम करें](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [एक AlloyDB इंस्टेंस बनाएं](https://cloud.google.com/alloydb/docs/instance-primary-create)
 * [एक AlloyDB डेटाबेस बनाएं](https://cloud.google.com/alloydb/docs/database-create)
 * [डेटाबेस में एक IAM डेटाबेस उपयोगकर्ता जोड़ें](https://cloud.google.com/alloydb/docs/manage-iam-authn) (वैकल्पिक)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-alloydb-pg` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-alloydb-pg langchain-google-vertexai
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें ताकि आप अपने Google Cloud प्रोजेक्ट तक पहुंच सकें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

अपने Google Cloud प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में Google Cloud संसाधनों का उपयोग कर सकें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* सहायता पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-alloydb-pg` पैकेज के लिए आपके Google Cloud प्रोजेक्ट में [AlloyDB Admin API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com) आवश्यक है।

```python
# enable AlloyDB API
!gcloud services enable alloydb.googleapis.com
```

## मूलभूत उपयोग

### AlloyDB डेटाबेस मान सेट करें

[AlloyDB क्लस्टर पृष्ठ](https://console.cloud.google.com/alloydb?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) में अपने डेटाबेस मान ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-alloydb-cluster"  # @param {type: "string"}
INSTANCE = "my-alloydb-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### AlloyDBEngine कनेक्शन पूल

AlloyDB को एक ChatMessageHistory मेमोरी स्टोर के रूप में स्थापित करने के लिए आवश्यक और तर्कों में से एक `AlloyDBEngine` ऑब्जेक्ट है। `AlloyDBEngine` आपके AlloyDB डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके अनुप्रयोग से सफल कनेक्शन प्राप्त होते हैं और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन होता है।

`AlloyDBEngine.from_instance()` का उपयोग करके एक `AlloyDBEngine` बनाने के लिए आपको केवल 5 चीजें प्रदान करनी होंगी:

1. `project_id`: AlloyDB इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: जहां AlloyDB इंस्टेंस स्थित है वह क्षेत्र।
1. `cluster`: AlloyDB क्लस्टर का नाम।
1. `instance`: AlloyDB इंस्टेंस का नाम।
1. `database`: AlloyDB इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/manage-iam-authn) डेटाबेस प्रमाणीकरण का तरीका होगा। यह लाइब्रेरी [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त वातावरण के IAM प्रिंसिपल का उपयोग करती है।

वैकल्पिक रूप से, [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/alloydb/docs/database-users/about) का उपयोग करके एक उपयोगकर्ता नाम और पासवर्ड का उपयोग करके AlloyDB डेटाबेस तक पहुंच भी की जा सकती है। बस `AlloyDBEngine.from_instance()` में `user` और `password` तर्कों को प्रदान करें:

* `user`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = AlloyDBEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### एक तालिका प्रारंभ करें

`AlloyDBChatMessageHistory` क्लास को चैट संदेश इतिहास को संग्रहित करने के लिए एक विशिष्ट स्कीमा के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

`AlloyDBEngine` इंजन में एक सहायक विधि `init_chat_history_table()` है जिसका उपयोग आप द्वारा उचित स्कीमा के साथ एक तालिका बनाने के लिए किया जा सकता है।

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### AlloyDBChatMessageHistory

`AlloyDBChatMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करनी होंगी:

1. `engine` - एक `AlloyDBEngine` इंजन का एक उदाहरण।
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `table_name`: AlloyDB डेटाबेस में चैट संदेश इतिहास को संग्रहित करने के लिए तालिका का नाम।

```python
from langchain_google_alloydb_pg import AlloyDBChatMessageHistory

history = AlloyDBChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास अप्रासंगिक हो जाता है और इसे हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा AlloyDB में नहीं रखा जाता है और यह सदा के लिए चला जाता है।

```python
history.clear()
```

## 🔗 श्रृंखलाबद्ध करना

हम आसानी से इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ जोड़ सकते हैं।

ऐसा करने के लिए, हम [Google के Vertex AI चैट मॉडल](/docs/integrations/chat/google_vertex_ai_palm) का उपयोग करेंगे, जिसके लिए आपको अपने Google Cloud प्रोजेक्ट में [Vertex AI API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) होगा।

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: AlloyDBChatMessageHistory.create_sync(
        engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```
