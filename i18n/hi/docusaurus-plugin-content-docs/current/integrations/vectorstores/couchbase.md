---
translated: true
---

# Couchbase

[Couchbase](http://couchbase.com/) एक पुरस्कार-विजेता वितरित NoSQL क्लाउड डेटाबेस है जो अपने सभी क्लाउड, मोबाइल, AI और एज कंप्यूटिंग अनुप्रयोगों के लिए अतुलनीय बहुमुखी प्रदर्शन, स्केलेबिलिटी और वित्तीय मूल्य प्रदान करता है। Couchbase AI को अपनाता है जिसमें डेवलपर्स के लिए कोडिंग सहायता और उनके अनुप्रयोगों के लिए वेक्टर खोज शामिल है।

वेक्टर खोज [पूर्ण पाठ खोज सेवा](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html) (खोज सेवा) का एक हिस्सा है।

यह ट्यूटोरियल Couchbase में वेक्टर खोज का उपयोग करने की व्याख्या करता है। आप [Couchbase Capella](https://www.couchbase.com/products/capella/) और अपने स्वयं प्रबंधित Couchbase सर्वर दोनों के साथ काम कर सकते हैं।

## स्थापना

```python
%pip install --upgrade --quiet langchain langchain-openai couchbase
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## वेक्टर स्टोर और एम्बेडिंग आयात करें

```python
from langchain_community.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
```

## Couchbase कनेक्शन ऑब्जेक्ट बनाएं

हम पहले Couchbase क्लस्टर से कनेक्शन बनाते हैं और फिर क्लस्टर ऑब्जेक्ट को वेक्टर स्टोर को पास करते हैं।

यहां, हम उपयोगकर्ता नाम और पासवर्ड का उपयोग करके कनेक्ट कर रहे हैं। आप अपने क्लस्टर से कनेक्ट करने के लिए किसी भी अन्य समर्थित तरीके का भी उपयोग कर सकते हैं।

Couchbase क्लस्टर से कनेक्ट करने के बारे में अधिक जानकारी के लिए, कृपया [Python SDK दस्तावेज़ीकरण](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect) देखें।

```python
COUCHBASE_CONNECTION_STRING = (
    "couchbase://localhost"  # or "couchbases://localhost" if using TLS
)
DB_USERNAME = "Administrator"
DB_PASSWORD = "Password"
```

```python
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

auth = PasswordAuthenticator(DB_USERNAME, DB_PASSWORD)
options = ClusterOptions(auth)
cluster = Cluster(COUCHBASE_CONNECTION_STRING, options)

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

अब हम Couchbase क्लस्टर में वह बकेट, स्कोप और संग्रह नाम सेट करेंगे जिनका हम वेक्टर खोज के लिए उपयोग करना चाहते हैं।

इस उदाहरण के लिए, हम डिफ़ॉल्ट स्कोप और संग्रह का उपयोग कर रहे हैं।

```python
BUCKET_NAME = "testing"
SCOPE_NAME = "_default"
COLLECTION_NAME = "_default"
SEARCH_INDEX_NAME = "vector-index"
```

इस ट्यूटोरियल के लिए, हम OpenAI एम्बेडिंग का उपयोग करेंगे।

```python
embeddings = OpenAIEmbeddings()
```

## खोज इंडेक्स बनाएं

वर्तमान में, खोज इंडेक्स को Couchbase Capella या सर्वर UI से या REST इंटरफ़ेस का उपयोग करके बनाया जाना चाहिए।

चलो हम `vector-index` नाम के एक खोज इंडेक्स को परीक्षण बकेट पर परिभाषित करते हैं।

इस उदाहरण के लिए, हम UI पर खोज सेवा पर इंपोर्ट इंडेक्स सुविधा का उपयोग करेंगे।

हम `testing` बकेट के `_default` स्कोप पर `_default` संग्रह पर एक इंडेक्स परिभाषित कर रहे हैं, जिसमें `embedding` नामक 1536 आयामों का वेक्टर फ़ील्ड और `text` नामक पाठ फ़ील्ड है। हम दस्तावेज़ में `metadata` के तहत सभी फ़ील्डों को इंडेक्स और संग्रहीत कर रहे हैं, ताकि विभिन्न दस्तावेज़ संरचनाओं को ध्यान में रखा जा सके। समानता मीट्रिक `dot_product` पर सेट है।

### पूर्ण पाठ खोज सेवा में एक इंडेक्स कैसे आयात करें?

 - [Couchbase सर्वर](https://docs.couchbase.com/server/current/search/import-search-index.html)
     - खोज -> इंडेक्स जोड़ें -> आयात पर क्लिक करें
     - आयात स्क्रीन में निम्नलिखित इंडेक्स परिभाषा कॉपी करें
     - इंडेक्स बनाने के लिए Create Index पर क्लिक करें।
 - [Couchbase Capella](https://docs.couchbase.com/cloud/search/import-search-index.html)
     - इंडेक्स परिभाषा को एक नई फ़ाइल `index.json` में कॉपी करें
     - दस्तावेज़ में दिए गए निर्देशों का उपयोग करके Capella में फ़ाइल आयात करें।
     - इंडेक्स बनाने के लिए Create Index पर क्लिक करें।

### इंडेक्स परिभाषा

```json
{
 "name": "vector-index",
 "type": "fulltext-index",
 "params": {
  "doc_config": {
   "docid_prefix_delim": "",
   "docid_regexp": "",
   "mode": "type_field",
   "type_field": "type"
  },
  "mapping": {
   "default_analyzer": "standard",
   "default_datetime_parser": "dateTimeOptional",
   "default_field": "_all",
   "default_mapping": {
    "dynamic": true,
    "enabled": true,
    "properties": {
     "metadata": {
      "dynamic": true,
      "enabled": true
     },
     "embedding": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "dims": 1536,
        "index": true,
        "name": "embedding",
        "similarity": "dot_product",
        "type": "vector",
        "vector_index_optimized_for": "recall"
       }
      ]
     },
     "text": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "index": true,
        "name": "text",
        "store": true,
        "type": "text"
       }
      ]
     }
    }
   },
   "default_type": "_default",
   "docvalues_dynamic": false,
   "index_dynamic": true,
   "store_dynamic": true,
   "type_field": "_type"
  },
  "store": {
   "indexType": "scorch",
   "segmentVersion": 16
  }
 },
 "sourceType": "gocbcore",
 "sourceName": "testing",
 "sourceParams": {},
 "planParams": {
  "maxPartitionsPerPIndex": 103,
  "indexPartitions": 10,
  "numReplicas": 0
 }
}
```

वेक्टर फ़ील्ड के साथ एक खोज इंडेक्स कैसे बनाया जाए, इस बारे में अधिक जानकारी के लिए, कृपया दस्तावेज़ देखें।

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)

- [Couchbase सर्वर](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

## वेक्टर स्टोर बनाएं

हम क्लस्टर जानकारी और खोज इंडेक्स नाम के साथ वेक्टर स्टोर ऑब्जेक्ट बनाते हैं।

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
)
```

### पाठ और एम्बेडिंग फ़ील्ड निर्दिष्ट करें

आप `text_key` और `embedding_key` फ़ील्डों का उपयोग करके दस्तावेज़ के पाठ और एम्बेडिंग फ़ील्ड को वैकल्पिक रूप से निर्दिष्ट कर सकते हैं।

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
    text_key="text",
    embedding_key="embedding",
)
```

## मूलभूत वेक्टर खोज उदाहरण

इस उदाहरण के लिए, हम "state_of_the_union.txt" फ़ाइल को TextLoader के माध्यम से लोड करेंगे, पाठ को 500 वर्णों के टुकड़ों में विभाजित करेंगे और इन सभी टुकड़ों को Couchbase में इंडेक्स करेंगे।

डेटा को इंडेक्स करने के बाद, हम "Ketanji Brown Jackson के बारे में राष्ट्रपति ने क्या कहा" के प्रश्न के समान शीर्ष 4 टुकड़ों को खोजने के लिए एक सरल क्वेरी करेंगे।

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vector_store = CouchbaseVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    index_name=SEARCH_INDEX_NAME,
)
```

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## स्कोर के साथ समानता खोज

आप `similarity_search_with_score` विधि को कॉल करके परिणामों के लिए स्कोर प्राप्त कर सकते हैं।

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search_with_score(query)
document, score = results[0]
print(document)
print(f"Score: {score}")
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
Score: 0.8211871385574341
```

## वापस लाने के लिए फ़ील्ड निर्दिष्ट करना

आप `fields` पैरामीटर का उपयोग करके खोजों में वापस लाने के लिए फ़ील्ड निर्दिष्ट कर सकते हैं। ये फ़ील्ड `metadata` ऑब्जेक्ट में वापस लौटाए जाते हैं। आप खोज इंडेक्स में संग्रहीत किसी भी फ़ील्ड को पुनः प्राप्त कर सकते हैं। दस्तावेज़ का `text_key` `page_content` के भाग के रूप में वापस लौटाया जाता है।

यदि आप कोई भी फ़ील्ड वापस लाने का निर्देश नहीं देते हैं, तो इंडेक्स में संग्रहीत सभी फ़ील्ड वापस लौटाए जाते हैं।

यदि आप मेटाडेटा में किसी फ़ील्ड को वापस लाना चाहते हैं, तो आपको इसे `.` का उपयोग करके निर्दिष्ट करना होगा।

उदाहरण के लिए, मेटाडेटा में `source` फ़ील्ड को वापस लाने के लिए, आपको `metadata.source` निर्दिष्ट करना होगा।

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## हाइब्रिड खोज

Couchbase आपको वेक्टर खोज परिणामों को दस्तावेज़ के `metadata` जैसे गैर-वेक्टर फ़ील्डों पर किए गए खोजों के साथ संयोजित करके हाइब्रिड खोज करने की अनुमति देता है।

परिणाम वेक्टर खोज और खोज सेवा द्वारा समर्थित खोजों दोनों के परिणामों के संयोजन पर आधारित होंगे। प्रत्येक घटक खोज के स्कोर को जोड़कर कुल स्कोर प्राप्त किया जाता है।

हाइब्रिड खोज करने के लिए, एक वैकल्पिक पैरामीटर, `search_options` है जिसे सभी समानता खोजों में पास किया जा सकता है।
`search_options` के लिए विभिन्न खोज/क्वेरी संभावनाएं [यहां](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object) पाई जा सकती हैं।

### बहुविध मेटाडेटा का निर्माण हाइब्रिड खोज के लिए

हाइब्रिड खोज को शुरू करने के लिए, हम मौजूदा दस्तावेजों से कुछ यादृच्छिक मेटाडेटा बना सकते हैं।
हम एकसमान रूप से मेटाडेटा में तीन फ़ील्ड जोड़ते हैं, `date` 2010 और 2020 के बीच, `rating` 1 और 5 के बीच और `author` को या तो John Doe या Jane Doe पर सेट करते हैं।

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

vector_store.add_documents(docs)

query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0].metadata)
```

```output
{'author': 'John Doe', 'date': '2016-01-01', 'rating': 2, 'source': '../../modules/state_of_the_union.txt'}
```

### उदाहरण: सटीक मूल्य द्वारा खोज

हम `metadata` ऑब्जेक्ट में लेखात्मक फ़ील्ड जैसे लेखक पर सटीक मैच खोज सकते हैं।

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={"query": {"field": "metadata.author", "match": "John Doe"}},
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.' metadata={'author': 'John Doe'}
```

