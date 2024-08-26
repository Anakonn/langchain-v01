---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# OpenSearch

> [OpenSearch](https://opensearch.org/) एक स्केलेबल, लचीला और विस्तारयोग्य ओपन-सोर्स सॉफ्टवेयर सूट है जो खोज, विश्लेषण और अवलोकन अनुप्रयोगों के लिए Apache 2.0 लाइसेंस के तहत उपलब्ध है। `OpenSearch` `Apache Lucene` पर आधारित एक वितरित खोज और विश्लेषण इंजन है।

यह नोटबुक `OpenSearch` डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक चालू OpenSearch इंस्टेंस होना चाहिए: [आसान Docker इंस्टॉलेशन के लिए यहां देखें](https://hub.docker.com/r/opensearchproject/opensearch)।

`similarity_search` डिफ़ॉल्ट रूप से लगभग k-NN खोज करता है जो लुसेन, एनएमएसलिब, फ़ैस जैसे कई एल्गोरिदम में से एक का उपयोग करता है जो बड़े डेटासेट के लिए अनुशंसित हैं। ब्रूट फ़ोर्स खोज करने के लिए हमारे पास स्क्रिप्ट स्कोरिंग और पेनलेस स्क्रिप्टिंग जैसी अन्य खोज विधियां हैं।
[यह](https://opensearch.org/docs/latest/search-plugins/knn/index/) अधिक जानकारी के लिए देखें।

## इंस्टॉलेशन

Python क्लाइंट इंस्टॉल करें।

```python
%pip install --upgrade --quiet  opensearch-py
```

हम OpenAIEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import OpenSearchVectorSearch
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

## Approximate k-NN का उपयोग करके `similarity_search`

कस्टम पैरामीटर के साथ `Approximate k-NN` खोज का उपयोग करके `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200"
)

# If using the default Docker installation, use this instantiation instead:
# docsearch = OpenSearchVectorSearch.from_documents(
#     docs,
#     embeddings,
#     opensearch_url="https://localhost:9200",
#     http_auth=("admin", "admin"),
#     use_ssl = False,
#     verify_certs = False,
#     ssl_assert_hostname = False,
#     ssl_show_warn = False,
# )
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query, k=10)
```

```python
print(docs[0].page_content)
```

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="http://localhost:9200",
    engine="faiss",
    space_type="innerproduct",
    ef_construction=256,
    m=48,
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

## स्क्रिप्ट स्कोरिंग का उपयोग करके `similarity_search`

कस्टम पैरामीटर के साथ `स्क्रिप्ट स्कोरिंग` का उपयोग करके `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=1,
    search_type="script_scoring",
)
```

```python
print(docs[0].page_content)
```

## पेनलेस स्क्रिप्टिंग का उपयोग करके `similarity_search`

कस्टम पैरामीटर के साथ `पेनलेस स्क्रिप्टिंग` का उपयोग करके `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)
filter = {"bool": {"filter": {"term": {"text": "smuggling"}}}}
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    search_type="painless_scripting",
    space_type="cosineSimilarity",
    pre_filter=filter,
)
```

```python
print(docs[0].page_content)
```

## अधिकतम सीमांत प्रासंगिकता खोज (MMR)

यदि आप कुछ समान दस्तावेजों को देखना चाहते हैं, लेकिन आप विविध परिणाम भी प्राप्त करना चाहते हैं, तो MMR एक विधि है जिसे आप विचार कर सकते हैं। अधिकतम सीमांत प्रासंगिकता खोज क्वेरी के समानता और चयनित दस्तावेजों के बीच विविधता को अनुकूलित करता है।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10, lambda_param=0.5)
```

## पूर्व-मौजूद OpenSearch इंस्टेंस का उपयोग करना

पूर्व-मौजूद OpenSearch इंस्टेंस का उपयोग करना भी संभव है जिसमें पहले से ही वेक्टर मौजूद हैं।

```python
# this is just an example, you would need to change these values to point to another opensearch instance
docsearch = OpenSearchVectorSearch(
    index_name="index-*",
    embedding_function=embeddings,
    opensearch_url="http://localhost:9200",
)

# you can specify custom field names to match the fields you're using to store your embedding, document text value, and metadata
docs = docsearch.similarity_search(
    "Who was asking about getting lunch today?",
    search_type="script_scoring",
    space_type="cosinesimil",
    vector_field="message_embedding",
    text_field="message",
    metadata_field="message_metadata",
)
```

## AOSS (Amazon OpenSearch Service Serverless) का उपयोग करना

यह `AOSS` का एक उदाहरण है जिसमें `faiss` इंजन और `efficient_filter` है।

हमें कई `python` पैकेज इंस्टॉल करने की आवश्यकता है।

```python
%pip install --upgrade --quiet  boto3 requests requests-aws4auth
```

```python
import boto3
from opensearchpy import RequestsHttpConnection
from requests_aws4auth import AWS4Auth

service = "aoss"  # must set the service as 'aoss'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index-using-aoss",
    engine="faiss",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    efficient_filter=filter,
    k=200,
)
```

## AOS (Amazon OpenSearch Service) का उपयोग करना

```python
%pip install --upgrade --quiet  boto3
```

```python
# This is just an example to show how to use Amazon OpenSearch Service, you need to set proper values.
import boto3
from opensearchpy import RequestsHttpConnection

service = "es"  # must set the service as 'es'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    k=200,
)
```
