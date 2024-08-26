---
translated: true
---

# डेटाब्रिक्स वेक्टर खोज

>[डेटाब्रिक्स वेक्टर खोज](https://docs.databricks.com/en/generative-ai/vector-search.html) एक सर्वरलेस समानता खोज इंजन है जो आपको अपने डेटा का एक वेक्टर प्रतिनिधित्व, मेटाडेटा सहित, एक वेक्टर डेटाबेस में संग्रहीत करने की अनुमति देता है। वेक्टर खोज के साथ, आप यूनिटी कैटलॉग द्वारा प्रबंधित डेल्टा तालिकाओं से स्वत: अपडेट होने वाले वेक्टर खोज सूचकांक बना सकते हैं और एक सरल एपीआई का उपयोग करके उन्हें क्वेरी कर सकते हैं ताकि सबसे समान वेक्टर वापस मिल सकें।

वॉकथ्रू में, हम एक डेटाब्रिक्स वेक्टर खोज के साथ `SelfQueryRetriever` का प्रदर्शन करेंगे।

## डेटाब्रिक्स वेक्टर स्टोर सूचकांक बनाएं

पहले हम एक डेटाब्रिक्स वेक्टर स्टोर सूचकांक बनाना चाहेंगे और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले छोटे डेमो सेट बनाए हैं।

**नोट:** सेल्फ-क्वेरी रिट्रीवर के लिए आपके पास `lark` स्थापित होना चाहिए (`pip install lark`) साथ ही एकीकरण-विशिष्ट आवश्यकताएं।

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

```output
Note: you may need to restart the kernel to use updated packages.
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
databricks_host = getpass.getpass("Databricks host:")
databricks_token = getpass.getpass("Databricks token:")
```

```output
OpenAI API Key: ········
Databricks host: ········
Databricks token: ········
```

```python
from databricks.vector_search.client import VectorSearchClient
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))

vector_search_endpoint_name = "vector_search_demo_endpoint"


vsc = VectorSearchClient(
    workspace_url=databricks_host, personal_access_token=databricks_token
)
vsc.create_endpoint(name=vector_search_endpoint_name, endpoint_type="STANDARD")
```

```output
[NOTICE] Using a Personal Authentication Token (PAT). Recommended for development only. For improved performance, please use Service Principal based authentication. To disable this message, pass disable_notice=True to VectorSearchClient().
```

```python
index_name = "udhay_demo.10x.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "page_content": "string",
        "year": "int",
        "rating": "float",
        "genre": "string",
        "text_vector": "array<float>",
    },
)

index.describe()
```

```python
index = vsc.get_index(endpoint_name=vector_search_endpoint_name, index_name=index_name)

index.describe()
```

```python
from langchain_core.documents import Document

docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"id": 1, "year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"id": 2, "year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"id": 3, "year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"id": 4, "year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"id": 5, "year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"id": 6, "year": 1995, "genre": "animated", "rating": 9.3},
    ),
]
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

vector_store = DatabricksVectorSearch(
    index,
    text_column="page_content",
    embedding=embeddings,
    columns=["year", "rating", "genre"],
)
```

```python
vector_store.add_documents(docs)
```

## अपने सेल्फ-क्वेरी रिट्रीवर को बनाना

अब हम अपने रिट्रीवर को इंस्टांस कर सकते हैं। ऐसा करने के लिए, हमें अग्रिम में अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स के बारे में कुछ जानकारी और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_store, document_content_description, metadata_field_info, verbose=True
)
```

## इसे आज़माएं

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0})]
```

```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0})]
```

```python
# This example specifies both a relevant query and a filter
retriever.invoke("What are the thriller movies that are highly rated?")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'year': 2010.0, 'rating': 8.2, 'genre': 'thriller', 'id': 2.0})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0})]
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग करके `k` को भी निर्दिष्ट कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे निर्माता में `enable_limit=True` पास करके कर सकते हैं।

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग करके `k` को भी निर्दिष्ट कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे निर्माता में `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_store,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
retriever.invoke("What are two movies about dinosaurs?")
```
