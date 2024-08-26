---
translated: true
---

यह एक खुले स्रोत की कुंजी-मूल्य डेटा ग्रिड है, यह एक नोड के रूप में भी काम कर सकता है और वितरित रूप में भी।

15.x रिलीज से वेक्टर खोज का समर्थन किया जाता है।
अधिक जानकारी के लिए: [Infinispan Home](https://infinispan.org)

```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# सेटअप

इस डेमो को चलाने के लिए हमें प्रमाणीकरण के बिना एक चल रहा Infinispan इंस्टेंस और एक डेटा फ़ाइल की आवश्यकता है।
अगले तीन सेल में हम करने जा रहे हैं:
- डेटा फ़ाइल डाउनलोड करना
- कॉन्फ़िगरेशन बनाना
- Docker में Infinispan चलाना

```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```

```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container:
    name: default
    transport:
      cluster: cluster
      stack: tcp
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0
    socket-bindings:
      default-interface: public
      port-offset: 0
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```

```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# कोड

## एक एम्बेडिंग मॉडल चुनें

इस डेमो में हम एक HuggingFace एम्बेडिंग मॉडल का उपयोग कर रहे हैं।

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## Infinispan कैश सेट अप करें

Infinispan एक बहुत लचीला कुंजी-मूल्य स्टोर है, यह कच्चे बिट्स के साथ-साथ जटिल डेटा प्रकार को भी स्टोर कर सकता है।
उपयोगकर्ता को डेटा ग्रिड कॉन्फ़िगरेशन में पूर्ण स्वतंत्रता है, लेकिन सरल डेटा प्रकार के लिए सब कुछ स्वचालित रूप से पायथन परत द्वारा कॉन्फ़िगर किया जाता है। हम इस सुविधा का लाभ उठाते हैं ताकि हम अपने एप्लिकेशन पर ध्यान केंद्रित कर सकें।

## डेटा तैयार करें

इस डेमो में हम डिफ़ॉल्ट कॉन्फ़िगरेशन का लाभ उठाते हैं, इसलिए पाठ, मेटाडेटा और वेक्टर एक ही कैश में हैं, लेकिन अन्य विकल्प भी संभव हैं: यानी सामग्री किसी और जगह स्टोर की जा सकती है और वेक्टर स्टोर में केवल वास्तविक सामग्री का संदर्भ हो सकता है।

```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# वेक्टर स्टोर को भरें

```python
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# परिणाम दस्तावेजों को प्रिंट करने के लिए एक सहायक फ़ंक्शन

डिफ़ॉल्ट रूप से InfinispanVS `Document.page_content` में `ŧext` फ़ील्ड और `metadata` में शेष प्रोटोबफ़ फ़ील्ड (वेक्टर को छोड़कर) लौटाता है। यह व्यवहार सेटअप पर लैम्बडा फ़ंक्शन के माध्यम से कॉन्फ़िगर किया जा सकता है।

```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# इसे आज़माएं!!!

नीचे कुछ नमूना क्वेरी

```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```

```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```

```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```

```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```

```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```

```python
!docker rm --force infinispanvs-demo
```