### उदाहरण: आंशिक मैच द्वारा खोज

हम खोज क्वेरी में थोड़ी सी अस्पष्टता निर्दिष्ट करके आंशिक मैच खोज कर सकते हैं। यह तब उपयोगी है जब आप खोज क्वेरी के थोड़े बदलावों या गलत वर्तनी की खोज करना चाहते हैं।

यहाँ, "Jae" "Jane" के करीब (1 अस्पष्टता) है।

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {"field": "metadata.author", "match": "Jae", "fuzziness": 1}
    },
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.' metadata={'author': 'Jane Doe'}
```

### उदाहरण: तारीख सीमा क्वेरी द्वारा खोज

हम `metadata.date` जैसे तारीख फ़ील्ड पर तारीख सीमा क्वेरी के अंतर्गत दस्तावेजों की खोज कर सकते हैं।

```python
query = "Any mention about independence?"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {
            "start": "2016-12-31",
            "end": "2017-01-02",
            "inclusive_start": True,
            "inclusive_end": False,
            "field": "metadata.date",
        }
    },
)
print(results[0])
```

```output
page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.' metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}
```

### उदाहरण: संख्यात्मक सीमा क्वेरी द्वारा खोज

हम `metadata.rating` जैसे संख्यात्मक फ़ील्ड के लिए सीमा क्वेरी के अंतर्गत दस्तावेजों की खोज कर सकते हैं।

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "min": 3,
            "max": 5,
            "inclusive_min": True,
            "inclusive_max": True,
            "field": "metadata.rating",
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 0.9000703597577832)
```

