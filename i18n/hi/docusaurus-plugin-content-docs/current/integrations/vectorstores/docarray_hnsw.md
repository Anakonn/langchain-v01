---
translated: true
---

# DocArray HnswSearch

>[DocArrayHnswSearch](https://docs.docarray.org/user_guide/storing/index_hnswlib/) एक हल्का दस्तावेज़ सूचकांक कार्यान्वयन है जो [Docarray](https://github.com/docarray/docarray) द्वारा प्रदान किया जाता है और पूरी तरह से स्थानीय रूप से चलता है और छोटे से मध्यम आकार के डेटासेट के लिए सबसे उपयुक्त है। यह [hnswlib](https://github.com/nmslib/hnswlib) में डिस्क पर वेक्टर को संग्रहीत करता है, और [SQLite](https://www.sqlite.org/index.html) में अन्य सभी डेटा को संग्रहीत करता है।

यह नोटबुक `DocArrayHnswSearch` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## सेटअप

नीचे दिए गए कोशिकाओं को अनकमेंट करें ताकि docarray को स्थापित किया जा सके और आपका OpenAI api कुंजी प्राप्त/सेट की जा सके यदि आप पहले से ऐसा नहीं कर चुके हैं।

```python
%pip install --upgrade --quiet  "docarray[hnswlib]"
```

```python
# Get an OpenAI token: https://platform.openai.com/account/api-keys

# import os
# from getpass import getpass

# OPENAI_API_KEY = getpass()

# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## DocArrayHnswSearch का उपयोग करना

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import DocArrayHnswSearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = DocArrayHnswSearch.from_documents(
    docs, embeddings, work_dir="hnswlib_store/", n_dim=1536
)
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
 0.36962226)
```

```python
import shutil

# delete the dir
shutil.rmtree("hnswlib_store")
```
