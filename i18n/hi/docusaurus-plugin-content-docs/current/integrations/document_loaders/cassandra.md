---
translated: true
---

# कैसेंड्रा

[कैसेंड्रा](https://cassandra.apache.org/) एक NoSQL, पंक्ति-उन्मुख, अत्यधिक स्केलेबल और अत्यधिक उपलब्ध डेटाबेस है। संस्करण 5.0 से शुरू, डेटाबेस में [वेक्टर खोज क्षमताएं](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html) शामिल हैं।

## अवलोकन

कैसेंड्रा डॉक्यूमेंट लोडर कैसेंड्रा डेटाबेस से Langchain दस्तावेजों की एक सूची वापस देता है।

आपको या तो एक CQL क्वेरी या एक तालिका नाम प्रदान करना होगा ताकि दस्तावेज़ों को पुनर्प्राप्त किया जा सके।
लोडर निम्नलिखित पैरामीटर लेता है:

* तालिका: (वैकल्पिक) डेटा लोड करने के लिए तालिका।
* सत्र: (वैकल्पिक) कैसेंड्रा ड्राइवर सत्र। यदि प्रदान नहीं किया गया है, तो कैसियो संबंधित सत्र का उपयोग किया जाएगा।
* कीस्पेस: (वैकल्पिक) तालिका का कीस्पेस। यदि प्रदान नहीं किया गया है, तो कैसियो संबंधित कीस्पेस का उपयोग किया जाएगा।
* क्वेरी: (वैकल्पिक) डेटा लोड करने के लिए उपयोग की जाने वाली क्वेरी।
* पृष्ठ_सामग्री_मैपर: (वैकल्पिक) एक पंक्ति को स्ट्रिंग पृष्ठ सामग्री में रूपांतरित करने वाली फ़ंक्शन। डिफ़ॉल्ट पंक्ति को JSON में रूपांतरित करता है।
* मेटाडेटा_मैपर: (वैकल्पिक) एक पंक्ति को मेटाडेटा डिक्शनरी में रूपांतरित करने वाली फ़ंक्शन।
* क्वेरी_पैरामीटर: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किए जाने वाले क्वेरी पैरामीटर।
* क्वेरी_टाइमआउट: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किया जाने वाला क्वेरी टाइमआउट।
* क्वेरी_कस्टम_पेलोड: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किया जाने वाला क्वेरी कस्टम_पेलोड।
* क्वेरी_निष्पादन_प्रोफ़ाइल: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किया जाने वाला क्वेरी निष्पादन_प्रोफ़ाइल।
* क्वेरी_होस्ट: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किया जाने वाला क्वेरी होस्ट।
* क्वेरी_निष्पादन_के_रूप_में: (वैकल्पिक) `session.execute` कॉल करते समय उपयोग किया जाने वाला क्वेरी निष्पादन_के_रूप_में।

## दस्तावेज़ लोडर के साथ दस्तावेज़ लोड करें

```python
from langchain_community.document_loaders import CassandraLoader
```

### कैसेंड्रा ड्राइवर सत्र से प्रारंभ करें

आपको एक `cassandra.cluster.Session` ऑब्जेक्ट बनाना होगा, जैसा कि [कैसेंड्रा ड्राइवर दस्तावेज़ीकरण](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster) में वर्णित है। विवरण भिन्न हो सकते हैं (उदाहरण के लिए नेटवर्क सेटिंग्स और प्रमाणीकरण के साथ), लेकिन यह कुछ इस तरह हो सकता है:

```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

आपको कैसेंड्रा इंस्टेंस के किसी मौजूदा कीस्पेस का नाम प्रदान करना होगा:

```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

दस्तावेज़ लोडर बनाना:

```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```

### कैसियो से प्रारंभ करें

सत्र और कीस्पेस को कॉन्फ़िगर करने के लिए कैसियो का उपयोग करना भी संभव है।

```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### एट्रिब्यूशन बयान

> Apache Cassandra, Cassandra और Apache या तो [Apache Software Foundation](http://www.apache.org/) में पंजीकृत ट्रेडमार्क या अमेरिका और/या अन्य देशों में ट्रेडमार्क हैं।
