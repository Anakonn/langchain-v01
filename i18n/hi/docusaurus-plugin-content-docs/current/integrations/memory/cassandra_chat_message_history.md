---
translated: true
---

# कैसेंड्रा

>[Apache Cassandra®](https://cassandra.apache.org) एक `NoSQL`, पंक्ति-उन्मुख, अत्यधिक स्केलेबल और अत्यधिक उपलब्ध डेटाबेस है, जो बड़ी मात्रा में डेटा को संग्रहित करने के लिए उपयुक्त है।

>`कैसेंड्रा` चैट संदेश इतिहास को संग्रहित करने के लिए एक अच्छा विकल्प है क्योंकि यह आसानी से स्केल किया जा सकता है और बहुत सारे लेखन को संभाल सकता है।

यह नोटबुक कैसेंड्रा का उपयोग करके चैट संदेश इतिहास को कैसे संग्रहित करें, इस पर चर्चा करता है।

## सेटअप करना

इस नोटबुक को चलाने के लिए आपको या तो एक चल रहा `कैसेंड्रा` क्लस्टर या `DataStax Astra DB` इंस्टेंस होना चाहिए जो क्लाउड में चल रहा है (आप [datastax.com](https://astra.datastax.com)) पर मुफ्त में एक प्राप्त कर सकते हैं)। [cassio.org](https://cassio.org/start_here/) पर अधिक जानकारी देखें।

```python
%pip install --upgrade --quiet  "cassio>=0.1.0"
```

### डेटाबेस कनेक्शन पैरामीटर और गोपनीयता को सेट करें

```python
import getpass

database_mode = (input("\n(C)assandra or (A)stra DB? ")).upper()

keyspace_name = input("\nKeyspace name? ")

if database_mode == "A":
    ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
    #
    ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
elif database_mode == "C":
    CASSANDRA_CONTACT_POINTS = input(
        "Contact points? (comma-separated, empty for localhost) "
    ).strip()
```

स्थानीय या क्लाउड-आधारित Astra DB पर निर्भर करते हुए, संबंधित डेटाबेस कनेक्शन "सत्र" ऑब्जेक्ट बनाएं।

```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

if database_mode == "C":
    if CASSANDRA_CONTACT_POINTS:
        cluster = Cluster(
            [cp.strip() for cp in CASSANDRA_CONTACT_POINTS.split(",") if cp.strip()]
        )
    else:
        cluster = Cluster()
    session = cluster.connect()
elif database_mode == "A":
    ASTRA_DB_CLIENT_ID = "token"
    cluster = Cluster(
        cloud={
            "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
        },
        auth_provider=PlainTextAuthProvider(
            ASTRA_DB_CLIENT_ID,
            ASTRA_DB_APPLICATION_TOKEN,
        ),
    )
    session = cluster.connect()
else:
    raise NotImplementedError
```

## उदाहरण

```python
from langchain_community.chat_message_histories import (
    CassandraChatMessageHistory,
)

message_history = CassandraChatMessageHistory(
    session_id="test-session",
    session=session,
    keyspace=keyspace_name,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### एट्रिब्यूशन बयान

> Apache Cassandra, Cassandra और Apache या तो संयुक्त राज्य अमेरिका और/या अन्य देशों में [Apache Software Foundation](http://www.apache.org/) के पंजीकृत ट्रेडमार्क या ट्रेडमार्क हैं।
