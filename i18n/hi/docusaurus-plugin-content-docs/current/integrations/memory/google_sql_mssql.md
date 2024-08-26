---
translated: true
---

# Google SQL for SQL Server

> [Google Cloud SQL](https://cloud.google.com/sql) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। यह `MySQL`, `PostgreSQL` और `SQL Server` डेटाबेस इंजन प्रदान करती है। Cloud SQL के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक `Google Cloud SQL for SQL Server` का उपयोग करके चैट संदेश इतिहास को `MSSQLChatMessageHistory` क्लास में संग्रहित करने के बारे में बताता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mssql-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mssql-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

 * [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin API को सक्षम करें।](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [SQL Server के लिए एक Cloud SQL इंस्टेंस बनाएं](https://cloud.google.com/sql/docs/sqlserver/create-instance)
 * [एक Cloud SQL डेटाबेस बनाएं](https://cloud.google.com/sql/docs/sqlserver/create-manage-databases)
 * [एक डेटाबेस उपयोगकर्ता बनाएं](https://cloud.google.com/sql/docs/sqlserver/create-manage-users) (`sqlserver` उपयोगकर्ता का उपयोग करने का चयन करने पर वैकल्पिक)

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-cloud-sql-mssql` पैकेज में उपलब्ध है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mssql langchain-google-vertexai
```

**Colab केवल:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में Google Cloud के संसाधनों का उपयोग करने के लिए, इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित कोशिका का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113) सहायता पृष्ठ देखें।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-cloud-sql-mssql` पैकेज के लिए आपके Google Cloud प्रोजेक्ट में [Cloud SQL Admin API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) आवश्यक है।

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## मूलभूत उपयोग

### Cloud SQL डेटाबेस मान सेट करें

[Cloud SQL इंस्टेंस पृष्ठ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) में अपने डेटाबेस मान ढूंढें।

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mssql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
DB_USER = "my-username"  # @param {type: "string"}
DB_PASS = "my-password"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### MSSQLEngine कनेक्शन पूल

Cloud SQL को एक ChatMessageHistory मेमोरी स्टोर के रूप में स्थापित करने के लिए आवश्यक और तर्कों में से एक `MSSQLEngine` ऑब्जेक्ट है। `MSSQLEngine` आपके Cloud SQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन बनाया जा सके और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन किया जा सके।

`MSSQLEngine.from_instance()` का उपयोग करके एक `MSSQLEngine` बनाने के लिए आपको केवल 6 चीजें प्रदान करनी होंगी:

1. `project_id`: Cloud SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: Cloud SQL इंस्टेंस स्थित क्षेत्र।
1. `instance`: Cloud SQL इंस्टेंस का नाम।
1. `database`: Cloud SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।
1. `user`: डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग किया जाने वाला डेटाबेस उपयोगकर्ता।
1. `password`: डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग किया जाने वाला डेटाबेस पासवर्ड।

डेफ़ॉल्ट रूप से, डेटाबेस प्रमाणीकरण के लिए [बिल्ट-इन डेटाबेस प्रमाणीकरण](https://cloud.google.com/sql/docs/sqlserver/users) का उपयोग किया जाता है।

```python
from langchain_google_cloud_sql_mssql import MSSQLEngine

engine = MSSQLEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
    user=DB_USER,
    password=DB_PASS,
)
```

### एक तालिका प्रारंभ करें

`MSSQLChatMessageHistory` क्लास को चैट संदेश इतिहास को संग्रहित करने के लिए एक विशिष्ट स्कीमा के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

`MSSQLEngine` इंजन में एक सहायक विधि `init_chat_history_table()` है जिसका उपयोग आप द्वारा उचित स्कीमा के साथ एक तालिका बनाने के लिए किया जा सकता है।

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### MSSQLChatMessageHistory

`MSSQLChatMessageHistory` क्लास को प्रारंभ करने के लिए आपको केवल 3 चीजें प्रदान करनी होंगी:

1. `engine` - एक `MSSQLEngine` इंजन का एक उदाहरण।
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `table_name`: Cloud SQL डेटाबेस में चैट संदेश इतिहास को संग्रहित करने के लिए तालिका का नाम।

```python
from langchain_google_cloud_sql_mssql import MSSQLChatMessageHistory

history = MSSQLChatMessageHistory(
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

#### सफाई

जब किसी विशिष्ट सत्र का इतिहास अप्रासंगिक हो जाता है और हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा Cloud SQL में नहीं रखा जाता है और यह सदा के लिए चला जाता है।

```python
history.clear()
```

## 🔗 श्रृंखलाबद्ध करना

हम इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ आसानी से जोड़ सकते हैं।

ऐसा करने के लिए, हम [Google के Vertex AI चैट मॉडलों](/docs/integrations/chat/google_vertex_ai_palm) में से एक का उपयोग करेंगे, जिसके लिए आपके Google Cloud प्रोजेक्ट में [Vertex AI API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) आवश्यक है।

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
    lambda session_id: MSSQLChatMessageHistory(
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