### उदाहरण: कई खोज क्वेरियों का संयोजन

विभिन्न खोज क्वेरियों को AND (संयुक्त) या OR (विभाजित) ऑपरेटरों का उपयोग करके संयुक्त किया जा सकता है।

इस उदाहरण में, हम 3 और 4 के बीच रेटिंग वाले और 2015 और 2018 के बीच की तारीख वाले दस्तावेजों की जाँच कर रहे हैं।

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "conjuncts": [
                {"min": 3, "max": 4, "inclusive_max": True, "field": "metadata.rating"},
                {"start": "2016-12-31", "end": "2017-01-02", "field": "metadata.date"},
            ]
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 1.3598770370389914)
```

### अन्य क्वेरी

इसी तरह, आप `search_options` पैरामीटर में समर्थित किसी भी क्वेरी विधि का उपयोग कर सकते हैं जैसे भौगोलिक दूरी, बहुभुज खोज, वाइल्डकार्ड, नियमित अभिव्यक्तियाँ आदि। अधिक विवरण के लिए कृपया प्रलेखन देखें।

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

# अक्सर पूछे जाने वाले प्रश्न

## प्रश्न: क्या मुझे CouchbaseVectorStore ऑब्जेक्ट बनाने से पहले खोज सूचकांक बनाना चाहिए?

हाँ, वर्तमान में आपको `CouchbaseVectorStore` ऑब्जेक्ट बनाने से पहले खोज सूचकांक बनाना होगा।

## प्रश्न: मैं अपने खोज परिणामों में सभी फ़ील्ड नहीं देख रहा हूं।

Couchbase में, हम केवल खोज सूचकांक में संग्रहीत फ़ील्ड ही वापस कर सकते हैं। कृपया सुनिश्चित करें कि आप खोज परिणामों में पहुंचने का प्रयास कर रहे फ़ील्ड खोज सूचकांक का हिस्सा है।

इस समस्या को संभालने का एक तरीका है कि आप दस्तावेज के फ़ील्ड को सूचकांक में गतिशील रूप से सूचीबद्ध और संग्रहीत करें।

- Capella में, आपको "Advanced Mode" पर जाना होगा, फिर "General Settings" चेवरॉन के नीचे "[X] Store Dynamic Fields" या "[X] Index Dynamic Fields" चेक करना होगा।
- Couchbase Server में, Index Editor (Quick Editor नहीं) में "Advanced" चेवरॉन के नीचे "[X] Store Dynamic Fields" या "[X] Index Dynamic Fields" चेक करना होगा।

ध्यान दें कि इन विकल्पों से सूचकांक का आकार बढ़ जाएगा।

गतिशील मैपिंग के बारे में अधिक जानकारी के लिए, कृपया [प्रलेखन](https://docs.couchbase.com/cloud/search/customize-index.html) देखें।

## प्रश्न: मुझे अपने खोज परिणामों में metadata ऑब्जेक्ट नहीं दिख रहा है।

यह सबसे अधिक संभावना है कि दस्तावेज में `metadata` फ़ील्ड को Couchbase खोज सूचकांक द्वारा सूचीबद्ध और/या संग्रहीत नहीं किया गया है। `metadata` फ़ील्ड को सूचकांक में सूचीबद्ध करने के लिए, आपको इसे एक चाइल्ड मैपिंग के रूप में जोड़ना होगा।

यदि आप मैपिंग में सभी फ़ील्ड को मैप करने का चयन करते हैं, तो आप सभी मेटाडेटा फ़ील्डों द्वारा खोज कर सकेंगे। वैकल्पिक रूप से, सूचकांक को अनुकूलित करने के लिए, आप `metadata` ऑब्जेक्ट के भीतर विशिष्ट फ़ील्डों को सूचीबद्ध करने का चयन कर सकते हैं। चाइल्ड मैपिंग सूचीबद्ध करने के बारे में अधिक जानने के लिए आप [दस्तावेज](https://docs.couchbase.com/cloud/search/customize-index.html) देख सकते हैं।

चाइल्ड मैपिंग बनाना

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)
