---
translated: true
---

# गूगल एल कैरो ओरेकल

> [गूगल क्लाउड एल कैरो ओरेकल](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator) `कुबरनेटीज़` में `ओरेकल` डेटाबेस चलाने का एक तरीका प्रदान करता है, जो एक पोर्टेबल, ओपन सोर्स, समुदाय-संचालित, कोई वेंडर लॉक-इन कंटेनर ऑर्केस्ट्रेशन सिस्टम है। `एल कैरो` व्यापक और सुसंगत कॉन्फ़िगरेशन और डेप्लॉयमेंट के लिए एक शक्तिशाली घोषणात्मक API प्रदान करता है, साथ ही वास्तविक समय की परिचालन और मॉनिटरिंग के लिए भी। `एल कैरो` लैंगचेन एकीकरण का लाभ उठाकर अपने `ओरेकल` डेटाबेस की क्षमताओं का विस्तार करें और AI-संचालित अनुभव बनाएं।

यह गाइड `एल कैरो` लैंगचेन एकीकरण का उपयोग करके `ElCarroChatMessageHistory` क्लास के साथ चैट संदेश इतिहास को संग्रहीत करने के बारे में बताता है। यह एकीकरण किसी भी `ओरेकल` डेटाबेस के लिए काम करता है, भले ही वह कहीं भी चल रहा हो।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/) पर मिलती है।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/chat_message_history.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए आपको निम्नलिखित कार्य करने होंगे:

 * यदि आप अपने ओरेकल डेटाबेस को एल कैरो के साथ चलाना चाहते हैं, तो [शुरू करना](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started) खंड पूरा करें।

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-el-carro` पैकेज में मौजूद है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-el-carro langchain-google-vertexai langchain
```

**केवल Colab:** कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित कोशिका को अनकमेंट करें या बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में गूगल क्लाउड में प्रमाणित करें ताकि आप अपने गूगल क्लाउड प्रोजेक्ट तक पहुंच सकें।

* यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए कोशिका का उपयोग करें और आगे बढ़ें।
* यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
# from google.colab import auth

# auth.authenticate_user()
```

### ☁ अपने गूगल क्लाउड प्रोजेक्ट सेट करें

अपने गूगल क्लाउड प्रोजेक्ट को सेट करें ताकि आप इस नोटबुक में गूगल क्लाउड संसाधनों का लाभ उठा सकें।

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

## मूलभूत उपयोग

### ओरेकल डेटाबेस कनेक्शन सेट करें

अपने ओरेकल डेटाबेस कनेक्शन विवरण के साथ निम्नलिखित चर भरें।

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

यदि आप `एल कैरो` का उपयोग कर रहे हैं, तो आप होस्टनाम और पोर्ट मान `एल कैरो` Kubernetes इंस्टेंस की स्थिति में पा सकते हैं।
अपने PDB के लिए बनाए गए उपयोगकर्ता पासवर्ड का उपयोग करें।
उदाहरण

kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON
mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021                          False         CreateInProgress

### ElCarroEngine कनेक्शन पूल

`ElCarroEngine` आपके ओरेकल डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन प्राप्त होते हैं और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन होता है।

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### एक तालिका इनिशियलाइज़ करें

`ElCarroChatMessageHistory` क्लास को चैट संदेश इतिहास को संग्रहीत करने के लिए एक विशिष्ट स्कीमा के साथ एक डेटाबेस तालिका की आवश्यकता होती है।

`ElCarroEngine` क्लास में एक `init_chat_history_table()` मेथड है जिसका उपयोग आप इस तालिका को आपके लिए बनाने के लिए कर सकते हैं।

```python
elcarro_engine.init_chat_history_table(table_name=TABLE_NAME)
```

### ElCarroChatMessageHistory

`ElCarroChatMessageHistory` क्लास को इनिशियलाइज़ करने के लिए आपको केवल 3 चीजें प्रदान करने की आवश्यकता है:

1. `elcarro_engine` - एक `ElCarroEngine` इंजन का एक उदाहरण।
1. `session_id` - एक अद्वितीय पहचानकर्ता स्ट्रिंग जो सत्र के लिए एक आईडी निर्दिष्ट करता है।
1. `table_name` : ओरेकल डेटाबेस में चैट संदेश इतिहास को संग्रहीत करने के लिए तालिका का नाम।

```python
from langchain_google_el_carro import ElCarroChatMessageHistory

history = ElCarroChatMessageHistory(
    elcarro_engine=elcarro_engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### सफाई करना

जब किसी विशिष्ट सत्र का इतिहास पुराना हो जाता है और हटाया जा सकता है, तो इसे निम्नानुसार किया जा सकता है।

**नोट:** एक बार हटा दिए जाने पर, डेटा आपके डेटाबेस में नहीं रहता है और इसे हमेशा के लिए खो दिया जाता है।

```python
history.clear()
```

## 🔗 श्रृंखलाबद्ध करना

हम आसानी से इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ जोड़ सकते हैं

ऐसा करने के लिए हम [गूगल के Vertex AI चैट मॉडल](/docs/integrations/chat/google_vertex_ai_palm) का उपयोग करेंगे जिसके लिए आपको अपने गूगल क्लाउड प्रोजेक्ट में [Vertex AI API को सक्षम करना](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) होगा।

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
    lambda session_id: ElCarroChatMessageHistory(
        elcarro_engine,
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
