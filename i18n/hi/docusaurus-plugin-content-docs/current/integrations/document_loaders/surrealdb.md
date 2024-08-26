---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# SurrealDB

>[SurrealDB](https://surrealdb.com/) एक एंड-टू-एंड क्लाउड-नेटिव डेटाबेस है जो आधुनिक एप्लिकेशन के लिए डिज़ाइन किया गया है, जिसमें वेब, मोबाइल, सर्वरलेस, Jamstack, बैकएंड और पारंपरिक एप्लिकेशन शामिल हैं। SurrealDB के साथ, आप अपने डेटाबेस और API इंफ़्रास्ट्रक्चर को सरल बना सकते हैं, विकास समय को कम कर सकते हैं, और सुरक्षित, प्रदर्शन वाले ऐप्स को तेजी से और लागत प्रभावी ढंग से बना सकते हैं।

>**SurrealDB की प्रमुख विशेषताएं हैं:**

>* **विकास समय को कम करता है:** SurrealDB आपके डेटाबेस और API स्टैक को सरल बनाता है क्योंकि यह अधिकांश सर्वर-साइड घटकों की आवश्यकता को समाप्त करता है, जिससे आप सुरक्षित, प्रदर्शन वाले ऐप्स को तेजी से और सस्ते में बना सकते हैं।
>* **रियल-टाइम सहयोगात्मक API बैकएंड सेवा:** SurrealDB एक डेटाबेस और एक API बैकएंड सेवा दोनों के रूप में कार्य करता है, जिससे रियल-टाइम सहयोग सक्षम होता है।
>* **कई क्वेरी भाषाओं का समर्थन:** SurrealDB क्लाइंट डिवाइस से SQL क्वेरी, GraphQL, ACID लेनदेन, WebSocket कनेक्शन, संरचित और अव्यवस्थित डेटा, ग्राफ क्वेरी, पूर्ण-पाठ अनुक्रमण और भौगोलिक क्वेरी का समर्थन करता है।
>* **सूक्ष्म पहुंच नियंत्रण:** SurrealDB पंक्ति-स्तर की अनुमति-आधारित पहुंच नियंत्रण प्रदान करता है, जिससे आप डेटा पहुंच का प्रबंधन सटीकता से कर सकते हैं।

>[विशेषताएं](https://surrealdb.com/features), नवीनतम [रिलीज़](https://surrealdb.com/releases) और [दस्तावेज़ीकरण](https://surrealdb.com/docs) देखें।

यह नोटबुक `SurrealDBLoader` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## अवलोकन

SurrealDB दस्तावेज़ लोडर SurrealDB डेटाबेस से Langchain दस्तावेज़ों की एक सूची लौटाता है।

दस्तावेज़ लोडर निम्नलिखित वैकल्पिक पैरामीटर लेता है:

* `dburl`: वेबसॉकेट एंडपॉइंट का कनेक्शन स्ट्रिंग। डिफ़ॉल्ट: `ws://localhost:8000/rpc`
* `ns`: नेमस्पेस का नाम। डिफ़ॉल्ट: `langchain`
* `db`: डेटाबेस का नाम। डिफ़ॉल्ट: `database`
* `table`: टेबल का नाम। डिफ़ॉल्ट: `documents`
* `db_user`: आवश्यकता होने पर SurrealDB क्रेडेंशियल: डीबी उपयोगकर्ता नाम।
* `db_pass`: आवश्यकता होने पर SurrealDB क्रेडेंशियल: डीबी पासवर्ड।
* `filter_criteria`: टेबल से परिणाम फ़िल्टर करने के लिए `WHERE` क्लॉज़ बनाने के लिए एक डिक्शनरी।

आउटपुट `Document` निम्नलिखित आकार लेता है:

```output
Document(
    page_content=<json encoded string containing the result document>,
    metadata={
        'id': <document id>,
        'ns': <namespace name>,
        'db': <database_name>,
        'table': <table name>,
        ... <additional fields from metadata property of the document>
    }
)
```

## सेटअप

नीचे दिए गए कोशिकाओं को अनकमेंट करें ताकि surrealdb और langchain इंस्टॉल हो जाए।

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
import json

from langchain_community.document_loaders.surrealdb import SurrealDBLoader
```

```python
loader = SurrealDBLoader(
    dburl="ws://localhost:8000/rpc",
    ns="langchain",
    db="database",
    table="documents",
    db_user="root",
    db_pass="root",
    filter_criteria={},
)
docs = loader.load()
len(docs)
```

```output
42
```

```python
doc = docs[-1]
doc.metadata
```

```output
{'id': 'documents:zzz434sa584xl3b4ohvk',
 'source': '../../modules/state_of_the_union.txt',
 'ns': 'langchain',
 'db': 'database',
 'table': 'documents'}
```

```python
len(doc.page_content)
```

```output
18078
```

```python
page_content = json.loads(doc.page_content)
```

```python
page_content["text"]
```

```output
'When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'
```
