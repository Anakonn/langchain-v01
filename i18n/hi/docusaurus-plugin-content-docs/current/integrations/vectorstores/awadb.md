---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) एक एआई नेटिव डेटाबेस है जो एलएलएम एप्लिकेशन द्वारा उपयोग किए जाने वाले एम्बेडिंग वेक्टर की खोज और संग्रहण के लिए है।

यह नोटबुक `AwaDB` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

```python
%pip install --upgrade --quiet  awadb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AwaDB
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
db = AwaDB.from_documents(docs)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## समानता खोज स्कोर के साथ

वापस दिया गया दूरी स्कोर 0-1 के बीच होता है। 0 असमान है, 1 सबसे अधिक समान है।

```python
docs = db.similarity_search_with_score(query)
```

```python
print(docs[0])
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), 0.561813814013747)
```

## पहले बनाए गए और डेटा जोड़े गए टेबल को पुनर्स्थापित करें

AwaDB स्वचालित रूप से जोड़े गए दस्तावेज़ डेटा को स्थायी रूप से संग्रहीत करता है।

यदि आप पहले बनाए गए और जोड़े गए टेबल को पुनर्स्थापित कर सकते हैं, तो आप इसे निम्नानुसार कर सकते हैं:

```python
import awadb

awadb_client = awadb.Client()
ret = awadb_client.Load("langchain_awadb")
if ret:
    print("awadb load table success")
else:
    print("awadb load table failed")
```

awadb load table success
