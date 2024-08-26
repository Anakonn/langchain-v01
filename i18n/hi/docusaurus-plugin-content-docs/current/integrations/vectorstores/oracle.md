---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# Oracle AI Vector Search: वेक्टर स्टोर

Oracle AI Vector Search को कृत्रिम बुद्धिमत्ता (AI) कार्यभार के लिए डिज़ाइन किया गया है जो आपको डेटा को कीवर्ड के बजाय अर्थ के आधार पर क्वेरी करने की अनुमति देता है।
Oracle AI Vector Search के सबसे बड़े लाभों में से एक यह है कि अनरचित डेटा पर अर्थ-खोज को व्यावसायिक डेटा पर रिलेशनल खोज के साथ एक ही सिस्टम में जोड़ा जा सकता है।
यह न केवल शक्तिशाली है, बल्कि महत्वपूर्ण रूप से अधिक प्रभावी भी है क्योंकि आपको एक विशेषज्ञ वेक्टर डेटाबेस जोड़ने की जरूरत नहीं है, जिससे कई सिस्टमों के बीच डेटा टुकड़ों की समस्या समाप्त हो जाती है।

इसके अलावा, क्योंकि Oracle ने लंबे समय से डेटाबेस प्रौद्योगिकियों का निर्माण कर रहा है, आपके वेक्टर Oracle डेटाबेस की सबसे शक्तिशाली सुविधाओं से लाभान्वित हो सकते हैं, जैसे:

 * पार्टिशनिंग समर्थन
 * रियल एप्लिकेशन क्लस्टर स्केलेबिलिटी
 * Exadata स्मार्ट स्कैन
 * भौगोलिक रूप से वितरित डेटाबेस पर शार्ड प्रोसेसिंग
 * लेनदेन
 * समानांतर SQL
 * आपदा प्रतिकार
 * सुरक्षा
 * Oracle Machine Learning
 * Oracle Graph Database
 * Oracle Spatial and Graph
 * Oracle Blockchain
 * JSON

### Oracle AI Vector Search के साथ Langchain का उपयोग करने के लिए पूर्वापेक्षाएं

कृपया Langchain के साथ Oracle AI Vector Search का उपयोग करने के लिए Oracle Python क्लाइंट ड्राइवर स्थापित करें।

```python
# pip install oracledb
```

### Oracle AI Vector Search से कनेक्ट करें

```python
import oracledb

username = "username"
password = "password"
dsn = "ipaddress:port/orclpdb1"

try:
    connection = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
```

### Oracle AI Vector Search के साथ खेलने के लिए आवश्यक डिपेंडेंसी आयात करें

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import oraclevs
from langchain_community.vectorstores.oraclevs import OracleVS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
```

### दस्तावेज़ लोड करें

```python
# Define a list of documents (These dummy examples are 5 random documents from Oracle Concepts Manual )

