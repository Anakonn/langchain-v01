---
translated: true
---

# अनुक्रमण

यहाँ, हम LangChain अनुक्रमण API का उपयोग करके एक मूलभूत अनुक्रमण कार्यप्रवाह देखेंगे।

अनुक्रमण API आपको किसी भी स्रोत से दस्तावेज़ लोड करने और उन्हें वेक्टर स्टोर में सिंक रखने में मदद करता है। विशेष रूप से, यह मदद करता है:

* वेक्टर स्टोर में डुप्लिकेट सामग्री लिखने से बचना
* अपरिवर्तित सामग्री को पुनः लिखने से बचना
* अपरिवर्तित सामग्री पर पुनः एम्बेडिंग की गणना करने से बचना

इन सभी से आपका समय और पैसा बचेगा, साथ ही ही आपके वेक्टर खोज परिणाम भी बेहतर होंगे।

महत्वपूर्ण बात यह है कि अनुक्रमण API मूल स्रोत दस्तावेज़ों के संबंध में कई रूपांतरण चरणों (जैसे, पाठ टुकड़ीकरण के माध्यम से) से गुज़रने वाले दस्तावेज़ों के साथ भी काम करेगा।

## यह कैसे काम करता है

LangChain अनुक्रमण एक रिकॉर्ड प्रबंधक (`RecordManager`) का उपयोग करता है जो वेक्टर स्टोर में दस्तावेज़ लेखन का ट्रैक रखता है।

दस्तावेज़ अनुक्रमण करते समय, प्रत्येक दस्तावेज़ के लिए हैश की गणना की जाती है, और रिकॉर्ड प्रबंधक में निम्नलिखित जानकारी संग्रहीत की जाती है:

- दस्तावेज़ हैश (सामग्री और मेटाडेटा दोनों का हैश)
- लेखन समय
- स्रोत आईडी - प्रत्येक दस्तावेज़ में अपने मेटाडेटा में ऐसी जानकारी होनी चाहिए जो हमें इस दस्तावेज़ के मूल स्रोत का पता लगाने में मदद करे

## हटाने के मोड

जब दस्तावेज़ों को वेक्टर स्टोर में अनुक्रमित किया जाता है, तो संभव है कि वेक्टर स्टोर में मौजूद कुछ मौजूदा दस्तावेज़ों को हटाया जाना चाहिए। कुछ स्थितियों में आप नए अनुक्रमित किए जा रहे दस्तावेज़ों के समान स्रोतों से व्युत्पन्न सभी मौजूदा दस्तावेज़ों को हटाना चाह सकते हैं। अन्य में आप सभी मौजूदा दस्तावेज़ों को पूरी तरह से हटाना चाह सकते हैं। अनुक्रमण API हटाने के मोड आपको चाहित व्यवहार चुनने देते हैं:

| क्लीनअप मोड | डुप्लिकेट सामग्री को हटाता है | समानांतर करने योग्य | हटाए गए स्रोत दस्तावेज़ों को साफ करता है | स्रोत दस्तावेज़ों और/या व्युत्पन्न दस्तावेज़ों के उत्परिवर्तन को साफ करता है | क्लीनअप का समय |
|------------|------------------------------|-------------------|--------------------------------------|----------------------------------------------------------|-------------------|
| कोई नहीं    | ✅                           | ✅                 | ❌                                  | ❌                                                      | -                 |
| क्रमिक     | ✅                           | ✅                 | ❌                                  | ✅                                                      | लगातार           |
| पूर्ण      | ✅                           | ❌                 | ✅                                  | ✅                                                      | अनुक्रमण के अंत में |

`कोई नहीं` स्वचालित क्लीनअप नहीं करता है, उपयोगकर्ता को पुराने सामग्री को मैनुअल रूप से साफ करने की अनुमति देता है।

`क्रमिक` और `पूर्ण` निम्नलिखित स्वचालित क्लीनअप प्रदान करते हैं:

