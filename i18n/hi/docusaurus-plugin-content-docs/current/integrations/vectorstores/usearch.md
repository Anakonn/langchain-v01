---
translated: true
---

# USearch

>[USearch](https://unum-cloud.github.io/usearch/) एक छोटा और तेज़ एकल-फ़ाइल वेक्टर सर्च इंजन है

>USearch का आधारभूत कार्यक्षमता FAISS के समान है, और यदि आप कभी भी लगभग निकटतम पड़ोसी खोज का अनुसंधान किया है तो इंटरफ़ेस परिचित लगेगा। FAISS उच्च-प्रदर्शन वेक्टर खोज इंजनों के लिए एक व्यापक रूप से मान्यता प्राप्त मानक है। USearch और FAISS दोनों ही HNSW एल्गोरिदम का उपयोग करते हैं, लेकिन उनकी डिज़ाइन सिद्धांतों में महत्वपूर्ण अंतर हैं। USearch कॉम्पैक्ट और व्यापक रूप से संगत है, बिना प्रदर्शन को कम किए, और इसका प्राथमिक ध्यान उपयोगकर्ता-परिभाषित मीट्रिक्स और कम निर्भरताओं पर है।

```python
%pip install --upgrade --quiet  usearch
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import USearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = USearch.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## स्कोर के साथ समानता खोज

`similarity_search_with_score` विधि आपको न केवल दस्तावेज़ों को वापस करने की अनुमति देती है, बल्कि क्वेरी से उनकी दूरी स्कोर को भी। वापस दिया गया दूरी स्कोर L2 दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../extras/modules/state_of_the_union.txt'}),
 0.1845687)
```
