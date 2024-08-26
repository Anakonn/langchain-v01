---
translated: true
---

यह पृष्ठ [Apache Cassandra®](https://cassandra.apache.org/) का उपयोग करने के लिए एक त्वरित शुरुआत प्रदान करता है।

> [Cassandra](https://cassandra.apache.org/) एक NoSQL, पंक्ति-उन्मुख, अत्यधिक स्केलेबल और अत्यधिक उपलब्ध डेटाबेस है। 5.0 संस्करण से शुरू, डेटाबेस में [वेक्टर खोज क्षमताएं](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html) शामिल हैं।

_नोट: डेटाबेस तक पहुंच के अलावा, पूरे उदाहरण को चलाने के लिए एक OpenAI API कुंजी की आवश्यकता है।_

### सेटअप और सामान्य निर्भरताएं

एकीकरण का उपयोग करने के लिए निम्नलिखित Python पैकेज की आवश्यकता होती है।

```python
%pip install --upgrade --quiet "cassio>=0.1.4"
```

_नोट: आपके LangChain सेटअप पर निर्भर करते हुए, आप इस डेमो के लिए आवश्यक अन्य निर्भरताओं को स्थापित/अपग्रेड करने की आवश्यकता हो सकती है_
_(विशेष रूप से, `datasets`, `openai`, `pypdf` और `tiktoken` के हालिया संस्करणों की आवश्यकता होती है, साथ ही `langchain-community` भी)।_

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## वेक्टर स्टोर आयात करें

```python
from langchain_community.vectorstores import Cassandra
```

## कनेक्शन मापदंड

इस पृष्ठ में दिखाया गया वेक्टर स्टोर एकीकरण Cassandra के साथ-साथ अन्य व्युत्पन्न डेटाबेस, जैसे Astra DB, का उपयोग कर सकता है, जो CQL (Cassandra Query Language) प्रोटोकॉल का उपयोग करते हैं।

> DataStax [Astra DB](https://docs.datastax.com/en/astra-serverless/docs/vector-search/quickstart.html) Cassandra पर निर्मित एक प्रबंधित सर्वरलेस डेटाबेस है, जो समान इंटरफ़ेस और ताकत प्रदान करता है।

Cassandra क्लस्टर से कनेक्ट करने या CQL के माध्यम से Astra DB से कनेक्ट करने पर, आप वेक्टर स्टोर ऑब्जेक्ट बनाते समय अलग-अलग मापदंड प्रदान करेंगे।

### Cassandra क्लस्टर से कनेक्ट करना

आपको पहले एक `cassandra.cluster.Session` ऑब्जेक्ट बनाना होगा, जैसा कि [Cassandra ड्राइवर दस्तावेज़ीकरण](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster) में वर्णित है। विवरण भिन्न हो सकते हैं (उदाहरण के लिए, नेटवर्क सेटिंग्स और प्रमाणीकरण के साथ), लेकिन यह कुछ इस तरह हो सकता है:

```python
from cassandra.cluster import Cluster

cluster = Cluster(["127.0.0.1"])
session = cluster.connect()
```

आप अब सत्र को, साथ ही अपने इच्छित कीस्पेस नाम को, एक वैश्विक CassIO मापदंड के रूप में सेट कर सकते हैं:

```python
import cassio

CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")

cassio.init(session=session, keyspace=CASSANDRA_KEYSPACE)
```

अब आप वेक्टर स्टोर बना सकते हैं:

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

_नोट: आप अपने सत्र और कीस्पेस को वेक्टर स्टोर बनाते समय प्रत्यक्ष रूप से भी पारामीटर के रूप में पास कर सकते हैं। हालांकि, `cassio.init` सेटिंग का उपयोग करना तब आसान होता है जब आपका एप्लिकेशन Cassandra का उपयोग कई तरीकों से (उदाहरण के लिए, वेक्टर स्टोर, चैट मेमोरी और LLM प्रतिक्रिया कैशिंग के लिए) करता है, क्योंकि यह एक ही स्थान पर क्रेडेंशियल और डीबी कनेक्शन प्रबंधन को केंद्रीकृत करने की अनुमति देता है।_

### CQL के माध्यम से Astra DB से कनेक्ट करना

इस मामले में, आप निम्नलिखित कनेक्शन मापदंडों के साथ CassIO को प्रारंभ करते हैं:

- डेटाबेस आईडी, उदाहरण के लिए `01234567-89ab-cdef-0123-456789abcdef`
- टोकन, उदाहरण के लिए `AstraCS:6gBhNmsk135....` (इसे "डेटाबेस व्यवस्थापक" टोकन होना चाहिए)
- वैकल्पिक रूप से कीस्पेस नाम (यदि छोड़ दिया गया है, तो डेटाबेस के लिए डिफ़ॉल्ट एक का उपयोग किया जाएगा)

```python
ASTRA_DB_ID = input("ASTRA_DB_ID = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_keyspace = input("ASTRA_DB_KEYSPACE (optional, can be left empty) = ")
if desired_keyspace:
    ASTRA_DB_KEYSPACE = desired_keyspace
else:
    ASTRA_DB_KEYSPACE = None
```

```python
import cassio

cassio.init(
    database_id=ASTRA_DB_ID,
    token=ASTRA_DB_APPLICATION_TOKEN,
    keyspace=ASTRA_DB_KEYSPACE,
)
```

अब आप वेक्टर स्टोर बना सकते हैं:

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

## एक डेटासेट लोड करें

स्रोत डेटासेट में प्रत्येक प्रविष्टि को `Document` में रूपांतरित करें, फिर उन्हें वेक्टर स्टोर में लिखें:

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

उपरोक्त में, `metadata` डिक्शनरी स्रोत डेटा से बनाए जाते हैं और `Document` का हिस्सा हैं।

`add_texts` के साथ कुछ और प्रविष्टियां जोड़ें:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_नोट: आप `add_texts` और `add_documents` के निष्पादन को तेज करने के लिए इन बल्क ऑपरेशनों के लिए कंकरेंसी स्तर को बढ़ाना चाह सकते हैं -_
_अधिक विवरणों के लिए इन विधियों के `batch_size` पैरामीटर की जांच करें। नेटवर्क और क्लाइंट मशीन विनिर्देशों पर निर्भर करते हुए, आपका सबसे अच्छा प्रदर्शन करने वाला पैरामीटर चयन भिन्न हो सकता है।_

## खोज चलाएं

यह खंड मेटाडेटा फ़िल्टरिंग और समानता स्कोर प्राप्त करने का प्रदर्शन करता है:

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### MMR (अधिकतम-सीमांत-प्रासंगिकता) खोज

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

## संग्रहीत दस्तावेज़ों को हटाना

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## एक न्यूनतम RAG श्रृंखला

अगले कोशिकाएं एक सरल RAG पाइपलाइन को क्रियान्वित करेंगी:
- एक नमूना PDF फ़ाइल डाउनलोड करें और उसे स्टोर पर लोड करें;
- LCEL (LangChain Expression Language) के साथ एक RAG श्रृंखला बनाएं, जिसमें वेक्टर स्टोर केंद्र में हो;
- प्रश्न-उत्तर श्रृंखला चलाएं।

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

अधिक जानकारी के लिए, CQL के माध्यम से Astra DB का उपयोग करते हुए एक पूर्ण RAG टेम्प्लेट [यहां](https://github.com/langchain-ai/langchain/tree/master/templates/cassandra-entomology-rag) देखें।

## सफाई

निम्नलिखित बुनियादी रूप से CassIO से `Session` ऑब्जेक्ट को पुनः प्राप्त करता है और इसके साथ एक CQL `DROP TABLE` कथन चलाता है:

_(आप इसमें संग्रहीत डेटा को खो देंगे।)_

```python
cassio.config.resolve_session().execute(
    f"DROP TABLE {cassio.config.resolve_keyspace()}.cassandra_vector_demo;"
)
```

### अधिक जानें

अधिक जानकारी, विस्तृत त्वरित शुरुआत और अतिरिक्त उपयोग उदाहरणों के लिए, कृपया [CassIO दस्तावेज़ीकरण](https://cassio.org/frameworks/langchain/about/) पर और अधिक जानकारी के लिए देखें।

#### एट्रिब्यूशन बयान

> Apache Cassandra, Cassandra और Apache या तो संयुक्त राज्य अमेरिका और/या अन्य देशों में [Apache Software Foundation](http://www.apache.org/) के पंजीकृत ट्रेडमार्क या ट्रेडमार्क हैं।