* यदि स्रोत दस्तावेज़ या व्युत्पन्न दस्तावेज़ों की **सामग्री** में परिवर्तन हुआ है, तो `क्रमिक` या `पूर्ण` दोनों मोड पिछले संस्करणों को साफ (हटा) देंगे।
* यदि स्रोत दस्तावेज़ **हटा दिया गया** है (यह कहते हुए कि वह वर्तमान में अनुक्रमित किए जा रहे दस्तावेज़ों में शामिल नहीं है), तो `पूर्ण` क्लीनअप मोड इसे सही ढंग से वेक्टर स्टोर से हटा देगा, लेकिन `क्रमिक` मोड नहीं।

जब सामग्री में परिवर्तन होता है (उदाहरण के लिए, मूल PDF फ़ाइल को संशोधित किया गया था) तो अनुक्रमण के दौरान कुछ समय के लिए नया और पुराना दोनों संस्करण उपयोगकर्ता को वापस मिल सकते हैं। यह तब होता है जब नई सामग्री लिखी गई हो, लेकिन पुराने संस्करण को हटाया नहीं गया हो।

* `क्रमिक` अनुक्रमण इस समय अवधि को कम करता है क्योंकि यह लिखते समय लगातार क्लीनअप कर सकता है।
* `पूर्ण` मोड सभी बैच लिखने के बाद क्लीनअप करता है।

## आवश्यकताएं

1. उस स्टोर के साथ उपयोग न करें जिसमें अनुक्रमण API के बिना स्वतंत्र रूप से सामग्री पूर्व-भरी गई है, क्योंकि रिकॉर्ड प्रबंधक को पता नहीं होगा कि रिकॉर्ड पहले से ही डाले गए हैं।
2. केवल LangChain `vectorstore` के साथ काम करता है जो इन सुविधाओं का समर्थन करते हैं:
   * आईडी द्वारा दस्तावेज़ जोड़ना (`ids` तर्क के साथ `add_documents` विधि)
   * आईडी द्वारा हटाना (`ids` तर्क के साथ `delete` विधि)

संगत वेक्टर स्टोर: `AnalyticDB`, `AstraDB`, `AzureCosmosDBVectorSearch`, `AzureSearch`, `AwaDB`, `Bagel`, `Cassandra`, `Chroma`, `CouchbaseVectorStore`, `DashVector`, `DatabricksVectorSearch`, `DeepLake`, `Dingo`, `ElasticVectorSearch`, `ElasticsearchStore`, `FAISS`, `HanaDB`, `LanceDB`, `Milvus`, `MyScale`, `OpenSearchVectorSearch`, `PGVector`, `Pinecone`, `Qdrant`, `Redis`, `Rockset`, `ScaNN`, `SupabaseVectorStore`, `SurrealDBStore`, `TimescaleVector`, `UpstashVectorStore`, `Vald`, `VDMS`, `Vearch`, `VespaStore`, `Weaviate`, `ZepVectorStore`, `TencentVectorDB`, `OpenSearchVectorSearch`, `Yellowbrick`।

## सावधानी

रिकॉर्ड प्रबंधक किसी सामग्री को साफ करने के लिए समय-आधारित तंत्र पर निर्भर करता है (`पूर्ण` या `क्रमिक` क्लीनअप मोड का उपयोग करते समय)।

यदि दो कार्य एक के बाद एक चलते हैं, और पहला कार्य घड़ी के समय में बदलाव से पहले समाप्त हो जाता है, तो दूसरा कार्य सामग्री को साफ करने में असमर्थ हो सकता है।

वास्तविक सेटिंग में यह समस्या होना अनहोना है क्योंकि:

1. RecordManager उच्च रिज़ॉल्यूशन टाइमस्टैम्प का उपयोग करता है।
2. पहले और दूसरे कार्य के बीच डेटा में परिवर्तन होना चाहिए, जो कम संभावना है यदि कार्यों के बीच का अंतराल छोटा है।
3. अनुक्रमण कार्य आमतौर पर कुछ मिलीसेकंड से अधिक समय लेते हैं।

## त्वरित प्रारंभ

```python
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

एक वेक्टर स्टोर को प्रारंभ करें और एम्बेडिंग्स को सेट अप करें:

```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

एक उचित नामस्थान के साथ एक रिकॉर्ड प्रबंधक को प्रारंभ करें।

