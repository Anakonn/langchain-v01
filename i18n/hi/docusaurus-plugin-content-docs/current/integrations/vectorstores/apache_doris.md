---
translated: true
---

# Apache Doris

>[Apache Doris](https://doris.apache.org/) एक वास्तविक समय के विश्लेषण के लिए एक आधुनिक डेटा वेयरहाउस है।
यह बड़े पैमाने पर वास्तविक समय के डेटा पर चमकदार तेज़ विश्लेषण प्रदान करता है।

>आमतौर पर `Apache Doris` को OLAP में वर्गीकृत किया जाता है, और इसने [ClickBench — एक विश्लेषणात्मक DBMS के लिए बेंचमार्क](https://benchmark.clickhouse.com/) में उत्कृष्ट प्रदर्शन किया है। चूंकि इसमें एक सुपर-तेज़ वेक्टरीकृत कार्यान्वयन इंजन है, इसका उपयोग एक तेज़ वेक्टरडीबी के रूप में भी किया जा सकता है।

यहां हम Apache Doris Vector Store का उपयोग करने का प्रदर्शन करेंगे।

## सेटअप

```python
%pip install --upgrade --quiet  pymysql
```

शुरू में `update_vectordb = False` सेट करें। यदि कोई नए दस्तावेज़ अपडेट नहीं हुए हैं, तो हमें दस्तावेज़ों के एम्बेडिंग को फिर से बनाने की आवश्यकता नहीं है।

```python
!pip install  sqlalchemy
!pip install langchain
```

```python
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores.apache_doris import (
    ApacheDoris,
    ApacheDorisSettings,
)
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

## दस्तावेज़ लोड करें और उन्हें टोकन में विभाजित करें

`docs` निर्देशिका के तहत सभी मार्कडाउन फ़ाइलों को लोड करें

Apache Doris दस्तावेज़ों के लिए, आप https://github.com/apache/doris से रेपो क्लोन कर सकते हैं, और इसमें `docs` निर्देशिका है।

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

दस्तावेज़ों को टोकन में विभाजित करें, और `update_vectordb = True` सेट करें क्योंकि नए दस्तावेज़/टोकन हैं।

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))

## वेक्टरडीबी इंस्टेंस बनाएं

### Apache Doris का उपयोग वेक्टरडीबी के रूप में करें

```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## टोकन को एम्बेडिंग में रूपांतरित करें और उन्हें वेक्टरडीबी में रखें

यहां हम Apache Doris को वेक्टरडीबी के रूप में उपयोग करते हैं, आप `ApacheDorisSettings` के माध्यम से Apache Doris इंस्टेंस को कॉन्फ़िगर कर सकते हैं।

Apache Doris इंस्टेंस को कॉन्फ़िगर करना mysql इंस्टेंस को कॉन्फ़िगर करने जैसा है। आपको निम्नलिखित को निर्दिष्ट करने की आवश्यकता है:
1. होस्ट/पोर्ट
2. उपयोगकर्ता नाम (डिफ़ॉल्ट: 'root')
3. पासवर्ड (डिफ़ॉल्ट: '')
4. डेटाबेस (डिफ़ॉल्ट: 'default')
5. तालिका (डिफ़ॉल्ट: 'langchain')

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```python
update_vectordb = True

embeddings = OpenAIEmbeddings()

# configure Apache Doris settings(host/port/user/pw/db)
settings = ApacheDorisSettings()
settings.port = 9030
settings.host = "172.30.34.130"
settings.username = "root"
settings.password = ""
settings.database = "langchain"
docsearch = gen_apache_doris(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

## QA बनाएं और उससे सवाल पूछें

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```
