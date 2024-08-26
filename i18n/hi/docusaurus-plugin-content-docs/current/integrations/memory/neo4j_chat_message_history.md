---
translated: true
---

# नियो4जे

[नियो4जे](https://en.wikipedia.org/wiki/Neo4j) एक ओपन-सोर्स ग्राफ़ डेटाबेस प्रबंधन प्रणाली है, जो अत्यधिक जुड़े हुए डेटा के कुशल प्रबंधन के लिए प्रसिद्ध है। पारंपरिक डेटाबेसों से भिन्न, जो डेटा को तालिकाओं में संग्रहीत करते हैं, नियो4जे नोड्स, एज और गुणों के साथ एक ग्राफ़ संरचना का उपयोग करता है। इस डिज़ाइन से जटिल डेटा संबंधों पर उच्च-प्रदर्शन वाले क्वेरी की अनुमति मिलती है।

यह नोटबुक `नियो4जे` का उपयोग करके चैट संदेश इतिहास को संग्रहीत करने के बारे में बताता है।

```python
from langchain_community.chat_message_histories import Neo4jChatMessageHistory

history = Neo4jChatMessageHistory(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    session_id="session_id_1",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
