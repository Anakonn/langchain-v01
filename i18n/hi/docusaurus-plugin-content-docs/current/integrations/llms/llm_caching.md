---
translated: true
---

# LLM कैशिंग एकीकरण

यह नोटबुक विभिन्न कैशों का उपयोग करके व्यक्तिगत LLM कॉल के परिणामों को कैश करने के तरीके को कवर करती है।

```python
from langchain.globals import set_llm_cache
from langchain_openai import OpenAI

# To make the caching really obvious, lets use a slower model.
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2)
```

## `In Memory` Cache

```python
from langchain.cache import InMemoryCache

set_llm_cache(InMemoryCache())
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 52.2 ms, sys: 15.2 ms, total: 67.4 ms
Wall time: 1.19 s
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was...two tired!"
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 191 µs, sys: 11 µs, total: 202 µs
Wall time: 205 µs
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was...two tired!"
```

## `SQLite` Cache

```python
!rm .langchain.db
```

```python
# We can do the same thing with a SQLite cache
from langchain.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 33.2 ms, sys: 18.1 ms, total: 51.2 ms
Wall time: 667 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 4.86 ms, sys: 1.97 ms, total: 6.83 ms
Wall time: 5.79 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

## `Upstash Redis` Cache

### Standard Cache

[Upstash Redis](https://upstash.com) का उपयोग सर्वरलेस HTTP API के साथ प्रॉम्प्ट्स और प्रतिक्रियाओं को कैश करने के लिए करें।

```python
import langchain
from langchain.cache import UpstashRedisCache
from upstash_redis import Redis

URL = "<UPSTASH_REDIS_REST_URL>"
TOKEN = "<UPSTASH_REDIS_REST_TOKEN>"

langchain.llm_cache = UpstashRedisCache(redis_=Redis(url=URL, token=TOKEN))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 7.56 ms, sys: 2.98 ms, total: 10.5 ms
Wall time: 1.14 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 2.78 ms, sys: 1.95 ms, total: 4.73 ms
Wall time: 82.9 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

## `Redis` Cache

### Standard Cache

[Redis](/docs/integrations/providers/redis) का उपयोग प्रॉम्प्ट्स और प्रतिक्रियाओं को कैश करने के लिए करें।

```python
# We can do the same thing with a Redis cache
# (make sure your local Redis instance is running first before running this example)
from langchain.cache import RedisCache
from redis import Redis

set_llm_cache(RedisCache(redis_=Redis()))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 6.88 ms, sys: 8.75 ms, total: 15.6 ms
Wall time: 1.04 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 1.59 ms, sys: 610 µs, total: 2.2 ms
Wall time: 5.58 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

### Semantic Cache

[Redis](/docs/integrations/providers/redis) का उपयोग प्रॉम्प्ट्स और प्रतिक्रियाओं को कैश करने के लिए करें और हिट्स का मूल्यांकन करें जो सिमेंटिक समानता पर आधारित हों।

```python
from langchain.cache import RedisSemanticCache
from langchain_openai import OpenAIEmbeddings