**सुझाव:** वेक्टर स्टोर और वेक्टर स्टोर में संग्रहण नाम दोनों को ध्यान में रखते हुए एक नामस्थान का उपयोग करें; उदाहरण के लिए, 'redis/my_docs', 'chromadb/my_docs' या 'postgres/my_docs'।

```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

उपयोग करने से पहले एक स्कीमा बनाएं।

```python
record_manager.create_schema()
```

आइए कुछ परीक्षण दस्तावेज़ों को अनुक्रमित करें:

```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

खाली वेक्टर स्टोर में अनुक्रमण करना:

```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### ``None`` हटाने का मोड

यह मोड पुराने संस्करणों के स्वचालित सफाई नहीं करता है; हालांकि, यह सामग्री की डुप्लिकेट हटाने का ध्यान रखता है।

```python
_clear()
```

```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
_clear()
```

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

दूसरी बार सभी सामग्री को छोड़ दिया जाएगा:

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

### ``"incremental"`` हटाने का मोड

```python
_clear()
```

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

अनुक्रमण करने से दोनों दस्तावेज़ों को **छोड़ दिया जाएगा** - एम्बेडिंग ऑपरेशन को भी छोड़ दिया जाएगा!

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

यदि हम इनक्रीमेंटल अनुक्रमण मोड में कोई दस्तावेज़ नहीं देते हैं, तो कुछ भी नहीं बदलेगा।

```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

यदि हम एक दस्तावेज़ को संशोधित करते हैं, तो नया संस्करण लिखा जाएगा और उसी स्रोत को साझा करने वाले सभी पुराने संस्करण हटा दिए जाएंगे।

```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```

```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```

### ``"full"`` हटाने का मोड

`full` मोड में उपयोगकर्ता को अनुक्रमण कार्य में अनुक्रमित किए जाने वाले `full` विषय-वस्तु को पास करना चाहिए।

वेक्टर स्टोर में मौजूद और अनुक्रमण कार्य में पास नहीं किए गए किसी भी दस्तावेज़ को हटा दिया जाएगा!

यह व्यवहार स्रोत दस्तावेज़ों के हटाने को संभालने के लिए उपयोगी है।

```python
_clear()
```

```python
all_docs = [doc1, doc2]
```

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

कहा जाता है कि किसी ने पहला दस्तावेज़ हटा दिया:

```python
del all_docs[0]
```

```python
all_docs
```

```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```

पूर्ण मोड का उपयोग करके हटाई गई सामग्री को भी साफ किया जाएगा।

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```

## स्रोत

मेटाडेटा विशेषता में एक फ़ील्ड है जिसे `source` कहा जाता है। यह स्रोत दिए गए दस्तावेज़ से जुड़े *अंतिम* प्रोवेनेंस की ओर इशारा करना चाहिए।

उदाहरण के लिए, यदि ये दस्तावेज़ किसी माता-पिता दस्तावेज़ के टुकड़ों को प्रतिनिधित्व कर रहे हैं, तो दोनों दस्तावेज़ों के लिए `source` एक ही होना चाहिए और माता-पिता दस्तावेज़ का संदर्भ देना चाहिए।

सामान्य रूप से, `source` हमेशा निर्दिष्ट किया जाना चाहिए। केवल `None` का उपयोग करें, यदि आप **कभी भी** `incremental` मोड का उपयोग नहीं करने वाले हैं, और किसी कारण से `source` फ़ील्ड को सही ढंग से निर्दिष्ट नहीं कर सकते।

```python
from langchain_text_splitters import CharacterTextSplitter
```

```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```

```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```

```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```

```python
_clear()
```

```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

यह `doggy.txt` स्रोत से जुड़े दस्तावेज़ों के पुराने संस्करणों को हटा देगा और उन्हें नए संस्करणों से बदल देगा।

```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```

## लोडर्स के साथ उपयोग करना

अनुक्रमण या तो दस्तावेज़ों के इटरेबल या किसी भी लोडर को स्वीकार कर सकता है।

**ध्यान दें:** लोडर को सही ढंग से स्रोत कुंजियां सेट करनी चाहिए।

```python
from langchain_community.document_loaders.base import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```

```python
_clear()
```

```python
loader = MyCustomLoader()
```

```python
loader.load()
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```
