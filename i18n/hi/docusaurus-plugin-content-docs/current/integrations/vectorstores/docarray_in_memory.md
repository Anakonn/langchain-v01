---
translated: true
---

# DocArray InMemorySearch

>[DocArrayInMemorySearch](https://docs.docarray.org/user_guide/storing/index_in_memory/) एक दस्तावेज़ सूचकांक है जो [Docarray](https://github.com/docarray/docarray) द्वारा प्रदान किया जाता है और दस्तावेज़ों को मेमोरी में संग्रहीत करता है। यह छोटे डेटासेट के लिए एक शानदार शुरुआती बिंदु है, जहां आप एक डेटाबेस सर्वर लॉन्च करना नहीं चाहते हैं।

यह नोटबुक `DocArrayInMemorySearch` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## सेटअप

नीचे दिए गए कोशिकाओं को अनकमेंट करें ताकि आप docarray को इंस्टॉल कर सकें और अपना OpenAI api कुंजी प्राप्त/सेट कर सकें यदि आपने ऐसा पहले नहीं किया है।

```python
%pip install --upgrade --quiet  "docarray"
```

```python
# Get an OpenAI token: https://platform.openai.com/account/api-keys

# import os
# from getpass import getpass

# OPENAI_API_KEY = getpass()

# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## DocArrayInMemorySearch का उपयोग करना

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import DocArrayInMemorySearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = DocArrayInMemorySearch.from_documents(docs, embeddings)
```

### समानता खोज

```python
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

### स्कोर के साथ समानता खोज

वापस दिया गया दूरी स्कोर कोसाइन दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={}),
 0.8154190158347903)
```
