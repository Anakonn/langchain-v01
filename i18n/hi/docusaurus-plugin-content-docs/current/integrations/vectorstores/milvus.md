---
translated: true
---

# मिल्वस

>[मिल्वस](https://milvus.io/docs/overview.md) एक डेटाबेस है जो गहन न्यूरल नेटवर्क और अन्य मशीन लर्निंग (एमएल) मॉडल द्वारा उत्पन्न विशाल एम्बेडिंग वेक्टर को संग्रहीत, इंडेक्स और प्रबंधित करता है।

यह नोटबुक मिल्वस वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास [चालू और चल रहा मिल्वस इंस्टेंस](https://milvus.io/docs/install_standalone-docker.md) होना चाहिए।

```python
%pip install --upgrade --quiet  pymilvus
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

### मिल्वस संग्रह के साथ डेटा को विभाजित करें

आप एक ही मिल्वस इंस्टेंस में विभिन्न असंबद्ध दस्तावेजों को विभिन्न संग्रहों में संग्रहीत कर सकते हैं ताकि संदर्भ बना रहे।

यहां आप एक नया संग्रह कैसे बना सकते हैं

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    collection_name="collection_1",
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

और यहां आप उस संग्रह को कैसे पुनः प्राप्त कर सकते हैं

```python
vector_db = Milvus(
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    collection_name="collection_1",
)
```

पुनः प्राप्ति के बाद आप सामान्य रूप से इसका प्रश्न कर सकते हैं।

### प्रति-उपयोगकर्ता पुनः प्राप्ति

एक पुनः प्राप्ति ऐप बनाते समय, आपको कई उपयोगकर्ताओं को ध्यान में रखना होता है। इसका मतलब है कि आप केवल एक उपयोगकर्ता के लिए नहीं, बल्कि कई अलग-अलग उपयोगकर्ताओं के लिए डेटा संग्रहीत कर रहे हैं, और उन्हें एक-दूसरे के डेटा को देखने की अनुमति नहीं होनी चाहिए।

मिल्वस [partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy) का उपयोग करके बहु-किराएदारी को लागू करने की सिफारिश करता है, यहां एक उदाहरण है।

```python
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

पार्टिशन कुंजी का उपयोग करके खोज करने के लिए, आपको खोज अनुरोध के बूलियन अभिव्यक्ति में निम्नलिखित में से किसी एक को शामिल करना चाहिए:

`search_kwargs={"expr": '<partition_key> == "xxxx"'}`

`search_kwargs={"expr": '<partition_key> == in ["xxx", "xxx"]'}`

`<partition_key>` को पार्टिशन कुंजी के रूप में नामित फ़ील्ड के नाम से बदल दें।

मिल्वस निर्दिष्ट पार्टिशन कुंजी के आधार पर एक पार्टिशन में बदल जाता है, पार्टिशन कुंजी के अनुसार इकाइयों को फ़िल्टर करता है, और फ़िल्टर की गई इकाइयों में खोजता है।

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "ankush"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```

**एक या अधिक इकाइयों को हटाने या अपडेट/इंसर्ट करने के लिए:**

```python
from langchain_community.docstore.document import Document

# Insert data sample
docs = [
    Document(page_content="foo", metadata={"id": 1}),
    Document(page_content="bar", metadata={"id": 2}),
    Document(page_content="baz", metadata={"id": 3}),
]
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)

# Search pks (primary keys) using expression
expr = "id in [1,2]"
pks = vector_db.get_pks(expr)

# Delete entities by pks
result = vector_db.delete(pks)

# Upsert (Update/Insert)
new_docs = [
    Document(page_content="new_foo", metadata={"id": 1}),
    Document(page_content="new_bar", metadata={"id": 2}),
    Document(page_content="upserted_bak", metadata={"id": 3}),
]
upserted_pks = vector_db.upsert(pks, new_docs)
```
