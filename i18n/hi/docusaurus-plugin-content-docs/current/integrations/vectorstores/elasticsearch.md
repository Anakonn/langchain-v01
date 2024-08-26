---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) एक वितरित, RESTful खोज और विश्लेषण इंजन है, जो वेक्टर और लेक्सिकल खोज दोनों करने में सक्षम है। यह Apache Lucene लाइब्रेरी पर निर्मित है।

यह नोटबुक `Elasticsearch` डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

```python
%pip install --upgrade --quiet langchain-elasticsearch langchain-openai tiktoken langchain
```

## Elasticsearch चलाना और कनेक्ट करना

Elasticsearch इंस्टांस सेट करने के दो प्रमुख तरीके हैं:

1. Elastic Cloud: Elastic Cloud एक प्रबंधित Elasticsearch सेवा है। [मुफ्त ट्रायल](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation) के लिए साइन अप करें।

लॉगिन क्रेडेंशियल की आवश्यकता नहीं होने वाले Elasticsearch इंस्टांस से कनेक्ट करने के लिए, Elasticsearch URL और इंडेक्स नाम के साथ-साथ एम्बेडिंग ऑब्जेक्ट को कंस्ट्रक्टर में पास करें।

2. स्थानीय रूप से Elasticsearch इंस्टॉल करना: आधिकारिक Elasticsearch Docker इमेज का उपयोग करके स्थानीय रूप से Elasticsearch चलाकर शुरू करें। [Elasticsearch Docker दस्तावेज़ीकरण](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) देखें।

### Docker के माध्यम से Elasticsearch चलाना

उदाहरण: सुरक्षा को सक्षम नहीं करके एकल-नोड Elasticsearch इंस्टांस चलाएं। यह उत्पादन उपयोग के लिए अनुशंसित नहीं है।

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

एक बार Elasticsearch इंस्टांस चल जाने के बाद, आप Elasticsearch URL और इंडेक्स नाम के साथ-साथ एम्बेडिंग ऑब्जेक्ट को कंस्ट्रक्टर में पास करके इसमें कनेक्ट कर सकते हैं।

उदाहरण:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding
)
```

### प्रमाणीकरण

उत्पादन के लिए, हम सुरक्षा सक्षम होने की सिफारिश करते हैं। लॉगिन क्रेडेंशियल के साथ कनेक्ट करने के लिए, आप `es_api_key` या `es_user` और `es_password` पैरामीटर का उपयोग कर सकते हैं।

उदाहरण:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

आप एक `Elasticsearch` क्लाइंट ऑब्जेक्ट का भी उपयोग कर सकते हैं जो आपको अधिक लचीलापन प्रदान करता है, उदाहरण के लिए अधिकतम रीट्राई संख्या कॉन्फ़िगर करने के लिए।

उदाहरण:

```python
import elasticsearch
from langchain_elasticsearch import ElasticsearchStore

