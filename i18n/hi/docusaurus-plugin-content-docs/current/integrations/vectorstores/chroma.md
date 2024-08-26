---
translated: true
---

# क्रोमा

>[क्रोमा](https://docs.trychroma.com/getting-started) एक AI-नेटिव ओपन-सोर्स वेक्टर डेटाबेस है जो डेवलपर उत्पादकता और खुशी पर केंद्रित है। क्रोमा Apache 2.0 लाइसेंस के तहत लाइसेंस प्राप्त है।

क्रोमा को निम्न के साथ स्थापित करें:

```sh
pip install langchain-chroma
```

क्रोमा विभिन्न मोड में चलता है। LangChain के साथ एकीकृत प्रत्येक के उदाहरण के लिए नीचे देखें।
- `in-memory` - एक पायथन स्क्रिप्ट या jupyter notebook में
- `in-memory with persistance` - एक स्क्रिप्ट या नोटबुक में और डिस्क पर सहेजें/लोड करें
- `in a docker container` - अपने स्थानीय मशीन या क्लाउड में एक सर्वर के रूप में चलता है

किसी भी अन्य डेटाबेस की तरह, आप:
- `.add`
- `.get`
- `.update`
- `.upsert`
- `.delete`
- `.peek`
- और `.query` समानता खोज चलाता है।

पूर्ण दस्तावेज़ [docs](https://docs.trychroma.com/reference/Collection) पर देखें। इन विधियों तक सीधे पहुंचने के लिए, आप `._collection.method()` कर सकते हैं।

## मूलभूत उदाहरण

इस मूलभूत उदाहरण में, हम राज्य के सबसे हालिया संघ संदेश को लेते हैं, इसे टुकड़ों में विभाजित करते हैं, एक ओपन-सोर्स एम्बेडिंग मॉडल का उपयोग करके इसे एम्बेड करते हैं, इसे क्रोमा में लोड करते हैं, और फिर इसकी जांच करते हैं।

```python
# import
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# load it into Chroma
db = Chroma.from_documents(docs, embedding_function)

# query it
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# print results
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## मूलभूत उदाहरण (डिस्क पर सहेजने सहित)

पिछले उदाहरण का विस्तार करते हुए, अगर आप डिस्क पर सहेजना चाहते हैं, तो बस क्रोमा क्लाइंट को प्रारंभ करें और उस निर्देशिका को पास करें जहां आप डेटा को सहेजना चाहते हैं।

`चेतावनी`: क्रोमा डेटा को स्वचालित रूप से डिस्क पर सहेजने का सर्वश्रेष्ठ प्रयास करता है, लेकिन एक से अधिक मेमोरी क्लाइंट एक-दूसरे के कार्य को रोक सकते हैं। सर्वश्रेष्ठ प्रथा के रूप में, किसी भी दिए गए समय पर केवल एक ही क्लाइंट प्रति पथ चल रहा हो।

```python
# save to disk
db2 = Chroma.from_documents(docs, embedding_function, persist_directory="./chroma_db")
docs = db2.similarity_search(query)

# load from disk
db3 = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)
docs = db3.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## LangChain में क्रोमा क्लाइंट पारित करना

आप एक क्रोमा क्लाइंट भी बना सकते हैं और उसे LangChain को पारित कर सकते हैं। यह विशेष रूप से उपयोगी है अगर आप अंतर्निहित डेटाबेस तक आसान पहुंच चाहते हैं।

आप वह संग्रह नाम भी निर्दिष्ट कर सकते हैं जिसका उपयोग LangChain करना चाहता है।

```python
import chromadb

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection("collection_name")
collection.add(ids=["1", "2", "3"], documents=["a", "b", "c"])

langchain_chroma = Chroma(
    client=persistent_client,
    collection_name="collection_name",
    embedding_function=embedding_function,
)

print("There are", langchain_chroma._collection.count(), "in the collection")
```

```output
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Insert of existing embedding ID: 1
Add of existing embedding ID: 2
Insert of existing embedding ID: 2
Add of existing embedding ID: 3
Insert of existing embedding ID: 3

There are 3 in the collection
```

## मूलभूत उदाहरण (Docker कंटेनर का उपयोग करके)

आप क्रोमा सर्वर को एक अलग Docker कंटेनर में भी चला सकते हैं, उससे कनेक्ट करने के लिए एक क्लाइंट बना सकते हैं, और फिर उसे LangChain को पारित कर सकते हैं।

क्रोमा में कई `संग्रह` दस्तावेजों को संभालने की क्षमता है, लेकिन LangChain इंटरफ़ेस एक ही अपेक्षा करता है, इसलिए हमें संग्रह नाम निर्दिष्ट करना होगा। LangChain द्वारा उपयोग किया जाने वाला डिफ़ॉल्ट संग्रह नाम "langchain" है।

यहां Docker छवि क्लोन, निर्माण और चलाने का तरीका है:

```sh
git clone git@github.com:chroma-core/chroma.git
```

`docker-compose.yml` फ़ाइल संपादित करें और `environment` के तहत `ALLOW_RESET=TRUE` जोड़ें।

```yaml
    ...
    command: uvicorn chromadb.app:app --reload --workers 1 --host 0.0.0.0 --port 8000 --log-config log_config.yml
    environment:
      - IS_PERSISTENT=TRUE
      - ALLOW_RESET=TRUE
    ports:
      - 8000:8000
    ...
```

फिर `docker-compose up -d --build` चलाएं।

```python
# create the chroma client
import uuid

import chromadb
from chromadb.config import Settings

client = chromadb.HttpClient(settings=Settings(allow_reset=True))
client.reset()  # resets the database
collection = client.create_collection("my_collection")
for doc in docs:
    collection.add(
        ids=[str(uuid.uuid1())], metadatas=doc.metadata, documents=doc.page_content
    )

# tell LangChain to use our client and collection name
db4 = Chroma(
    client=client,
    collection_name="my_collection",
    embedding_function=embedding_function,
)
query = "What did the president say about Ketanji Brown Jackson"
docs = db4.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## अपडेट और हटाना

एक वास्तविक अनुप्रयोग की ओर बढ़ते हुए, आप डेटा जोड़ने से परे जाना चाहते हैं, और डेटा को अपडेट और हटाना भी चाहते हैं।

क्रोमा उपयोगकर्ताओं को `ids` प्रदान करने के लिए कहता है ताकि यहां बुककीपिंग को सरल बनाया जा सके। `ids` फ़ाइल का नाम हो सकता है, या एक संयुक्त हैश जैसे `filename_paragraphNumber`, आदि।

क्रोमा इन सभी ऑपरेशनों का समर्थन करता है - हालांकि कुछ को अभी भी LangChain इंटरफ़ेस के माध्यम से एकीकृत किया जा रहा है। जल्द ही अतिरिक्त कार्यप्रवाह सुधार जोड़े जाएंगे।

विभिन्न ऑपरेशन करने का एक मूलभूत उदाहरण यहां दिया गया है:

```python
# create simple ids
ids = [str(i) for i in range(1, len(docs) + 1)]

# add data
example_db = Chroma.from_documents(docs, embedding_function, ids=ids)
docs = example_db.similarity_search(query)
print(docs[0].metadata)

# update the metadata for a document
docs[0].metadata = {
    "source": "../../modules/state_of_the_union.txt",
    "new_value": "hello world",
}
example_db.update_document(ids[0], docs[0])
print(example_db._collection.get(ids=[ids[0]]))

# delete the last document
print("count before", example_db._collection.count())
example_db._collection.delete(ids=[ids[-1]])
print("count after", example_db._collection.count())
```

```output
{'source': '../../../state_of_the_union.txt'}
{'ids': ['1'], 'embeddings': None, 'metadatas': [{'new_value': 'hello world', 'source': '../../../state_of_the_union.txt'}], 'documents': ['Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.']}
count before 46
count after 45
```

## OpenAI एम्बेडिंग का उपयोग करें

कई लोग OpenAIEmbeddings का उपयोग करना पसंद करते हैं, यह सेट करने का तरीका यहां दिया गया है।

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

from langchain_openai import OpenAIEmbeddings

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
embeddings = OpenAIEmbeddings()
new_client = chromadb.EphemeralClient()
openai_lc_client = Chroma.from_documents(
    docs, embeddings, client=new_client, collection_name="openai_collection"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = openai_lc_client.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

***

## अन्य जानकारी

### स्कोर के साथ समानता खोज

लौटाया गया दूरी स्कोर कोसाइन दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 1.1972057819366455)
```

### रिट्रीवर विकल्प

यह खंड क्रोमा को रिट्रीवर के रूप में कैसे उपयोग करने के विभिन्न विकल्पों पर चर्चा करता है।

#### MMR

समानता खोज का उपयोग करने के अलावा रिट्रीवर ऑब्जेक्ट में, आप `mmr` का भी उपयोग कर सकते हैं।

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

### मेटाडेटा पर फ़िल्टरिंग

संग्रह के साथ काम करने से पहले उसे संकुचित करना मददगार हो सकता है।

उदाहरण के लिए, मेटाडेटा का उपयोग करके संग्रह को फ़िल्टर किया जा सकता है।

```python
# filter collection for updated source
example_db.get(where={"source": "some_other_source"})
```

```output
{'ids': [], 'embeddings': None, 'metadatas': [], 'documents': []}
```
