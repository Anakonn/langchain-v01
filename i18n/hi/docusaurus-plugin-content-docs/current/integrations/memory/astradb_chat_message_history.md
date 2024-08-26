---
translated: true
---

# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) एक सर्वरलेस वेक्टर-क्षमता वाला डेटाबेस है जो कैसेंड्रा पर निर्मित है और एक आसान-इस्तेमाल JSON API के माध्यम से सुविधाजनक रूप से उपलब्ध कराया जाता है।

यह नोटबुक Astra DB का उपयोग करके चैट संदेश इतिहास को संग्रहित करने के बारे में बताता है।

## सेटअप करना

इस नोटबुक को चलाने के लिए एक चल रहा Astra DB की आवश्यकता है। अपने Astra डैशबोर्ड पर कनेक्शन गोपनीयता प्राप्त करें:

- API एंडपॉइंट `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` जैसा दिखता है;
- टोकन `AstraCS:6gBhNmsk135...` जैसा दिखता है।

```python
%pip install --upgrade --quiet  "astrapy>=0.7.1"
```

### डेटाबेस कनेक्शन पैरामीटर और गोपनीयता को सेट करें

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

स्थानीय या क्लाउड-आधारित Astra DB पर निर्भर करते हुए, संबंधित डेटाबेस कनेक्शन "सत्र" ऑब्जेक्ट बनाएं।

## उदाहरण

```python
from langchain_community.chat_message_histories import AstraDBChatMessageHistory

message_history = AstraDBChatMessageHistory(
    session_id="test-session",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```