es_client= elasticsearch.Elasticsearch(
    hosts=["http://localhost:9200"],
    es_user="elastic",
    es_password="changeme"
    max_retries=10,
)

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    index_name="test_index",
    es_connection=es_client,
    embedding=embedding,
)
```

#### "elastic" उपयोगकर्ता के लिए पासवर्ड कैसे प्राप्त करें?

Elastic Cloud पासवर्ड प्राप्त करने के लिए:
1. https://cloud.elastic.co पर Elastic Cloud कंसोल में लॉग इन करें
2. "सुरक्षा" > "उपयोगकर्ता" पर जाएं
3. "elastic" उपयोगकर्ता को खोजें और "संपादित" करें
4. "पासवर्ड रीसेट" पर क्लिक करें
5. पासवर्ड रीसेट करने के लिए प्रॉम्प्ट का पालन करें

#### API कुंजी कैसे प्राप्त करें?

API कुंजी प्राप्त करने के लिए:
1. https://cloud.elastic.co पर Elastic Cloud कंसोल में लॉग इन करें
2. Kibana खोलें और Stack Management > API Keys पर जाएं
3. "API कुंजी बनाएं" पर क्लिक करें
4. API कुंजी के लिए एक नाम दर्ज करें और "बनाएं" पर क्लिक करें
5. API कुंजी कॉपी करें और `api_key` पैरामीटर में पेस्ट करें

### Elastic Cloud

Elastic Cloud पर Elasticsearch इंस्टांस से कनेक्ट करने के लिए, आप `es_cloud_id` पैरामीटर या `es_url` का उपयोग कर सकते हैं।

उदाहरण:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_cloud_id="<cloud_id>",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

`OpenAIEmbeddings` का उपयोग करने के लिए, हमें पर्यावरण में OpenAI API कुंजी कॉन्फ़िगर करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## मूल उदाहरण

इस उदाहरण में हम "state_of_the_union.txt" को TextLoader के माध्यम से लोड करेंगे, पाठ को 500 शब्द के टुकड़ों में विभाजित करेंगे, और फिर प्रत्येक टुकड़े को Elasticsearch में इंडेक्स करेंगे।

एक बार डेटा इंडेक्स हो जाने के बाद, हम "Ketanji Brown Jackson के बारे में राष्ट्रपति ने क्या कहा" जैसे क्वेरी के समान शीर्ष 4 टुकड़ों को खोजने के लिए एक सरल क्वेरी करते हैं।

Elasticsearch [Docker](#running-elasticsearch-via-docker) के माध्यम से स्थानीय होस्ट:9200 पर चल रहा है। Elastic Cloud से कनेक्ट करने के बारे में अधिक जानकारी के लिए, [प्रमाणीकरण के साथ कनेक्ट करना](#authentication) देखें।

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test-basic",
)

db.client.indices.refresh(index="test-basic")

query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
print(results)
```

