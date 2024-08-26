---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/) एक एंड-टू-एंड क्लाउड-नेटिव डेटाबेस है जो आधुनिक एप्लिकेशन के लिए डिज़ाइन किया गया है, जिसमें वेब, मोबाइल, सर्वरलेस, Jamstack, बैकएंड और पारंपरिक एप्लिकेशन शामिल हैं। SurrealDB के साथ, आप अपने डेटाबेस और API इंफ़्रास्ट्रक्चर को सरल बना सकते हैं, विकास समय को कम कर सकते हैं, और सुरक्षित, प्रदर्शन वाले ऐप्स को जल्दी और लागत प्रभावी ढंग से बना सकते हैं।

>**SurrealDB की प्रमुख विशेषताएं हैं:**

>* **विकास समय को कम करता है:** SurrealDB आपके डेटाबेस और API स्टैक को सरल बनाता है क्योंकि यह अधिकांश सर्वर-साइड घटकों की आवश्यकता को समाप्त करता है, जिससे आप सुरक्षित, प्रदर्शन वाले ऐप्स को तेजी से और सस्ते में बना सकते हैं।
>* **रियल-टाइम सहयोगात्मक API बैकएंड सेवा:** SurrealDB एक डेटाबेस और एक API बैकएंड सेवा के रूप में कार्य करता है, जो रियल-टाइम सहयोग को सक्षम बनाता है।
>* **कई क्वेरी भाषाओं का समर्थन:** SurrealDB क्लाइंट डिवाइस से SQL क्वेरी, GraphQL, ACID लेनदेन, WebSocket कनेक्शन, संरचित और अव्यवस्थित डेटा, ग्राफ क्वेरी, पूर्ण-पाठ अनुक्रमण और भू-स्थानिक क्वेरी का समर्थन करता है।
>* **सूक्ष्म पहुंच नियंत्रण:** SurrealDB पंक्ति-स्तर की अनुमति-आधारित पहुंच नियंत्रण प्रदान करता है, जिससे आप डेटा पहुंच का प्रबंधन सटीकता से कर सकते हैं।

>[विशेषताएं](https://surrealdb.com/features), नवीनतम [रिलीज़](/html-tag/3] और [प्रलेखन](https://surrealdb.com/docs) देखें।

यह नोटबुक `SurrealDBStore` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## सेटअप

नीचे दिए गए कोशिकाओं को अनकमेंट करें ताकि surrealdb स्थापित किया जा सके।

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

## SurrealDBStore का उपयोग करना

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import SurrealDBStore
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings()
```

### एक SurrealDBStore ऑब्जेक्ट बनाना

```python
db = SurrealDBStore(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding_function=embeddings,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)

# this is needed to initialize the underlying async library for SurrealDB
await db.initialize()

# delete all existing documents from the vectorstore collection
await db.adelete()

# add documents to the vectorstore
ids = await db.aadd_documents(docs)

# document ids of the added documents
ids[:5]
```

```output
['documents:38hz49bv1p58f5lrvrdc',
 'documents:niayw63vzwm2vcbh6w2s',
 'documents:it1fa3ktplbuye43n0ch',
 'documents:il8f7vgbbp9tywmsn98c',
 'documents:vza4c6cqje0avqd58gal']
```

### (वैकल्पिक रूप से) एक SurrealDBStore ऑब्जेक्ट बनाएं और दस्तावेज़ जोड़ें

```python
await db.adelete()

db = await SurrealDBStore.afrom_documents(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding=embeddings,
    documents=docs,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)
```

### समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)
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
docs = await db.asimilarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'id': 'documents:slgdlhjkfknhqo15xz0w', 'source': '../../modules/state_of_the_union.txt'}),
 0.39839531721941895)
```