set_llm_cache(
    RedisSemanticCache(redis_url="redis://localhost:6379", embedding=OpenAIEmbeddings())
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 351 ms, sys: 156 ms, total: 507 ms
Wall time: 3.37 s
```

```output
"\n\nWhy don't scientists trust atoms?\nBecause they make up everything."
```

```python
%%time
# The second time, while not a direct hit, the question is semantically similar to the original question,
# so it uses the cached result!
llm("Tell me one joke")
```

```output
CPU times: user 6.25 ms, sys: 2.72 ms, total: 8.97 ms
Wall time: 262 ms
```

```output
"\n\nWhy don't scientists trust atoms?\nBecause they make up everything."
```

## `GPTCache`

हम [GPTCache](https://github.com/zilliztech/GPTCache) का उपयोग सटीक मिलान कैशिंग के लिए कर सकते हैं या सिमेंटिक समानता के आधार पर परिणामों को कैश करने के लिए कर सकते हैं।

आइए पहले सटीक मिलान के एक उदाहरण से शुरू करें

```python
import hashlib

from gptcache import Cache
from gptcache.manager.factory import manager_factory
from gptcache.processor.pre import get_prompt
from langchain.cache import GPTCache


def get_hashed_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def init_gptcache(cache_obj: Cache, llm: str):
    hashed_llm = get_hashed_name(llm)
    cache_obj.init(
        pre_embedding_func=get_prompt,
        data_manager=manager_factory(manager="map", data_dir=f"map_cache_{hashed_llm}"),
    )


set_llm_cache(GPTCache(init_gptcache))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 21.5 ms, sys: 21.3 ms, total: 42.8 ms
Wall time: 6.2 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 571 µs, sys: 43 µs, total: 614 µs
Wall time: 635 µs
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

अब आइए समानता कैशिंग के एक उदाहरण को दिखाते हैं

```python
import hashlib

from gptcache import Cache
from gptcache.adapter.api import init_similar_cache
from langchain.cache import GPTCache


def get_hashed_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def init_gptcache(cache_obj: Cache, llm: str):
    hashed_llm = get_hashed_name(llm)
    init_similar_cache(cache_obj=cache_obj, data_dir=f"similar_cache_{hashed_llm}")


set_llm_cache(GPTCache(init_gptcache))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 1.42 s, sys: 279 ms, total: 1.7 s
Wall time: 8.44 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# This is an exact match, so it finds it in the cache
llm("Tell me a joke")
```

```output
CPU times: user 866 ms, sys: 20 ms, total: 886 ms
Wall time: 226 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# This is not an exact match, but semantically within distance so it hits!
llm("Tell me joke")
```

```output
CPU times: user 853 ms, sys: 14.8 ms, total: 868 ms
Wall time: 224 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

## `Momento` Cache

प्रॉम्प्ट्स और प्रतिक्रियाओं को कैश करने के लिए [Momento](/docs/integrations/providers/momento) का उपयोग करें।

प्रयोग करने के लिए Momento की आवश्यकता होती है, इंस्टॉल करने के लिए नीचे अनकमेंट करें:

```python
%pip install --upgrade --quiet  momento
```

इस वर्ग का उपयोग करने के लिए आपको एक Momento ऑथ टोकन प्राप्त करना होगा। इसे या तो सीधे एक momento.CacheClient में पास किया जा सकता है यदि आप इसे सीधे इंस्टैंशिएट करना चाहते हैं, या एक नामित पैरामीटर `auth_token` के रूप में `MomentoChatMessageHistory.from_client_params` में, या बस इसे एक पर्यावरण चर `MOMENTO_AUTH_TOKEN` के रूप में सेट कर सकते हैं।

```python
from datetime import timedelta

from langchain.cache import MomentoCache

cache_name = "langchain"
ttl = timedelta(days=1)
set_llm_cache(MomentoCache.from_client_params(cache_name, ttl))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 40.7 ms, sys: 16.5 ms, total: 57.2 ms
Wall time: 1.73 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
# When run in the same region as the cache, latencies are single digit ms
llm("Tell me a joke")
```

```output
CPU times: user 3.16 ms, sys: 2.98 ms, total: 6.14 ms
Wall time: 57.9 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

## `SQLAlchemy` Cache

आप किसी भी SQL डेटाबेस के साथ `SQLAlchemyCache` का उपयोग कैश करने के लिए कर सकते हैं जिसे `SQLAlchemy` द्वारा समर्थित किया गया हो।

```python
# from langchain.cache import SQLAlchemyCache
# from sqlalchemy import create_engine

# engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")
# set_llm_cache(SQLAlchemyCache(engine))
```

### Custom SQLAlchemy Schemas

```python
# You can define your own declarative SQLAlchemyCache child class to customize the schema used for caching. For example, to support high-speed fulltext prompt indexing with Postgres, use:

from langchain.cache import SQLAlchemyCache
from sqlalchemy import Column, Computed, Index, Integer, Sequence, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy_utils import TSVectorType

Base = declarative_base()


class FulltextLLMCache(Base):  # type: ignore
    """Postgres table for fulltext-indexed LLM Cache"""

    __tablename__ = "llm_cache_fulltext"
    id = Column(Integer, Sequence("cache_id"), primary_key=True)
    prompt = Column(String, nullable=False)
    llm = Column(String, nullable=False)
    idx = Column(Integer)
    response = Column(String)
    prompt_tsv = Column(
        TSVectorType(),
        Computed("to_tsvector('english', llm || ' ' || prompt)", persisted=True),
    )
    __table_args__ = (
        Index("idx_fulltext_prompt_tsv", prompt_tsv, postgresql_using="gin"),
    )


engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")
set_llm_cache(SQLAlchemyCache(engine, FulltextLLMCache))
```

## `Cassandra` caches

आप CQL के माध्यम से Cassandra / Astra DB का उपयोग करके LLM प्रतिक्रियाओं को कैश कर सकते हैं, सटीक-मिलान `CassandraCache` या (वेक्टर-समानता-आधारित) `CassandraSemanticCache` में से चुन सकते हैं।

आइए निम्नलिखित कोशिकाओं में दोनों का प्रदर्शन करें।

#### DB से कनेक्ट करें

सबसे पहले आपको DB के साथ एक `Session` स्थापित करने की आवश्यकता है और कैश टेबल(रों) के लिए एक _keyspace_ निर्दिष्ट करनी होगी। निम्नलिखित आपको CQL के माध्यम से Astra DB से कनेक्ट करता है (देखें जैसे [यहां](https://cassio.org/start_here/#vector-database) अधिक बैकएंड और कनेक्शन विकल्पों के लिए)।

```python
import getpass

keyspace = input("\nKeyspace name? ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
```

```output

Keyspace name? my_keyspace

Astra DB Token ("AstraCS:...") ········
Full path to your Secure Connect Bundle? /path/to/secure-connect-databasename.zip
```

```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

cluster = Cluster(
    cloud={
        "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
    },
    auth_provider=PlainTextAuthProvider("token", ASTRA_DB_APPLICATION_TOKEN),
)
session = cluster.connect()
```

### Exact cache

यह तब LLM को आह्वान करने से बचाएगा जब प्रदान किया गया प्रॉम्प्ट पहले से ही सामना किए गए समान हो:

```python
from langchain.cache import CassandraCache
from langchain.globals import set_llm_cache

set_llm_cache(CassandraCache(session=session, keyspace=keyspace))
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked to Earth.
CPU times: user 41.7 ms, sys: 153 µs, total: 41.8 ms
Wall time: 1.96 s
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked to Earth.
CPU times: user 4.09 ms, sys: 0 ns, total: 4.09 ms
Wall time: 119 ms
```

### Semantic cache

यह कैश एक सिमेंटिक समानता खोज करेगा और एक हिट वापस करेगा यदि यह पाता है कि कैश की गई प्रविष्टि पर्याप्त समान है। इसके लिए, आपको अपनी पसंद की एक `Embeddings` इंस्टेंस प्रदान करने की आवश्यकता होती है।

```python
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
```

```python
from langchain.cache import CassandraSemanticCache

set_llm_cache(
    CassandraSemanticCache(
        session=session,
        keyspace=keyspace,
        embedding=embedding,
        table_name="cass_sem_cache",
    )
)
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked with Earth. This means that the same side of the Moon always faces Earth.
CPU times: user 21.3 ms, sys: 177 µs, total: 21.4 ms
Wall time: 3.09 s
```

```python
%%time

print(llm.invoke("How come we always see one face of the moon?"))
```

```output


The Moon always shows the same side because it is tidally locked with Earth. This means that the same side of the Moon always faces Earth.
CPU times: user 10.9 ms, sys: 17 µs, total: 10.9 ms
Wall time: 461 ms
```

#### Attribution statement

>Apache Cassandra, Cassandra और Apache संयुक्त राज्य अमेरिका और/या अन्य देशों में [Apache Software Foundation](http://www.apache.org/) के पंजीकृत ट्रेडमार्क या ट्रेडमार्क हैं।

## `Astra DB` Caches

आप आसानी से [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) का उपयोग एक LLM कैश के रूप में कर सकते हैं, चाहे वह "सटीक" हो या "सिमेंटिक-आधारित" कैश।

सुनिश्चित करें कि आपके पास एक चल रहा डेटाबेस है (सिमेंटिक कैश का उपयोग करने के लिए इसे एक वेक्टर-सक्षम डेटाबेस होना चाहिए) और अपने Astra डैशबोर्ड पर आवश्यक क्रेडेंशियल प्राप्त करें:

- API एंडपॉइंट इस प्रकार दिखता है `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
- टोकन इस प्रकार दिखता है `AstraCS:6gBhNmsk135....`

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

### Astra DB exact LLM cache

यह तब LLM को आह्वान करने से बचाएगा जब प्रदान किया गया प्रॉम्प्ट पहले से ही सामना किए गए समान हो:

```python
from langchain.cache import AstraDBCache
from langchain.globals import set_llm_cache

set_llm_cache(
    AstraDBCache(
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        token=ASTRA_DB_APPLICATION_TOKEN,
    )
)
```

```python
%%time

print(llm.invoke("Is a true fakery the same as a fake truth?"))
```

```output


There is no definitive answer to this question as it depends on the interpretation of the terms "true fakery" and "fake truth". However, one possible interpretation is that a true fakery is a counterfeit or imitation that is intended to deceive, whereas a fake truth is a false statement that is presented as if it were true.
CPU times: user 70.8 ms, sys: 4.13 ms, total: 74.9 ms
Wall time: 2.06 s
```

```python
%%time

print(llm.invoke("Is a true fakery the same as a fake truth?"))
```

```output


There is no definitive answer to this question as it depends on the interpretation of the terms "true fakery" and "fake truth". However, one possible interpretation is that a true fakery is a counterfeit or imitation that is intended to deceive, whereas a fake truth is a false statement that is presented as if it were true.
CPU times: user 15.1 ms, sys: 3.7 ms, total: 18.8 ms
Wall time: 531 ms
```

### Astra DB Semantic cache

यह कैश एक सिमेंटिक समानता खोज करेगा और एक हिट वापस करेगा यदि यह पाता है कि कैश की गई प्रविष्टि पर्याप्त समान है। इसके लिए, आपको अपनी पसंद की एक `Embeddings` इंस्टेंस प्रदान करने की आवश्यकता होती है।

```python
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
```

```python
from langchain.cache import AstraDBSemanticCache

set_llm_cache(
    AstraDBSemanticCache(
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        token=ASTRA_DB_APPLICATION_TOKEN,
        embedding=embedding,
        collection_name="demo_semantic_cache",
    )
)
```

```python
%%time

print(llm.invoke("Are there truths that are false?"))
```

```output


There is no definitive answer to this question since it presupposes a great deal about the nature of truth itself, which is a matter of considerable philosophical debate. It is possible, however, to construct scenarios in which something could be considered true despite being false, such as if someone sincerely believes something to be true even though it is not.
CPU times: user 65.6 ms, sys: 15.3 ms, total: 80.9 ms
Wall time: 2.72 s
```

```python
%%time

print(llm.invoke("Is is possible that something false can be also true?"))
```

```output


There is no definitive answer to this question since it presupposes a great deal about the nature of truth itself, which is a matter of considerable philosophical debate. It is possible, however, to construct scenarios in which something could be considered true despite being false, such as if someone sincerely believes something to be true even though it is not.
CPU times: user 29.3 ms, sys: 6.21 ms, total: 35.5 ms
Wall time: 1.03 s
```

## Azure Cosmos DB Semantic Cache

आप इस एकीकृत [vector database](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database) का उपयोग कैशिंग के लिए कर सकते हैं।

```python
from langchain_community.cache import AzureCosmosDBSemanticCache
from langchain_community.vectorstores.azure_cosmos_db import (
    CosmosDBSimilarityType,
    CosmosDBVectorSearchType,
)
from langchain_openai import OpenAIEmbeddings

# Read more about Azure CosmosDB Mongo vCore vector search here https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search

NAMESPACE = "langchain_test_db.langchain_test_collection"
CONNECTION_STRING = (
    "Please provide your azure cosmos mongo vCore vector db connection string"
)

DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")

# Default value for these params
num_lists = 3
dimensions = 1536
similarity_algorithm = CosmosDBSimilarityType.COS
kind = CosmosDBVectorSearchType.VECTOR_IVF
m = 16
ef_construction = 64
ef_search = 40
score_threshold = 0.9
application_name = "LANGCHAIN_CACHING_PYTHON"


set_llm_cache(
    AzureCosmosDBSemanticCache(
        cosmosdb_connection_string=CONNECTION_STRING,
        cosmosdb_client=None,
        embedding=OpenAIEmbeddings(),
        database_name=DB_NAME,
        collection_name=COLLECTION_NAME,
        num_lists=num_lists,
        similarity=similarity_algorithm,
        kind=kind,
        dimensions=dimensions,
        m=m,
        ef_construction=ef_construction,
        ef_search=ef_search,
        score_threshold=score_threshold,
        application_name=application_name,
    )
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 45.6 ms, sys: 19.7 ms, total: 65.3 ms
Wall time: 2.29 s
```

```output
'\n\nWhy was the math book sad? Because it had too many problems.'
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 9.61 ms, sys: 3.42 ms, total: 13 ms
Wall time: 474 ms
```

```output
'\n\nWhy was the math book sad? Because it had too many problems.'
```

## `Elasticsearch` Cache

Elasticsearch का उपयोग करने वाला LLMs के लिए एक कैशिंग लेयर।

पहले Elasticsearch के साथ LangChain एकीकरण इंस्टॉल करें।

```python
%pip install -U langchain-elasticsearch
```

क्लास `ElasticsearchCache` का उपयोग करें।

सरल उदाहरण:

```python
from elasticsearch import Elasticsearch
from langchain.globals import set_llm_cache
from langchain_elasticsearch import ElasticsearchCache

es_client = Elasticsearch(hosts="http://localhost:9200")
set_llm_cache(
    ElasticsearchCache(
        es_connection=es_client,
        index_name="llm-chat-cache",
        metadata={"project": "my_chatgpt_project"},
    )
)
```

`index_name` पैरामीटर भी उपनामों को स्वीकार कर सकता है। यह उपयोग करने की अनुमति देता है
[ILM: Manage the index lifecycle](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html)
जिसे हम प्रतिधारण प्रबंधन और कैश वृद्धि को नियंत्रित करने के लिए विचार करने का सुझाव देते हैं।

सभी पैरामीटर के लिए क्लास docstring देखें।

### उत्पन्न पाठ को अनुक्रमित करें

कैश किया गया डेटा डिफ़ॉल्ट रूप से खोज योग्य नहीं होगा।
डेवलपर Elasticsearch दस्तावेज़ के निर्माण को कस्टमाइज़ कर सकता है ताकि अनुक्रमित पाठ फ़ील्ड्स को जोड़ा जा सके,
जिनमें, उदाहरण के लिए, LLM द्वारा उत्पन्न पाठ रखा जा सके।

यह सबक्लासिंग एंड ओवरराइडिंग विधियों द्वारा किया जा सकता है।
नई कैश क्लास को पूर्व-मौजूदा कैश इंडेक्स पर भी लागू किया जा सकता है:

```python
import json
from typing import Any, Dict, List

from elasticsearch import Elasticsearch
from langchain.globals import set_llm_cache
from langchain_core.caches import RETURN_VAL_TYPE
from langchain_elasticsearch import ElasticsearchCache


class SearchableElasticsearchCache(ElasticsearchCache):
    @property
    def mapping(self) -> Dict[str, Any]:
        mapping = super().mapping
        mapping["mappings"]["properties"]["parsed_llm_output"] = {
            "type": "text",
            "analyzer": "english",
        }
        return mapping

    def build_document(
        self, prompt: str, llm_string: str, return_val: RETURN_VAL_TYPE
    ) -> Dict[str, Any]:
        body = super().build_document(prompt, llm_string, return_val)
        body["parsed_llm_output"] = self._parse_output(body["llm_output"])
        return body

    @staticmethod
    def _parse_output(data: List[str]) -> List[str]:
        return [
            json.loads(output)["kwargs"]["message"]["kwargs"]["content"]
            for output in data
        ]


es_client = Elasticsearch(hosts="http://localhost:9200")
set_llm_cache(
    SearchableElasticsearchCache(es_connection=es_client, index_name="llm-chat-cache")
)
```

मैपिंग और दस्तावेज़ निर्माण को ओवरराइड करते समय,
कृपया केवल अतिरिक्त संशोधन करें, बेस मैपिंग को अपरिवर्तित रखें।

## वैकल्पिक कैशिंग

आप चाहें तो विशेष LLMs के लिए कैशिंग को भी बंद कर सकते हैं। नीचे दिए गए उदाहरण में, यहां तक कि जब वैश्विक कैशिंग सक्षम है, हम इसे एक विशेष LLM के लिए बंद कर देते हैं

```python
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2, cache=False)
```

```python
%%time
llm("Tell me a joke")
```

```output
CPU times: user 5.8 ms, sys: 2.71 ms, total: 8.51 ms
Wall time: 745 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
llm("Tell me a joke")
```

```output
CPU times: user 4.91 ms, sys: 2.64 ms, total: 7.55 ms
Wall time: 623 ms
```

```output
'\n\nTwo guys stole a calendar. They got six months each.'
```

## Chains में वैकल्पिक कैशिंग

आप चेन में विशेष नोड्स के लिए भी कैशिंग को बंद कर सकते हैं। ध्यान दें कि कुछ इंटरफेस के कारण, चेन का निर्माण पहले करना और फिर LLM को संपादित करना अक्सर आसान होता है।

उदाहरण के रूप में, हम एक समरीज़र मैप-रिड्यूस चेन लोड करेंगे। हम मैप-स्टेप के लिए परिणामों को कैश करेंगे, लेकिन फिर इसे संयोजन चरण के लिए फ्रीज नहीं करेंगे।

```python
llm = OpenAI(model_name="gpt-3.5-turbo-instruct")
no_cache_llm = OpenAI(model_name="gpt-3.5-turbo-instruct", cache=False)
```

```python
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter()
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
texts = text_splitter.split_text(state_of_the_union)
```

```python
from langchain_community.docstore.document import Document

docs = [Document(page_content=t) for t in texts[:3]]
from langchain.chains.summarize import load_summarize_chain
```

```python
chain = load_summarize_chain(llm, chain_type="map_reduce", reduce_llm=no_cache_llm)
```

```python
%%time
chain.run(docs)
```

```output
CPU times: user 452 ms, sys: 60.3 ms, total: 512 ms
Wall time: 5.09 s
```

```output
'\n\nPresident Biden is discussing the American Rescue Plan and the Bipartisan Infrastructure Law, which will create jobs and help Americans. He also talks about his vision for America, which includes investing in education and infrastructure. In response to Russian aggression in Ukraine, the United States is joining with European allies to impose sanctions and isolate Russia. American forces are being mobilized to protect NATO countries in the event that Putin decides to keep moving west. The Ukrainians are bravely fighting back, but the next few weeks will be hard for them. Putin will pay a high price for his actions in the long run. Americans should not be alarmed, as the United States is taking action to protect its interests and allies.'
```

जब हम इसे फिर से चलाते हैं, तो हम देखते हैं कि यह काफी तेज़ी से चलता है लेकिन अंतिम उत्तर अलग होता है। ऐसा मैप स्टेप्स पर कैशिंग के कारण होता है, लेकिन रिड्यूस स्टेप पर नहीं।

```python
%%time
chain.run(docs)
```

```output
CPU times: user 11.5 ms, sys: 4.33 ms, total: 15.8 ms
Wall time: 1.04 s
```

```output
'\n\nPresident Biden is discussing the American Rescue Plan and the Bipartisan Infrastructure Law, which will create jobs and help Americans. He also talks about his vision for America, which includes investing in education and infrastructure.'
```

```python
!rm .langchain.db sqlite.db
```

## OpenSearch Semantic Cache

प्रॉम्प्ट्स और प्रतिक्रियाओं को कैश करने और सिमेंटिक समानता के आधार पर हिट्स का मूल्यांकन करने के लिए [OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch/) का एक सिमेंटिक कैश के रूप में उपयोग करें।

```python
from langchain_community.cache import OpenSearchSemanticCache
from langchain_openai import OpenAIEmbeddings

set_llm_cache(
    OpenSearchSemanticCache(
        opensearch_url="http://localhost:9200", embedding=OpenAIEmbeddings()
    )
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 39.4 ms, sys: 11.8 ms, total: 51.2 ms
Wall time: 1.55 s
```

```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything."
```

```python
%%time
# The second time, while not a direct hit, the question is semantically similar to the original question,
# so it uses the cached result!
llm("Tell me one joke")
```

```output
CPU times: user 4.66 ms, sys: 1.1 ms, total: 5.76 ms
Wall time: 113 ms
```

```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything."
```
