---
translated: true
---

# चीन मोबाइल ईक्लाउड एलास्टिकसर्च वेक्टर सर्च

>[चीन मोबाइल ईक्लाउड वेक्टर सर्च](https://ecloud.10086.cn/portal/product/elasticsearch) एक पूरी तरह से प्रबंधित, उद्यम-स्तरीय वितरित खोज और विश्लेषण सेवा है। चीन मोबाइल ईक्लाउड वेक्टर सर्च संरचित/अструक्चर्ड डेटा के लिए कम लागत, उच्च प्रदर्शन और विश्वसनीय पुनर्प्राप्ति और विश्लेषण प्लेटफॉर्म स्तर उत्पाद सेवाएं प्रदान करता है। एक वेक्टर डेटाबेस के रूप में, यह कई सूचकांक प्रकार और समानता दूरी विधियों का समर्थन करता है।

यह नोटबुक `ECloud ElasticSearch VectorStore` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।
चलाने के लिए, आपके पास एक [चीन मोबाइल ईक्लाउड वेक्टर सर्च](https://ecloud.10086.cn/portal/product/elasticsearch) उदाहरण चालू और चल रहा होना चाहिए:

[मदद दस्तावेज](https://ecloud.10086.cn/op-help-center/doc/category/1094) को जल्दी से परिचित और कॉन्फ़िगर करने के लिए पढ़ें चीन मोबाइल ईक्लाउड एलास्टिकसर्च उदाहरण।

उदाहरण चालू और चल रहा होने के बाद, दस्तावेज़ों को विभाजित करने, एम्बेडिंग प्राप्त करने, बैडू क्लाउड एलास्टिकसर्च उदाहरण से कनेक्ट करने, दस्तावेज़ों को सूचीबद्ध करने और वेक्टर पुनर्प्राप्ति करने के लिए इन चरणों का पालन करें।

```python
#!pip install elasticsearch == 7.10.1
```

पहले, हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

दूसरा, दस्तावेज़ों को विभाजित करें और एम्बेडिंग प्राप्त करें।

```python
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import EcloudESVectorStore
```

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

ES_URL = "http://localhost:9200"
USER = "your user name"
PASSWORD = "your password"
indexname = "your index name"
```

फिर, दस्तावेज़ों को सूचीबद्ध करें

```python
docsearch = EcloudESVectorStore.from_documents(
    docs,
    embeddings,
    es_url=ES_URL,
    user=USER,
    password=PASSWORD,
    index_name=indexname,
    refresh_indices=True,
)
```

अंत में, क्वेरी और डेटा पुनर्प्राप्त करें

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query, k=10)
print(docs[0].page_content)
```

एक आम उपयोग मामला

```python
def test_dense_float_vectore_lsh_cosine() -> None:
    """
    Test indexing with vectore type knn_dense_float_vector and  model-similarity of lsh-cosine
    this mapping is compatible with model of exact and similarity of l2/cosine
    this mapping is compatible with model of lsh and similarity of cosine
    """
    docsearch = EcloudESVectorStore.from_documents(
        docs,
        embeddings,
        es_url=ES_URL,
        user=USER,
        password=PASSWORD,
        index_name=indexname,
        refresh_indices=True,
        text_field="my_text",
        vector_field="my_vec",
        vector_type="knn_dense_float_vector",
        vector_params={"model": "lsh", "similarity": "cosine", "L": 99, "k": 1},
    )

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "similarity": "l2",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "exact",
            "similarity": "cosine",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    docs = docsearch.similarity_search(
        query,
        k=10,
        search_params={
            "model": "lsh",
            "similarity": "cosine",
            "candidates": 10,
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)
```

फ़िल्टर मामले के साथ

```python
def test_dense_float_vectore_exact_with_filter() -> None:
    """
    Test indexing with vectore type knn_dense_float_vector and default model/similarity
    this mapping is compatible with model of exact and similarity of l2/cosine
    """
    docsearch = EcloudESVectorStore.from_documents(
        docs,
        embeddings,
        es_url=ES_URL,
        user=USER,
        password=PASSWORD,
        index_name=indexname,
        refresh_indices=True,
        text_field="my_text",
        vector_field="my_vec",
        vector_type="knn_dense_float_vector",
    )
    # filter={"match_all": {}} ,default
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"match_all": {}},
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    # filter={"term": {"my_text": "Jackson"}}
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"term": {"my_text": "Jackson"}},
        search_params={
            "model": "exact",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)

    # filter={"term": {"my_text": "president"}}
    docs = docsearch.similarity_search(
        query,
        k=10,
        filter={"term": {"my_text": "president"}},
        search_params={
            "model": "exact",
            "similarity": "l2",
            "vector_field": "my_vec",
            "text_field": "my_text",
        },
    )
    print(docs[0].page_content)
```
