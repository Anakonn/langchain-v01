---
translated: true
---

# डेटाब्रिक्स वेक्टर सर्च

डेटाब्रिक्स वेक्टर सर्च एक सर्वरलेस समानता खोज इंजन है जो आपको अपने डेटा का एक वेक्टर प्रतिनिधित्व, मेटाडेटा सहित, एक वेक्टर डेटाबेस में संग्रहीत करने की अनुमति देता है। वेक्टर सर्च के साथ, आप यूनिटी कैटलॉग द्वारा प्रबंधित डेल्टा तालिकाओं से स्वचालित अपडेट होने वाले वेक्टर सर्च इंडेक्स बना सकते हैं और सबसे समान वेक्टरों को वापस लौटाने के लिए एक सरल एपीआई के साथ उन्हें क्वेरी कर सकते हैं।

यह नोटबुक दिखाता है कि डेटाब्रिक्स वेक्टर सर्च के साथ LangChain का उपयोग कैसे किया जाता है।

`databricks-vectorsearch` और इस नोटबुक में उपयोग किए जाने वाले संबंधित Python पैकेज इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

एम्बेडिंग के लिए `OpenAIEmbeddings` का उपयोग करें।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

दस्तावेज़ों को विभाजित करें और एम्बेडिंग प्राप्त करें।

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))
```

## डेटाब्रिक्स वेक्टर सर्च क्लाइंट सेटअप करें

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
```

## एक वेक्टर सर्च एंडपॉइंट बनाएं

यह एंडपॉइंट वेक्टर सर्च इंडेक्स बनाने और उन्हें एक्सेस करने के लिए उपयोग किया जाता है।

```python
vsc.create_endpoint(name="vector_search_demo_endpoint", endpoint_type="STANDARD")
```

## डायरेक्ट वेक्टर एक्सेस इंडेक्स बनाएं

डायरेक्ट वेक्टर एक्सेस इंडेक्स एम्बेडिंग वेक्टर और मेटाडेटा को एक REST API या एक SDK के माध्यम से सीधे पढ़ने और लिखने का समर्थन करता है। इस इंडेक्स के लिए, आप खुद एम्बेडिंग वेक्टर और इंडेक्स अपडेट का प्रबंधन करते हैं।

```python
vector_search_endpoint_name = "vector_search_demo_endpoint"
index_name = "ml.llm.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        "source": "string",
    },
)

index.describe()
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    index, text_column="text", embedding=embeddings, columns=["source"]
)
```

## इंडेक्स में दस्तावेज़ जोड़ें

```python
dvs.add_documents(docs)
```

## समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
dvs.similarity_search(query)
print(docs[0].page_content)
```

## डेल्टा सिंक इंडेक्स के साथ काम करें

आप `DatabricksVectorSearch` का उपयोग करके एक डेल्टा सिंक इंडेक्स में भी खोज कर सकते हैं। डेल्टा सिंक इंडेक्स स्वचालित रूप से एक डेल्टा तालिका से सिंक होता है। आपको `add_text`/`add_documents` को मैनुअल रूप से कॉल करने की आवश्यकता नहीं है। अधिक जानकारी के लिए [डेटाब्रिक्स दस्तावेज़ पृष्ठ](https://docs.databricks.com/en/generative-ai/vector-search.html#delta-sync-index-with-managed-embeddings) देखें।

```python
dvs_delta_sync = DatabricksVectorSearch("catalog_name.schema_name.delta_sync_index")
dvs_delta_sync.similarity_search(query)
```
