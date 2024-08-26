---
translated: true
---

# गूगल MySQL के लिए SQL

> [क्लाउड क्लाउड SQL](https://cloud.google.com/sql) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। यह `MySQL`, `PostgreSQL` और `SQL Server` डेटाबेस इंजन प्रदान करता है। क्लाउड SQL के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक `Google Cloud SQL for MySQL` का उपयोग करके चैट संदेश इतिहास को `MySQLChatMessageHistory` क्लास के साथ संग्रहित करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने की आवश्यकता होगी:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [क्लाउड SQL एडमिन API को सक्षम करें।](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [MySQL के लिए क्लाउड SQL इंस्टेंस बनाएं](https://cloud.google.com/sql/docs/mysql/create-instance)
 * [क्लाउड SQL डेटाबेस बनाएं](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [डेटाबेस में एक IAM डेटाबेस उपयोगकर्ता जोड़ें](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (वैकल्पिक)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-cloud-sql-mysql` पैकेज में अपने खुद का है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**केवल Colab:** कर्नल को पुनरारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या पुनरारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनरारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud तक पहुंचने के लिए, उस IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें जो इस नोटबुक में लॉग इन किया गया है।

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
* सहायता पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-cloud-sql-mysql` पैकेज के लिए आपके Google Cloud प्रोजेक्ट में [क्लाउड SQL एडमिन API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) आवश्यक है।

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## मूलभूत उपयोग

### क्लाउड SQL डेटाबेस मूल्य सेट करें

[क्लाउड SQL इंस्टेंस पृष्ठ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) में अपने डेटाबेस मूल्य ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### MySQLEngine कनेक्शन पूल

क्लाउड SQL को एक ChatMessageHistory मेमोरी स्टोर के रूप में स्थापित करने के लिए आवश्यक और तर्कों में से एक `MySQLEngine` ऑब्जेक्ट है। `MySQLEngine` आपके क्लाउड SQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन प्राप्त होते हैं और उद्योग की सर्वोत्तम प्रथाओं का पालन होता है।

`MySQLEngine.from_instance()` का उपयोग करके एक `MySQLEngine` बनाने के लिए आपको केवल 4 चीजें प्रदान करने की आवश्यकता है:

1. `project_id`: क्लाउड SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: क्लाउड SQL इंस्टेंस स्थित क्षेत्र।
1. `instance`: क्लाउड SQL इंस्टेंस का नाम।
1. `database`: क्लाउड SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।

डिफ़ॉल्ट रूप से, [IAM डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) डेटाबेस प्रमाणीकरण का तरीका होगा। यह लाइब्रेरी [एप्लिकेशन डिफ़ॉल्ट क्रेडेंशियल (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) से प्राप्त IAM प्रिंसिपल का उपयोग करती है।

IAM डेटाबेस प्रमाणीकरण के बारे में अधिक जानकारी के लिए देखें:

* [IAM डेटाबेस प्रमाणीकरण के लिए एक इंस्टेंस कॉन्फ़िगर करें](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAM डेटाबेस प्रमाणीकरण के साथ उपयोगकर्ताओं का प्रबंधन करें](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

वैकल्पिक रूप से, उपयोगकर्ता नाम और पासवर्ड का उपयोग करके [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/mysql/built-in-authentication) का भी उपयोग किया जा सकता है। बस `MySQLEngine.from_instance()` में `user` और `password` तर्कों को प्रदान करें:

* `user`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस उपयोगकर्ता
* `password`: बिल्ट-इन डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग करने के लिए डेटाबेस पासवर्ड।

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### एक तालिका प्रारंभ करें

`MySQLChatMessageHistory` क्लास को चैट संदेश इतिहास को संग्रहित करने के लिए एक विशिष्ट स्कीमा के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

`MySQLEngine` इंजन में एक सहायक विधि `init_chat_history_table()` है जिसका उपयोग आप द्वारा तालिका बनाने के लिए किया जा सकता है।

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### MySQLChatMessageHistory

`MySQLChatMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करने की आवश्यकता है:

1. `engine` - एक `MySQLEngine` इंजन का एक उदाहरण।
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `table_name`: क्लाउड SQL डेटाबेस में चैट संदेश इतिहास को संग्रहित करने के लिए तालिका का नाम।

```python
from langchain_google_cloud_sql_mysql import MySQLChatMessageHistory

history = MySQLChatMessageHistory(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा क्लाउड SQL में नहीं रखा जाता है और यह सदा के लिए चला जाता है।

```python
history.clear()
```

## 🔗 श्रृंखलाबद्ध करना

हम इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ आसानी से जोड़ सकते हैं।

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
    lambda session_id: MySQLChatMessageHistory(
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

```output
AIMessage(content=' Hello Bob, how can I help you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content=' Your name is Bob.')
```