```output
[Document(page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

# मेटाडेटा

`ElasticsearchStore` दस्तावेज़ के साथ मेटाडेटा को संग्रहीत करने का समर्थन करता है। यह मेटाडेटा डिक्शनरी ऑब्जेक्ट Elasticsearch दस्तावेज़ में एक मेटाडेटा ऑब्जेक्ट फ़ील्ड में संग्रहीत किया जाता है। मेटाडेटा मूल्य के आधार पर, Elasticsearch स्वचालित रूप से मैपिंग सेट करेगा क्योंकि मेटाडेटा मूल्य का डेटा प्रकार अनुमानित किया जाएगा। उदाहरण के लिए, यदि मेटाडेटा मूल्य एक स्ट्रिंग है, तो Elasticsearch मेटाडेटा ऑब्जेक्ट फ़ील्ड के लिए स्ट्रिंग प्रकार की मैपिंग सेट करेगा।

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

db = ElasticsearchStore.from_documents(
    docs, embeddings, es_url="http://localhost:9200", index_name="test-metadata"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

## मेटाडेटा फ़िल्टरिंग

दस्तावेज़ों में मेटाडेटा जोड़ने के साथ, आप क्वेरी समय पर मेटाडेटा फ़िल्टरिंग जोड़ सकते हैं।

### उदाहरण: सटीक कीवर्ड द्वारा फ़िल्टर करना

ध्यान दें: हम विश्लेषित नहीं किए गए कीवर्ड उपफ़ील्ड का उपयोग कर रहे हैं।

```python
docs = db.similarity_search(
    query, filter=[{"term": {"metadata.author.keyword": "John Doe"}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### उदाहरण: आंशिक मैच द्वारा फ़िल्टर करना

यह उदाहरण आंशिक मैच द्वारा फ़िल्टर करने का तरीका दिखाता है। यह तब उपयोगी है जब आप मेटाडेटा फ़ील्ड के सटीक मूल्य को नहीं जानते हैं। उदाहरण के लिए, यदि आप `author` मेटाडेटा फ़ील्ड द्वारा फ़िल्टर करना चाहते हैं और आप लेखक के सटीक मूल्य को नहीं जानते हैं, तो आप लेखक के अंतिम नाम द्वारा आंशिक मैच का उपयोग कर सकते हैं। फ़्यूज़ी मैचिंग भी समर्थित है।

"Jon" "John Doe" पर मैच करता है क्योंकि "Jon" "John" टोकन के लिए एक करीबी मैच है।

```python
docs = db.similarity_search(
    query,
    filter=[{"match": {"metadata.author": {"query": "Jon", "fuzziness": "AUTO"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### उदाहरण: तारीख रेंज द्वारा फ़िल्टर करना

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[{"range": {"metadata.date": {"gte": "2010-01-01"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### उदाहरण: संख्यात्मक रेंज द्वारा फ़िल्टर करना

```python
docs = db.similarity_search(
    "Any mention about Fred?", filter=[{"range": {"metadata.rating": {"gte": 2}}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### उदाहरण: भौगोलिक दूरी द्वारा फ़िल्टर करना

`metadata.geo_location` के लिए geo_point मैपिंग के साथ एक इंडेक्स की आवश्यकता होती है।

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[
        {
            "geo_distance": {
                "distance": "200km",
                "metadata.geo_location": {"lat": 40, "lon": -70},
            }
        }
    ],
)
print(docs[0].metadata)
```

फ़िल्टर उपरोक्त से कहीं अधिक प्रकार की क्वेरी का समर्थन करता है।

[दस्तावेज़ीकरण](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) में अधिक जानकारी पढ़ें।

# दूरी समानता एल्गोरिदम

Elasticsearch निम्नलिखित वेक्टर दूरी समानता एल्गोरिदम का समर्थन करता है:

- cosine
- euclidean
- dot_product

cosine समानता एल्गोरिदम डिफ़ॉल्ट है।

आप समानता एल्गोरिदम को similarity पैरामीटर के माध्यम से निर्दिष्ट कर सकते हैं।

**नोट**
पुनर्प्राप्ति रणनीति पर निर्भर करते हुए, समानता एल्गोरिदम को क्वेरी समय पर बदला नहीं जा सकता। इसे फ़ील्ड के लिए इंडेक्स मैपिंग बनाते समय सेट किया जाना चाहिए। यदि आप समानता एल्गोरिदम बदलना चाहते हैं, तो आपको इंडेक्स को हटाकर और सही distance_strategy के साथ इसे पुनः बनाना होगा।

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    distance_strategy="COSINE"
    # distance_strategy="EUCLIDEAN_DISTANCE"
    # distance_strategy="DOT_PRODUCT"
)

```

# पुनर्प्राप्ति रणनीतियाँ

Elasticsearch के पास अन्य वेक्टर केवल डेटाबेस की तुलना में एक व्यापक श्रृंखला की पुनर्प्राप्ति रणनीतियों का समर्थन करने की बड़ी क्षमता है। इस नोटबुक में हम `ElasticsearchStore` को कुछ सबसे आम पुनर्प्राप्ति रणनीतियों का समर्थन करने के लिए कॉन्फ़िगर करेंगे।

डिफ़ॉल्ट रूप से, `ElasticsearchStore` `ApproxRetrievalStrategy` का उपयोग करता है।

## ApproxRetrievalStrategy

यह क्वेरी वेक्टर के सबसे समान शीर्ष `k` वेक्टर को वापस करेगा। `k` पैरामीटर को `ElasticsearchStore` को इनिशियलाइज़ करते समय सेट किया जाता है। डिफ़ॉल्ट मान `10` है।

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(),
)

docs = db.similarity_search(
    query="What did the president say about Ketanji Brown Jackson?", k=10
)
```

### उदाहरण: हाइब्रिड के साथ Approx

यह उदाहरण दिखाएगा कि कैसे `ElasticsearchStore` को हाइब्रिड पुनर्प्राप्ति को करने के लिए कॉन्फ़िगर किया जाए, जो लगभग सेमांटिक खोज और कीवर्ड-आधारित खोज का संयोजन है।

हम दो पुनर्प्राप्ति विधियों से अलग-अलग स्कोर को संतुलित करने के लिए RRF का उपयोग करते हैं।

हाइब्रिड पुनर्प्राप्ति को सक्षम करने के लिए, हमें `ElasticsearchStore` `ApproxRetrievalStrategy` कंस्ट्रक्टर में `hybrid=True` सेट करना होगा।

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        hybrid=True,
    )
)
```

जब `hybrid` सक्षम होता है, तो किया गया क्वेरी लगभग सेमांटिक खोज और कीवर्ड-आधारित खोज का संयोजन होगा।

यह `rrf` (Reciprocal Rank Fusion) का उपयोग करेगा ताकि दो पुनर्प्राप्ति विधियों से अलग-अलग स्कोर को संतुलित किया जा सके।

**नोट** RRF के लिए Elasticsearch 8.9.0 या उससे अधिक की आवश्यकता है।

```json
{
    "knn": {
        "field": "vector",
        "filter": [],
        "k": 1,
        "num_candidates": 50,
        "query_vector": [1.0, ..., 0.0],
    },
    "query": {
        "bool": {
            "filter": [],
            "must": [{"match": {"text": {"query": "foo"}}}],
        }
    },
    "rank": {"rrf": {}},
}
```

### उदाहरण: Elasticsearch में एम्बेडिंग मॉडल के साथ Approx

यह उदाहरण दिखाएगा कि कैसे `ElasticsearchStore` को लगभग पुनर्प्राप्ति के लिए Elasticsearch में तैनात किए गए एम्बेडिंग मॉडल का उपयोग करने के लिए कॉन्फ़िगर किया जाए।

इसका उपयोग करने के लिए, `ElasticsearchStore` `ApproxRetrievalStrategy` कंस्ट्रक्टर में `query_model_id` तर्क के माध्यम से मॉडल_आईडी निर्दिष्ट करें।

**नोट** इसके लिए मॉडल को Elasticsearch ml नोड पर तैनात और चालू होना चाहिए। [नोटबुक उदाहरण](https://github.com/elastic/elasticsearch-labs/blob/main/notebooks/integrations/hugging-face/loading-model-from-hugging-face.md) देखें कि eland के साथ मॉडल कैसे तैनात किया जाए।

```python
APPROX_SELF_DEPLOYED_INDEX_NAME = "test-approx-self-deployed"

# Note: This does not have an embedding function specified
# Instead, we will use the embedding model deployed in Elasticsearch
db = ElasticsearchStore(
    es_cloud_id="<your cloud id>",
    es_user="elastic",
    es_password="<your password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Setup a Ingest Pipeline to perform the embedding
# of the text field
db.client.ingest.put_pipeline(
    id="test_pipeline",
    processors=[
        {
            "inference": {
                "model_id": "sentence-transformers__all-minilm-l6-v2",
                "field_map": {"query_field": "text_field"},
                "target_field": "vector_query_field",
            }
        }
    ],
)

# creating a new index with the pipeline,
# not relying on langchain to create the index
db.client.indices.create(
    index=APPROX_SELF_DEPLOYED_INDEX_NAME,
    mappings={
        "properties": {
            "text_field": {"type": "text"},
            "vector_query_field": {
                "properties": {
                    "predicted_value": {
                        "type": "dense_vector",
                        "dims": 384,
                        "index": True,
                        "similarity": "l2_norm",
                    }
                }
            },
        }
    },
    settings={"index": {"default_pipeline": "test_pipeline"}},
)

db.from_texts(
    ["hello world"],
    es_cloud_id="<cloud id>",
    es_user="elastic",
    es_password="<cloud password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Perform search
db.similarity_search("hello world", k=10)
```

## SparseVectorRetrievalStrategy (ELSER)

यह रणनीति Elasticsearch के स्पार्स वेक्टर पुनर्प्राप्ति का उपयोग करके शीर्ष-k परिणाम पुनर्प्राप्त करती है। हम अभी केवल अपने "ELSER" एम्बेडिंग मॉडल का समर्थन करते हैं।

**नोट** इसके लिए ELSER मॉडल को Elasticsearch ml नोड पर तैनात और चालू होना चाहिए।

इसका उपयोग करने के लिए, `ElasticsearchStore` कंस्ट्रक्टर में `SparseVectorRetrievalStrategy` निर्दिष्ट करें।

```python
# Note that this example doesn't have an embedding function. This is because we infer the tokens at index time and at query time within Elasticsearch.
# This requires the ELSER model to be loaded and running in Elasticsearch.
db = ElasticsearchStore.from_documents(
    docs,
    es_cloud_id="My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQ2OGJhMjhmNDc1M2Y0MWVjYTk2NzI2ZWNkMmE5YzRkNyQ3NWI4ODRjNWQ2OTU0MTYzODFjOTkxNmQ1YzYxMGI1Mw==",
    es_user="elastic",
    es_password="GgUPiWKwEzgHIYdHdgPk1Lwi",
    index_name="test-elser",
    strategy=ElasticsearchStore.SparseVectorRetrievalStrategy(),
)

db.client.indices.refresh(index="test-elser")

results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson", k=4
)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## ExactRetrievalStrategy

यह रणनीति Elasticsearch के सटीक पुनर्प्राप्ति (जिसे ब्रूट फ़ोर्स भी कहा जाता है) का उपयोग करके शीर्ष-k परिणाम पुनर्प्राप्त करती है।

इसका उपयोग करने के लिए, `ElasticsearchStore` कंस्ट्रक्टर में `ExactRetrievalStrategy` निर्दिष्ट करें।

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ExactRetrievalStrategy()
)
```

## BM25RetrievalStrategy

यह रणनीति उपयोगकर्ता को वेक्टर खोज के बिना शुद्ध BM25 का उपयोग करके खोज करने की अनुमति देती है।

इसका उपयोग करने के लिए, `ElasticsearchStore` कंस्ट्रक्टर में `BM25RetrievalStrategy` निर्दिष्ट करें।

नीचे दिए गए उदाहरण में, एम्बेडिंग विकल्प निर्दिष्ट नहीं है, जो इंगित करता है कि खोज एम्बेडिंग का उपयोग किए बिना की जाती है।

```python
from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    strategy=ElasticsearchStore.BM25RetrievalStrategy(),
)

db.add_texts(
    ["foo", "foo bar", "foo bar baz", "bar", "bar baz", "baz"],
)

results = db.similarity_search(query="foo", k=10)
print(results)
```

```output
[Document(page_content='foo'), Document(page_content='foo bar'), Document(page_content='foo bar baz')]
```

## क्वेरी को अनुकूलित करें

`custom_query` पैरामीटर के साथ खोज पर, आप Elasticsearch से दस्तावेज़ों को पुनर्प्राप्त करने के लिए उपयोग किए जाने वाले क्वेरी को समायोजित कर सकते हैं। यह तब उपयोगी है जब आप अधिक जटिल क्वेरी का उपयोग करना चाहते हैं, ताकि फ़ील्डों को रैखिक रूप से बढ़ाया जा सके।

```python
# Example of a custom query thats just doing a BM25 search on the text field.
def custom_query(query_body: dict, query: str):
    """Custom query to be used in Elasticsearch.
    Args:
        query_body (dict): Elasticsearch query body.
        query (str): Query string.
    Returns:
        dict: Elasticsearch query body.
    """
    print("Query Retriever created by the retrieval strategy:")
    print(query_body)
    print()

    new_query_body = {"query": {"match": {"text": query}}}

    print("Query thats actually used in Elasticsearch:")
    print(new_query_body)
    print()

    return new_query_body


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    custom_query=custom_query,
)
print("Results:")
print(results[0])
```

```output
Query Retriever created by the retrieval strategy:
{'query': {'bool': {'must': [{'text_expansion': {'vector.tokens': {'model_id': '.elser_model_1', 'model_text': 'What did the president say about Ketanji Brown Jackson'}}}], 'filter': []}}}

Query thats actually used in Elasticsearch:
{'query': {'match': {'text': 'What did the president say about Ketanji Brown Jackson'}}}

Results:
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

# दस्तावेज़ बिल्डर को अनुकूलित करें

`doc_builder` पैरामीटर के साथ खोज पर, आप Elasticsearch से प्राप्त डेटा का उपयोग करके दस्तावेज़ को बनाने के तरीके को समायोजित कर सकते हैं। यह तब विशेष रूप से उपयोगी है जब आपके पास ऐसे इंडेक्स हैं जो Langchain का उपयोग करके नहीं बनाए गए हैं।

```python
from typing import Dict

from langchain_core.documents import Document


def custom_document_builder(hit: Dict) -> Document:
    src = hit.get("_source", {})
    return Document(
        page_content=src.get("content", "Missing content!"),
        metadata={
            "page_number": src.get("page_number", -1),
            "original_filename": src.get("original_filename", "Missing filename!"),
        },
    )


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    doc_builder=custom_document_builder,
)
print("Results:")
print(results[0])
```

# अक्सर पूछे जाने वाले प्रश्न

## प्रश्न: मुझे Elasticsearch में दस्तावेजों को इंडेक्स करते समय टाइमआउट त्रुटियां मिल रही हैं। मैं इसे कैसे ठीक कर सकता हूं?

एक संभावित समस्या यह है कि आपके दस्तावेज़ Elasticsearch में इंडेक्स करने में अधिक समय ले सकते हैं। ElasticsearchStore Elasticsearch बल्क API का उपयोग करता है जिसमें कुछ डिफ़ॉल्ट हैं जिन्हें टाइमआउट त्रुटियों की संभावना को कम करने के लिए समायोजित किया जा सकता है।

यह SparseVectorRetrievalStrategy का उपयोग करते समय भी एक अच्छा विचार है।

डिफ़ॉल्ट हैं:
- `chunk_size`: 500
- `max_chunk_bytes`: 100MB

इन्हें समायोजित करने के लिए, आप ElasticsearchStore `add_texts` विधि में `chunk_size` और `max_chunk_bytes` पैरामीटर पास कर सकते हैं।

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# ElasticsearchStore में अपग्रेड करना

यदि आप पहले से ही अपने langchain आधारित प्रोजेक्ट में Elasticsearch का उपयोग कर रहे हैं, तो आप पुराने कार्यान्वयनों का उपयोग कर रहे हो सकते हैं: `ElasticVectorSearch` और `ElasticKNNSearch` जो अब डिप्रीकेट हो गए हैं। हमने एक नया कार्यान्वयन पेश किया है जिसे `ElasticsearchStore` कहा जाता है जो अधिक लचीला और उपयोग करने में आसान है। यह नोटबुक आपको नए कार्यान्वयन पर अपग्रेड करने की प्रक्रिया में मार्गदर्शन करेगा।

## नया क्या है?

नया कार्यान्वयन अब `ElasticsearchStore` नामक एक वर्ग है जिसका उपयोग लगभग, सटीक और ELSER खोज पुनर्प्राप्ति के लिए रणनीतियों के माध्यम से किया जा सकता है।

## मैं ElasticKNNSearch का उपयोग कर रहा हूं

पुराना कार्यान्वयन:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

नया कार्यान्वयन:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  # if you use the model_id
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( query_model_id="test_model" )
  # if you use hybrid search
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( hybrid=True )
)

```

## मैं ElasticVectorSearch का उपयोग कर रहा हूं

पुराना कार्यान्वयन:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

नया कार्यान्वयन:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  strategy=ElasticsearchStore.ExactRetrievalStrategy()
)

```

```python
db.client.indices.delete(
    index="test-metadata, test-elser, test-basic",
    ignore_unavailable=True,
    allow_no_indices=True,
)
```

```output
ObjectApiResponse({'acknowledged': True})
```
