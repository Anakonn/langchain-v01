---
translated: true
---

# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb) [SemaFind](https://www.semafind.com) से है, यह AI अनुप्रयोगों को बनाने के लिए एक बिना किसी परेशानी वाला वेक्टर समानता डेटाबेस है। होस्ट किया गया `SemaDB Cloud` डेवलपर अनुभव को शुरू करने के लिए बिना किसी परेशानी का प्रदान करता है।

API का पूरा दस्तावेज़ीकरण, उदाहरणों और एक इंटरैक्टिव खेल मैदान [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb) पर उपलब्ध है।

यह नोटबुक `SemaDB Cloud` वेक्टर स्टोर का उपयोग दिखाता है।

## दस्तावेज़ एम्बेडिंग लोड करें

स्थानीय रूप से चीजों को चलाने के लिए, हम [Sentence Transformers](https://www.sbert.net/) का उपयोग कर रहे हैं जो आमतौर पर वाक्य एम्बेडिंग के लिए उपयोग किए जाते हैं। आप LangChain द्वारा प्रदान किसी भी एम्बेडिंग मॉडल का उपयोग कर सकते हैं।

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```

```output
114
```

## SemaDB से कनेक्ट करें

SemaDB Cloud [RapidAPI कुंजियों](https://rapidapi.com/semafind-semadb/api/semadb) का उपयोग प्रमाणीकरण करने के लिए करता है। आप एक मुफ्त RapidAPI खाता बनाकर अपनी कुंजी प्राप्त कर सकते हैं।

```python
import getpass
import os

os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```

```output
SemaDB API Key: ········
```

```python
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

SemaDB वेक्टर स्टोर के पैरामीटर सीधे API को प्रतिबिंबित करते हैं:

- "mycollection": वह संग्रह नाम है जिसमें हम इन वेक्टरों को संग्रहित करेंगे।
- 768: वेक्टरों का आयाम है। हमारे मामले में, वाक्य रूपांतरण एम्बेडिंग 768 आयामी वेक्टर उत्पन्न करते हैं।
- API_KEY: आपका RapidAPI कुंजी है।
- embeddings: दस्तावेज़, पाठ और क्वेरी के एम्बेडिंग कैसे उत्पन्न किए जाएंगे, इसके लिए है।
- DistanceStrategy: उपयोग किया जाने वाला दूरी मीट्रिक है। रैपर स्वचालित रूप से वेक्टरों को सामान्यीकृत करता है यदि COSINE का उपयोग किया जाता है।

```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```

```output
True
```

SemaDB वेक्टर स्टोर रैपर दस्तावेज़ पाठ को बिंदु मेटाडेटा के रूप में जोड़ता है ताकि बाद में इसे एकत्र किया जा सके। बड़े खंडों के पाठ को संग्रहित करना *अनुशंसित नहीं है*। यदि आप एक बड़ी संग्रह का सूचीकरण कर रहे हैं, तो हम बजाय दस्तावेज़ों के संदर्भों को संग्रहित करने की सलाह देते हैं जैसे बाहरी Id।

```python
db.add_documents(docs)[:2]
```

```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```

## समानता खोज

हम सबसे समान वाक्यों को खोजने के लिए डिफ़ॉल्ट LangChain समानता खोज इंटरफ़ेस का उपयोग करते हैं।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```

## सफ़ाई करें

आप सभी डेटा को हटाने के लिए संग्रह को हटा सकते हैं।

```python
db.delete_collection()
```

```output
True
```
