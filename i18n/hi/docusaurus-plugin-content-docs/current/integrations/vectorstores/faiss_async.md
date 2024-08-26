---
translated: true
---

# Faiss (Async)

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) एक पुस्तकालय है जो घनीभूत वेक्टरों के कुशल समानता खोज और क्लस्टरिंग के लिए है। यह उन सेटों के वेक्टरों में खोज करने के लिए एल्गोरिदम शामिल करता है जिनका आकार किसी भी हो सकता है, यहां तक कि वे जो RAM में नहीं समा सकते। यह मूल्यांकन और पैरामीटर ट्यूनिंग के लिए सहायक कोड भी शामिल करता है।

[Faiss दस्तावेज़](https://faiss.ai/)।

यह नोटबुक `FAISS` वेक्टर डेटाबेस का उपयोग करके कार्यक्षमता का उपयोग करने का तरीका दिखाता है `asyncio` का उपयोग करके।
LangChain ने सिंक्रोनस और असिंक्रोनस वेक्टर स्टोर कार्यों को लागू किया है।

`सिंक्रोनस` संस्करण [यहां](/docs/integrations/vectorstores/faiss) देखें।

```python
%pip install --upgrade --quiet  faiss-gpu # For CUDA 7.5+ Supported GPU's.
# OR
%pip install --upgrade --quiet  faiss-cpu # For CPU Installation
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = await FAISS.afrom_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)

print(docs[0].page_content)
```

## स्कोर के साथ समानता खोज

कुछ FAISS विशिष्ट विधियां हैं। उनमें से एक है `similarity_search_with_score`, जो आपको न केवल दस्तावेजों को लौटाने की अनुमति देती है, बल्कि क्वेरी से उनकी दूरी स्कोर को भी। लौटाया गया दूरी स्कोर L2 दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
docs_and_scores = await db.asimilarity_search_with_score(query)

docs_and_scores[0]
```

एक दिए गए एम्बेडिंग वेक्टर के समान दस्तावेजों की खोज करना भी संभव है `similarity_search_by_vector` का उपयोग करके, जो एक एम्बेडिंग वेक्टर को पैरामीटर के रूप में स्वीकार करता है बजाय एक स्ट्रिंग के।

```python
embedding_vector = await embeddings.aembed_query(query)
docs_and_scores = await db.asimilarity_search_by_vector(embedding_vector)
```

## सहेजना और लोड करना

आप एक FAISS इंडेक्स को भी सहेज और लोड कर सकते हैं। यह उपयोगी है ताकि आपको इसका पुनर्निर्माण नहीं करना पड़े हर बार जब आप इसका उपयोग करते हैं।

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings, asynchronous=True)

docs = await new_db.asimilarity_search(query)

docs[0]
```

# बाइट्स में सिलिंडरीकरण और डी-सिलिंडरीकरण

आप इन कार्यों द्वारा FAISS इंडेक्स को पिकल कर सकते हैं। यदि आप एम्बेडिंग मॉडल का उपयोग करते हैं जो 90 एमबी का है (sentence-transformers/all-MiniLM-L6-v2 या कोई अन्य मॉडल), तो परिणामी पिकल आकार 90 एमबी से अधिक होगा। मॉडल का आकार समग्र आकार में भी शामिल है। इस समस्या से निपटने के लिए, नीचे दिए गए कार्यों का उपयोग करें। ये कार्य केवल FAISS इंडेक्स को सिलिंडरीकृत करते हैं और आकार काफी कम होगा। यह तब उपयोगी हो सकता है जब आप इंडेक्स को SQL जैसे डेटाबेस में संग्रहित करना चाहते हैं।

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl, asynchronous=True
)  # Load the index
```

## विलय

आप दो FAISS वेक्टरस्टोर को भी विलय कर सकते हैं

```python
db1 = await FAISS.afrom_texts(["foo"], embeddings)
db2 = await FAISS.afrom_texts(["bar"], embeddings)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo')}
```

```python
db2.docstore._dict
```

```output
{'4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo'),
 '4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

## फ़िल्टरिंग के साथ समानता खोज

FAISS वेक्टरस्टोर फ़िल्टरिंग का भी समर्थन कर सकता है, क्योंकि FAISS में फ़िल्टरिंग का नैटिव समर्थन नहीं है, हमें इसे मैनुअल रूप से करना होगा। यह `k` से अधिक परिणाम प्राप्त करके और फिर उन्हें फ़िल्टर करके किया जाता है। आप मेटाडेटा के आधार पर दस्तावेजों को फ़िल्टर कर सकते हैं। आप `fetch_k` पैरामीटर को भी सेट कर सकते हैं जब भी कोई खोज विधि कॉल करते हैं ताकि आप फ़िल्टर करने से पहले कितने दस्तावेज़ प्राप्त करना चाहते हैं। यहां एक छोटा उदाहरण है:

```python
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```

अब हम वही क्वेरी कॉल करते हैं लेकिन हम केवल `page = 1` के लिए फ़िल्टर करते हैं

```python
results_with_scores = await db.asimilarity_search_with_score("foo", filter=dict(page=1))
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

यही बात `max_marginal_relevance_search` के साथ भी की जा सकती है।

```python
results = await db.amax_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

यहां `similarity_search` कॉल करते समय `fetch_k` पैरामीटर को कैसे सेट करने का एक उदाहरण है। आमतौर पर आप चाहेंगे कि `fetch_k` पैरामीटर >> `k` पैरामीटर हो। यह इसलिए है क्योंकि `fetch_k` पैरामीटर वह संख्या है जितने दस्तावेज़ फ़िल्टर करने से पहले प्राप्त किए जाएंगे। यदि आप `fetch_k` को एक कम संख्या पर सेट करते हैं, तो आप शायद फ़िल्टर करने के लिए पर्याप्त दस्तावेज़ प्राप्त नहीं कर पाएंगे।

```python
results = await db.asimilarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## हटाना

आप आईडी को भी हटा सकते हैं। ध्यान रखें कि हटाने के लिए आईडी वे होने चाहिए जो docstore में हैं।

```python
db.delete([db.index_to_docstore_id[0]])
```

```output
True
```

```python
# Is now missing
0 in db.index_to_docstore_id
```

```output
False
```
