---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) एक वितरित, RESTful खोज और विश्लेषण इंजन है, जो वेक्टर और लेक्सिकल खोज दोनों करने में सक्षम है। यह Apache Lucene लाइब्रेरी पर निर्मित है।

यह नोटबुक `Elasticsearch` के साथ चैट संदेश इतिहास कार्यक्षमता का उपयोग करने का प्रदर्शन करता है।

## Elasticsearch सेट अप करें

Elasticsearch इंस्टांस सेट करने के दो प्रमुख तरीके हैं:

1. **Elastic Cloud.** Elastic Cloud एक प्रबंधित Elasticsearch सेवा है। [मुफ्त ट्रायल](https://cloud.elastic.co/registration?storm=langchain-notebook) के लिए साइन अप करें।

2. **स्थानीय Elasticsearch इंस्टॉलेशन।** स्थानीय रूप से Elasticsearch चलाकर शुरू करें। सबसे आसान तरीका आधिकारिक Elasticsearch Docker छवि का उपयोग करना है। अधिक जानकारी के लिए [Elasticsearch Docker दस्तावेज़ीकरण](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) देखें।

## निर्भरताएं स्थापित करें

```python
%pip install --upgrade --quiet  elasticsearch langchain
```

## प्रमाणीकरण

### डिफ़ॉल्ट "elastic" उपयोगकर्ता के लिए पासवर्ड कैसे प्राप्त करें

Elastic Cloud पासवर्ड डिफ़ॉल्ट "elastic" उपयोगकर्ता के लिए प्राप्त करने के लिए:
1. [Elastic Cloud कंसोल](https://cloud.elastic.co) में लॉग इन करें
2. "सुरक्षा" > "उपयोगकर्ता" पर जाएं
3. "elastic" उपयोगकर्ता को खोजें और "संपादित" करें
4. "पासवर्ड रीसेट" पर क्लिक करें
5. पासवर्ड रीसेट करने के लिए प्रॉम्प्ट का पालन करें

### उपयोगकर्ता नाम/पासवर्ड का उपयोग करें

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### API कुंजी कैसे प्राप्त करें

API कुंजी प्राप्त करने के लिए:
1. [Elastic Cloud कंसोल](https://cloud.elastic.co) में लॉग इन करें
2. `Kibana` खोलें और Stack Management > API Keys पर जाएं
3. "API कुंजी बनाएं" पर क्लिक करें
4. API कुंजी के लिए एक नाम दर्ज करें और "बनाएं" पर क्लिक करें

### API कुंजी का उपयोग करें

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```

## Elasticsearch क्लाइंट और चैट संदेश इतिहास को इनिशियलाइज़ करें

```python
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## चैट संदेश इतिहास का उपयोग करें

```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```