documents_json_list = [
    {
        "id": "cncpt_15.5.3.2.2_P4",
        "text": "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-5387D7B2-C0CA-4C1E-811B-C7EB9B636442",
    },
    {
        "id": "cncpt_15.5.5_P1",
        "text": "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-D02B2220-E6F5-40D9-AFB5-BC69BCEF6CD4",
    },
    {
        "id": "cncpt_22.3.4.3.1_P2",
        "text": "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
    {
        "id": "cncpt_22.3.4.3.1_P3",
        "text": "The LOB segment stores data in pieces called chunks. A chunk is a logically contiguous set of data blocks and is the smallest unit of allocation for a LOB. A row in the table stores a pointer called a LOB locator, which points to the LOB index. When the table is queried, the database uses the LOB index to quickly locate the LOB chunks.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
]
```

```python
# Create Langchain Documents

documents_langchain = []

for doc in documents_json_list:
    metadata = {"id": doc["id"], "link": doc["link"]}
    doc_langchain = Document(page_content=doc["text"], metadata=metadata)
    documents_langchain.append(doc_langchain)
```

### विभिन्न दूरी रणनीतियों के साथ कई वेक्टर स्टोर बनाने के लिए AI वेक्टर खोज का उपयोग करें

पहले हम तीन वेक्टर स्टोर बनाएंगे, प्रत्येक में अलग-अलग दूरी कार्य होंगे। चूंकि हमने अभी तक उनमें सूचकांक नहीं बनाए हैं, वे केवल तालिकाएं बनाएंगे। बाद में हम इन वेक्टर स्टोर का उपयोग HNSW सूचकांक बनाने के लिए करेंगे।

आप Oracle डेटाबेस से मैन्युअल रूप से कनेक्ट कर सकते हैं और तीन तालिकाएं देखेंगे
Documents_DOT, Documents_COSINE और Documents_EUCLIDEAN।

हम फिर तीन अतिरिक्त तालिकाएं Documents_DOT_IVF, Documents_COSINE_IVF और Documents_EUCLIDEAN_IVF बनाएंगे जिनका उपयोग HNSW सूचकांक के बजाय IVF सूचकांक बनाने के लिए किया जाएगा।

```python
# Ingest documents into Oracle Vector Store using different distance strategies

model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

vector_store_dot = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)

# Ingest documents into Oracle Vector Store using different distance strategies
vector_store_dot_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT_IVF",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE_IVF",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN_IVF",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### पाठ के लिए जोड़ने, हटाने के ऑपरेशन और मूलभूत समानता खोज दिखाना

```python
def manage_texts(vector_stores):
    """
    Adds texts to each vector store, demonstrates error handling for duplicate additions,
    and performs deletion of texts. Showcases similarity searches and index creation for each vector store.

    Args:
    - vector_stores (list): A list of OracleVS instances.
    """
    texts = ["Rohan", "Shailendra"]
    metadata = [
        {"id": "100", "link": "Document Example Test 1"},
        {"id": "101", "link": "Document Example Test 2"},
    ]

    for i, vs in enumerate(vector_stores, start=1):
        # Adding texts
        try:
            vs.add_texts(texts, metadata)
            print(f"\n\n\nAdd texts complete for vector store {i}\n\n\n")
        except Exception as ex:
            print(f"\n\n\nExpected error on duplicate add for vector store {i}\n\n\n")

        # Deleting texts using the value of 'id'
        vs.delete([metadata[0]["id"]])
        print(f"\n\n\nDelete texts complete for vector store {i}\n\n\n")

        # Similarity search
        results = vs.similarity_search("How are LOBS stored in Oracle Database", 2)
        print(f"\n\n\nSimilarity search results for vector store {i}: {results}\n\n\n")


vector_store_list = [
    vector_store_dot,
    vector_store_max,
    vector_store_euclidean,
    vector_store_dot_ivf,
    vector_store_max_ivf,
    vector_store_euclidean_ivf,
]
manage_texts(vector_store_list)
```

### प्रत्येक दूरी रणनीति के लिए विशिष्ट मापदंडों के साथ सूचकांक निर्माण दिखाना

```python
def create_search_indices(connection):
    """
    Creates search indices for the vector stores, each with specific parameters tailored to their distance strategy.
    """
    # Index for DOT_PRODUCT strategy
    # Notice we are creating a HNSW index with default parameters
    # This will default to creating a HNSW index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot,
        params={"idx_name": "hnsw_idx1", "idx_type": "HNSW"},
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating a HNSW index with parallel 16 and Target Accuracy Specification as 97 percent
    oraclevs.create_index(
        connection,
        vector_store_max,
        params={
            "idx_name": "hnsw_idx2",
            "idx_type": "HNSW",
            "accuracy": 97,
            "parallel": 16,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating a HNSW index by specifying Power User Parameters which are neighbors = 64 and efConstruction = 100
    oraclevs.create_index(
        connection,
        vector_store_euclidean,
        params={
            "idx_name": "hnsw_idx3",
            "idx_type": "HNSW",
            "neighbors": 64,
            "efConstruction": 100,
        },
    )

    # Index for DOT_PRODUCT strategy with specific parameters
    # Notice we are creating an IVF index with default parameters
    # This will default to creating an IVF index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot_ivf,
        params={
            "idx_name": "ivf_idx1",
            "idx_type": "IVF",
        },
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating an IVF index with parallel 32 and Target Accuracy Specification as 90 percent
    oraclevs.create_index(
        connection,
        vector_store_max_ivf,
        params={
            "idx_name": "ivf_idx2",
            "idx_type": "IVF",
            "accuracy": 90,
            "parallel": 32,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating an IVF index by specifying Power User Parameters which is neighbor_part = 64
    oraclevs.create_index(
        connection,
        vector_store_euclidean_ivf,
        params={"idx_name": "ivf_idx3", "idx_type": "IVF", "neighbor_part": 64},
    )

    print("Index creation complete.")


create_search_indices(connection)
```

### अब हम सभी छह वेक्टर स्टोर पर कई उन्नत खोजें करेंगे। इन तीन खोजों में से प्रत्येक का एक फ़िल्टर के साथ और बिना फ़िल्टर वर्जन है। फ़िल्टर केवल दस्तावेज़ आईडी 101 वाले दस्तावेज़ को चुनता है और शेष सब कुछ को छांट देता है।

```python
# Conduct advanced searches after creating the indices
def conduct_advanced_searches(vector_stores):
    query = "How are LOBS stored in Oracle Database"
    # Constructing a filter for direct comparison against document metadata
    # This filter aims to include documents whose metadata 'id' is exactly '2'
    filter_criteria = {"id": ["101"]}  # Direct comparison filter

    for i, vs in enumerate(vector_stores, start=1):
        print(f"\n--- Vector Store {i} Advanced Searches ---")
        # Similarity search without a filter
        print("\nSimilarity search results without filter:")
        print(vs.similarity_search(query, 2))

        # Similarity search with a filter
        print("\nSimilarity search results with filter:")
        print(vs.similarity_search(query, 2, filter=filter_criteria))

        # Similarity search with relevance score
        print("\nSimilarity search with relevance score:")
        print(vs.similarity_search_with_score(query, 2))

        # Similarity search with relevance score with filter
        print("\nSimilarity search with relevance score with filter:")
        print(vs.similarity_search_with_score(query, 2, filter=filter_criteria))

        # Max marginal relevance search
        print("\nMax marginal relevance search results:")
        print(vs.max_marginal_relevance_search(query, 2, fetch_k=20, lambda_mult=0.5))

        # Max marginal relevance search with filter
        print("\nMax marginal relevance search results with filter:")
        print(
            vs.max_marginal_relevance_search(
                query, 2, fetch_k=20, lambda_mult=0.5, filter=filter_criteria
            )
        )


conduct_advanced_searches(vector_store_list)
```

### एंड-टू-एंड डेमो

कृपया हमारे पूर्ण डेमो गाइड [Oracle AI Vector Search End-to-End Demo Guide](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) देखें ताकि आप Oracle AI Vector Search की मदद से एक एंड-टू-एंड RAG पाइपलाइन बना सकें।
