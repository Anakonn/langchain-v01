---
translated: true
---

# फैस

>[फेसबुक एआई समानता खोज (फैस)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) एक पुस्तकालय है जो घनी वेक्टरों के कुशल समानता खोज और क्लस्टरिंग के लिए है। यह एल्गोरिदम शामिल करता है जो किसी भी आकार के वेक्टर सेट में खोजते हैं, यहां तक कि वे जो RAM में नहीं समा सकते। यह मूल्यांकन और पैरामीटर ट्यूनिंग के लिए सहायक कोड भी शामिल करता है।

[फैस दस्तावेज](https://faiss.ai/)।

यह नोटबुक `FAISS` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है। यह इस एकीकरण से संबंधित कार्यक्षमता दिखाएगा। इसके माध्यम से जाने के बाद, [प्रासंगिक उपयोग मामले पृष्ठों](/docs/use_cases/question_answering) का अन्वेषण करना उपयोगी हो सकता है ताकि आप इस वेक्टरस्टोर का उपयोग एक बड़ी श्रृंखला के हिस्से के रूप में सीख सकें।

## सेटअप

एकीकरण `langchain-community` पैकेज में रहता है। हमें `faiss` पैकेज स्वयं भी स्थापित करने की आवश्यकता है। हम ओपनएआई का भी उपयोग करेंगे एम्बेडिंग के लिए, इसलिए हमें इन आवश्यकताओं को स्थापित करने की आवश्यकता है। हम इन्हें निम्नलिखित के साथ स्थापित कर सकते हैं:

```bash
pip install -U langchain-community faiss-cpu langchain-openai tiktoken
```

ध्यान दें कि आप `faiss-gpu` भी स्थापित कर सकते हैं यदि आप जीपीयू सक्षम संस्करण का उपयोग करना चाहते हैं

चूंकि हम ओपनएआई का उपयोग कर रहे हैं, आपको एक ओपनएआई एपीआई कुंजी की आवश्यकता होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

[LangSmith](https://smith.langchain.com/) को सेट अप करना भी उपयोगी (लेकिन आवश्यक नहीं) है जो उत्कृष्ट अवलोकनीयता प्रदान करता है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## अंतःक्षेपण

यहां, हम दस्तावेजों को वेक्टरस्टोर में अंतःक्षेपित करते हैं।

```python
# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
print(db.index.ntotal)
```

```output
42
```

## क्वेरी करना

अब, हम वेक्टरस्टोर को क्वेरी कर सकते हैं। ऐसा करने के कुछ तरीके हैं। सबसे मानक तरीका `similarity_search` का उपयोग करना है।

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

## एक पुनर्प्राप्तकर्ता के रूप में

हम वेक्टरस्टोर को [पुनर्प्राप्तकर्ता](/docs/modules/data_connection/retrievers) वर्ग में भी परिवर्तित कर सकते हैं। यह हमें इसका उपयोग अन्य LangChain विधियों में आसानी से करने में सक्षम बनाता है, जो लगभग पुनर्प्राप्तकर्ताओं के साथ काम करते हैं।

```python
retriever = db.as_retriever()
docs = retriever.invoke(query)
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

कुछ FAISS विशिष्ट विधियां हैं। उनमें से एक है `similarity_search_with_score`, जो आपको न केवल दस्तावेज लौटाने की अनुमति देता है, बल्कि क्वेरी से उनकी दूरी स्कोर भी। लौटाया गया दूरी स्कोर L2 दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.36913747)
```

किसी दिए गए एम्बेडिंग वेक्टर के समान दस्तावेजों की खोज करना भी संभव है `similarity_search_by_vector` का उपयोग करके, जो एक स्ट्रिंग के बजाय एक एम्बेडिंग वेक्टर को पैरामीटर के रूप में स्वीकार करता है।

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = db.similarity_search_by_vector(embedding_vector)
```

## सहेजना और लोड करना

आप एक FAISS इंडेक्स को भी सहेज और लोड कर सकते हैं। यह उपयोगी है ताकि आपको इसका पुनर्निर्माण नहीं करना पड़े हर बार जब आप इसका उपयोग करते हैं।

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings)

docs = new_db.similarity_search(query)
```

```python
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

# बाइट्स में सिलिंग और डी-सिलिंग

आप इन कार्यों द्वारा FAISS इंडेक्स को पिकल कर सकते हैं। यदि आप एम्बेडिंग मॉडल का उपयोग करते हैं जो 90 एमबी (sentence-transformers/all-MiniLM-L6-v2 या कोई अन्य मॉडल) का है, तो परिणामी पिकल आकार 90 एमबी से अधिक होगा। मॉडल का आकार भी कुल आकार में शामिल है। इस समस्या से निपटने के लिए, नीचे दिए गए कार्यों का उपयोग करें। ये कार्य केवल FAISS इंडेक्स को सिलिंग करते हैं और आकार काफी कम होगा। यह तब उपयोगी हो सकता है जब आप इंडेक्स को SQL जैसे डेटाबेस में संग्रहित करना चाहते हैं।

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl
)  # Load the index
```

## विलय

आप दो FAISS वेक्टरस्टोर को भी विलय कर सकते हैं।

```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```

```python
db2.docstore._dict
```

```output
{'807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'068c473b-d420-487a-806b-fb0ccea7f711': Document(page_content='foo', metadata={}),
 '807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

## फ़िल्टरिंग के साथ समानता खोज

FAISS वेक्टरस्टोर फ़िल्टरिंग का भी समर्थन कर सकता है, क्योंकि FAISS में फ़िल्टरिंग का नैतिक समर्थन नहीं है, हमें इसे मैनुअल रूप से करना होगा। यह `k` से अधिक परिणाम पहले प्राप्त करके और फिर उन्हें फ़िल्टर करके किया जाता है। यह फ़िल्टर या तो एक कॉलेबल है जो इनपुट के रूप में एक मेटाडेटा डिक्शनरी लेता है और एक बूलियन मान लौटाता है, या एक मेटाडेटा डिक्शनरी है जहां प्रत्येक गुमशुदा कुंजी को अनदेखा किया जाता है और प्रत्येक मौजूदा k को मूल्यों की एक सूची में होना चाहिए। आप `fetch_k` पैरामीटर को भी सेट कर सकते हैं जब भी कोई खोज विधि कॉल करते हैं ताकि आप कितने दस्तावेज़ प्राप्त करना चाहते हैं फ़िल्टर करने से पहले। यहां एक छोटा उदाहरण है:

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

अब हम वही क्वेरी कॉल करते हैं लेकिन हम केवल `page = 1` के लिए फ़िल्टर करते हैं।

```python
results_with_scores = db.similarity_search_with_score("foo", filter=dict(page=1))
# Or with a callable:
# results_with_scores = db.similarity_search_with_score("foo", filter=lambda d: d["page"] == 1)
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

यही बात `max_marginal_relevance_search` के साथ भी की जा सकती है।

```python
results = db.max_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

यहां `similarity_search` कॉल करते समय `fetch_k` पैरामीटर को कैसे सेट करने का एक उदाहरण है। आमतौर पर आप चाहेंगे कि `fetch_k` पैरामीटर >> `k` पैरामीटर हो। यह इसलिए है क्योंकि `fetch_k` पैरामीटर वह संख्या है जिसके बराबर दस्तावेज़ फ़िल्टर करने से पहले प्राप्त किए जाएंगे। यदि आप `fetch_k` को एक कम संख्या पर सेट करते हैं, तो आप शायद फ़िल्टर करने के लिए पर्याप्त दस्तावेज़ प्राप्त नहीं कर पाएंगे।

```python
results = db.similarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## हटाना

आप वेक्टरस्टोर से रिकॉर्ड भी हटा सकते हैं। नीचे दिए गए उदाहरण में `db.index_to_docstore_id` FAISS इंडेक्स के तत्वों को प्रतिनिधित्व करता है।

```python
print("count before:", db.index.ntotal)
db.delete([db.index_to_docstore_id[0]])
print("count after:", db.index.ntotal)
```

```output
count before: 8
count after: 7
```
