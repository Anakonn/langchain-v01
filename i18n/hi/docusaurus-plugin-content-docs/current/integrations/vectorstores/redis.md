---
translated: true
---

# Redis

>[Redis vector database](https://redis.io/docs/get-started/vector-database/) परिचय और लैंगचेन एकीकरण गाइड।

## Redis क्या है?

अधिकांश डेवलपर्स जो वेब सेवाओं की पृष्ठभूमि से आते हैं, `Redis` से परिचित होते हैं। अपने मूल में, `Redis` एक ओपन-सोर्स कुंजी-मूल्य स्टोर है जिसका उपयोग कैश, संदेश ब्रोकरे और डेटाबेस के रूप में किया जाता है। डेवलपर्स `Redis` को चुनते हैं क्योंकि यह तेज़ है, इसमें क्लाइंट पुस्तकालयों का बड़ा पारिस्थितिकी तंत्र है, और इसे प्रमुख उद्यमों द्वारा वर्षों से तैनात किया गया है।

इन पारंपरिक उपयोग मामलों के शीर्ष पर, `Redis` अतिरिक्त क्षमताएं प्रदान करता है जैसे कि खोज और क्वेरी क्षमता जो उपयोगकर्ताओं को `Redis` के भीतर द्वितीयक अनुक्रमणिका संरचनाएं बनाने की अनुमति देती है। यह `Redis` को कैश की गति पर एक वेक्टर डेटाबेस बनने की अनुमति देता है।

## वेक्टर डेटाबेस के रूप में Redis

`Redis` तेज़ अनुक्रमण के लिए संकुचित, उल्टे अनुक्रमणिकाओं का उपयोग करता है जिसमें कम मेमोरी फुटप्रिंट होता है। यह कई उन्नत सुविधाओं का भी समर्थन करता है जैसे:

* Redis हैश और `JSON` में एकाधिक क्षेत्रों का अनुक्रमण
* वेक्टर समानता खोज (के साथ `HNSW` (ANN) या `FLAT` (KNN))
* वेक्टर रेंज खोज (जैसे, सभी वेक्टरों को क्वेरी वेक्टर के एक त्रिज्या के भीतर खोजना)
* प्रदर्शन हानि के बिना वृद्धिशील अनुक्रमण
* दस्तावेज़ रैंकिंग ([tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) का उपयोग करके, वैकल्पिक उपयोगकर्ता-प्रदान किए गए भारों के साथ)
* क्षेत्र भारांकन
* `AND`, `OR`, और `NOT` ऑपरेटरों के साथ जटिल बूलियन क्वेरीज़
* उपसर्ग मिलान, धुंधला मिलान, और सटीक-फ्रेज़ क्वेरीज़
* [डबल-मैटाफोन ध्वन्यात्मक मिलान](https://redis.io/docs/stack/search/reference/phonetic_matching/) के लिए समर्थन
* ऑटो-पूर्ण सुझाव (धुंधले उपसर्ग सुझावों के साथ)
* [कई भाषाओं](https://redis.io/docs/stack/search/reference/stemming/) में स्टेमिंग-आधारित क्वेरी विस्तार ([Snowball](http://snowballstem.org/)) का उपयोग करके)
* चीनी-भाषा टोकनाइजेशन और क्वेरींग के लिए समर्थन ([Friso](https://github.com/lionsoul2014/friso)) का उपयोग करके)
* संख्यात्मक फ़िल्टर और श्रेणियाँ
* Redis भू-स्थानिक अनुक्रमण का उपयोग करके भू-स्थानिक खोजें
* एक शक्तिशाली समुच्चय इंजन
* सभी `utf-8` एन्कोडेड टेक्स्ट का समर्थन करता है
* पूर्ण दस्तावेज़, चयनित फ़ील्ड, या केवल दस्तावेज़ आईडी पुनः प्राप्त करें
* परिणामों को क्रमबद्ध करना (उदाहरण के लिए, निर्माण तिथि के अनुसार)

## क्लाइंट्स

चूंकि `Redis` सिर्फ एक वेक्टर डेटाबेस से कहीं अधिक है, इसलिए अक्सर ऐसे उपयोग के मामले होते हैं जो केवल `LangChain` एकीकरण के अलावा एक `Redis` क्लाइंट के उपयोग की मांग करते हैं। आप किसी भी मानक `Redis` क्लाइंट पुस्तकालय का उपयोग करके खोज और क्वेरी कमांड चला सकते हैं, लेकिन एक पुस्तकालय का उपयोग करना सबसे आसान है जो खोज और क्वेरी एपीआई को आवृत करता है। नीचे कुछ उदाहरण दिए गए हैं, लेकिन आप अधिक क्लाइंट पुस्तकालय [यहाँ](https://redis.io/resources/clients/) पा सकते हैं।

| प्रोजेक्ट | भाषा | लाइसेंस | लेखक | स्टार्स |
|----------|---------|--------|---------|-------|
| [jedis][jedis-url] | जावा | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | पायथन | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | पायथन | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/RedisVentures/redisvl
[redisvl-stars]: https://img.shields.io/github/stars/RedisVentures/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=Star&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000

## परिनियोजन विकल्प

RediSearch के साथ Redis को परिनियोजित करने के कई तरीके हैं। शुरुआत करने का सबसे आसान तरीका Docker का उपयोग करना है, लेकिन परिनियोजन के कई संभावित विकल्प हैं जैसे

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- क्लाउड मार्केटप्लेस: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa), [Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1), या [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- ऑन-प्रिमाइस: [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- Kubernetes: [Redis Enterprise Software on Kubernetes](https://docs.redis.com/latest/kubernetes/)

## अतिरिक्त उदाहरण

कई उदाहरण [Redis AI टीम के GitHub](https://github.com/RedisVentures/) में पाए जा सकते हैं

- [Awesome Redis AI Resources](https://github.com/RedisVentures/redis-ai-resources) - AI वर्कलोड्स में Redis का उपयोग करने के उदाहरणों की सूची
- [Azure OpenAI Embeddings Q&A](https://github.com/ruoccofabrizio/azure-open-ai-embeddings-qna) - Azure पर Q&A सेवा के रूप में OpenAI और Redis।
- [ArXiv Paper Search](https://github.com/RedisVentures/redis-arXiv-search) - arXiv विद्वान पत्रों पर सेमांटिक खोज
- [Vector Search on Azure](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-tutorial-vector-similarity) - Azure Cache for Redis और Azure OpenAI का उपयोग करके Azure पर वेक्टर खोज

## अधिक संसाधन

Redis को वेक्टर डेटाबेस के रूप में उपयोग करने के बारे में अधिक जानकारी के लिए, निम्नलिखित संसाधनों की जांच करें:

- [RedisVL Documentation](https://redisvl.com) - Redis Vector Library Client के लिए दस्तावेज़ीकरण
- [Redis Vector Similarity Docs](https://redis.io/docs/stack/search/reference/vectors/) - वेक्टर खोज के लिए Redis आधिकारिक दस्तावेज़।
- [Redis-py Search Docs](https://redis.readthedocs.io/en/latest/redismodules.html#redisearch-commands) - redis-py क्लाइंट पुस्तकालय के लिए दस्तावेज़ीकरण
- [Vector Similarity Search: From Basics to Production](https://mlops.community/vector-similarity-search-from-basics-to-production/) - VSS और Redis को एक वेक्टरडीबी के रूप में परिचयात्मक ब्लॉग पोस्ट।

## सेटअप करना

### Redis पायथन क्लाइंट इंस्टॉल करें

`Redis-py` Redis द्वारा आधिकारिक तौर पर समर्थित क्लाइंट है। हाल ही में जारी किया गया `RedisVL` क्लाइंट है जो वेक्टर डेटाबेस उपयोग मामलों के लिए विशेष रूप से निर्मित है। दोनों को pip के साथ इंस्टॉल किया जा सकता है।

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API Key प्राप्त करना होगा।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### Redis को लोकली परिनियोजित करें

Redis को लोकली परिनियोजित करने के लिए, चलाएं:

```console
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

यदि चीजें सही ढंग से चल रही हैं तो आपको `http://localhost:8001` पर एक अच्छा Redis UI देखना चाहिए। अन्य तरीकों से परिनियोजन के लिए ऊपर दिए गए [परिनियोजन विकल्प](#deployment-options) अनुभाग को देखें।

### Redis कनेक्शन Url योजनाएँ

मान्य Redis Url योजनाएँ हैं:
1. `redis://`  - Redis स्टैंडअलोन से कनेक्शन, बिना एन्क्रिप्शन
2. `rediss://` - Redis स्टैंडअलोन से कनेक्शन, TLS एन्क्रिप्शन के साथ
3. `redis+sentinel://`  - Redis सर्वर से Redis Sentinel के माध्यम से कनेक्शन, बिना एन्क्रिप्शन
4. `rediss+sentinel://` - Redis सर्वर से Redis Sentinel के माध्यम से कनेक्शन, दोनों कनेक्शन TLS एन्क्रिप्शन के साथ

अतिरिक्त कनेक्शन पैरामीटर के बारे में अधिक जानकारी [redis-py दस्तावेज़ीकरण](https://redis-py.readthedocs.io/en/stable/connections.html) में पाई जा सकती है।

```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### नमूना डेटा

पहले हम कुछ नमूना डेटा का वर्णन करेंगे ताकि Redis वेक्टर स्टोर के विभिन्न गुणों को प्रदर्शित किया जा सके।

```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
```

### Redis वेक्टर स्टोर बनाएं

Redis VectorStore इंस्टेंस को कई तरीकों से इनिशियलाइज़ किया जा सकता है। Redis VectorStore इंस्टेंस को इनिशियलाइज़ करने के लिए कई क्लास मेथड्स हैं।

- ``Redis.__init__`` - सीधे इनिशियलाइज़ करें
- ``Redis.from_documents`` - ``Langchain.docstore.Document`` ऑब्जेक्ट्स की एक सूची से इनिशियलाइज़ करें
- ``Redis.from_texts`` - टेक्स्ट की एक सूची से इनिशियलाइज़ करें (वैकल्पिक रूप से मेटाडेटा के साथ)
- ``Redis.from_texts_return_keys`` - टेक्स्ट की एक सूची से इनिशियलाइज़ करें (वैकल्पिक रूप से मेटाडेटा के साथ) और कुंजी लौटाएं
- ``Redis.from_existing_index`` - मौजूदा Redis इंडेक्स से इनिशियलाइज़ करें

नीचे हम ``Redis.from_texts`` मेथड का उपयोग करेंगे।

```python
from langchain_community.vectorstores.redis import Redis

rds = Redis.from_texts(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users",
)
```

```python
rds.index_name
```

```output
'users'
```

## बनाए गए इंडेक्स का निरीक्षण करना

एक बार ``Redis`` VectorStore ऑब्जेक्ट का निर्माण हो जाने के बाद, यदि Redis में पहले से इंडेक्स मौजूद नहीं था तो एक इंडेक्स बनाया जाएगा। इंडेक्स का निरीक्षण ``rvl`` और ``redis-cli`` कमांड लाइन टूल दोनों के साथ किया जा सकता है। यदि आपने ऊपर ``redisvl`` इंस्टॉल किया है, तो आप इंडेक्स का निरीक्षण करने के लिए ``rvl`` कमांड लाइन टूल का उपयोग कर सकते हैं।

```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall
```

```output
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   1. users
```

``Redis`` VectorStore कार्यान्वयन किसी भी मेटाडेटा के लिए इंडेक्स स्कीमा (फ़िल्टरिंग के लिए फ़ील्ड्स) उत्पन्न करने का प्रयास करेगा जो ``from_texts``, ``from_texts_return_keys``, और ``from_documents`` मेथड्स के माध्यम से पास किया गया है। इस प्रकार, जो भी मेटाडेटा पास किया जाएगा उसे Redis सर्च इंडेक्स में इंडेक्स किया जाएगा जिससे उन फ़ील्ड्स पर फ़िल्टरिंग संभव हो सके।

नीचे हम दिखाते हैं कि उपरोक्त परिभाषित मेटाडेटा से कौन-कौन से फ़ील्ड्स बनाए गए हैं।

```python
!rvl index info -i users
```

```output


Index Information:
╭──────────────┬────────────────┬───────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes      │ Index Options   │   Indexing │
├──────────────┼────────────────┼───────────────┼─────────────────┼────────────┤
│ users        │ HASH           │ ['doc:users'] │ []              │          0 │
╰──────────────┴────────────────┴───────────────┴─────────────────┴────────────╯
Index Fields:
╭────────────────┬────────────────┬─────────┬────────────────┬────────────────╮
│ Name           │ Attribute      │ Type    │ Field Option   │   Option Value │
├────────────────┼────────────────┼─────────┼────────────────┼────────────────┤
│ user           │ user           │ TEXT    │ WEIGHT         │              1 │
│ job            │ job            │ TEXT    │ WEIGHT         │              1 │
│ credit_score   │ credit_score   │ TEXT    │ WEIGHT         │              1 │
│ content        │ content        │ TEXT    │ WEIGHT         │              1 │
│ age            │ age            │ NUMERIC │                │                │
│ content_vector │ content_vector │ VECTOR  │                │                │
╰────────────────┴────────────────┴─────────┴────────────────┴────────────────╯
```

```python
!rvl stats -i users
```

```output

Statistics:
╭─────────────────────────────┬─────────────╮
│ Stat Key                    │ Value       │
├─────────────────────────────┼─────────────┤
│ num_docs                    │ 5           │
│ num_terms                   │ 15          │
│ max_doc_id                  │ 5           │
│ num_records                 │ 33          │
│ percent_indexed             │ 1           │
│ hash_indexing_failures      │ 0           │
│ number_of_uses              │ 4           │
│ bytes_per_record_avg        │ 4.60606     │
│ doc_table_size_mb           │ 0.000524521 │
│ inverted_sz_mb              │ 0.000144958 │
│ key_table_size_mb           │ 0.000193596 │
│ offset_bits_per_record_avg  │ 8           │
│ offset_vectors_sz_mb        │ 2.19345e-05 │
│ offsets_per_term_avg        │ 0.69697     │
│ records_per_doc_avg         │ 6.6         │
│ sortable_values_size_mb     │ 0           │
│ total_indexing_time         │ 0.32        │
│ total_inverted_index_blocks │ 16          │
│ vector_index_sz_mb          │ 6.0126      │
╰─────────────────────────────┴─────────────╯
```

यह ध्यान रखना महत्वपूर्ण है कि हमने यह निर्दिष्ट नहीं किया है कि मेटाडेटा में ``user``, ``job``, ``credit_score`` और ``age`` इंडेक्स में फ़ील्ड्स होने चाहिए, इसका कारण यह है कि ``Redis`` VectorStore ऑब्जेक्ट पास किए गए मेटाडेटा से स्वचालित रूप से इंडेक्स स्कीमा उत्पन्न करता है। इंडेक्स फ़ील्ड्स की उत्पत्ति के बारे में अधिक जानकारी के लिए, API दस्तावेज़ देखें।

## क्वेरी करना

आपके उपयोग केस के आधार पर ``Redis`` VectorStore कार्यान्वयन को क्वेरी करने के कई तरीके हैं:

- ``similarity_search``: दिए गए वेक्टर के सबसे समान वेक्टर खोजें।
- ``similarity_search_with_score``: दिए गए वेक्टर के सबसे समान वेक्टर खोजें और वेक्टर दूरी लौटाएं
- ``similarity_search_limit_score``: दिए गए वेक्टर के सबसे समान वेक्टर खोजें और परिणामों की संख्या को ``score_threshold`` तक सीमित करें
- ``similarity_search_with_relevance_scores``: दिए गए वेक्टर के सबसे समान वेक्टर खोजें और वेक्टर समानताएं लौटाएं
- ``max_marginal_relevance_search``: दिए गए वेक्टर के सबसे समान वेक्टर खोजें और साथ ही विविधता के लिए ऑप्टिमाइज़ करें

```python
results = rds.similarity_search("foo")
print(results[0].page_content)
```

```output
foo
```

```python
# return metadata
results = rds.similarity_search("foo", k=3)
meta = results[1].metadata
print("Key of the document in Redis: ", meta.pop("id"))
print("Metadata of the document: ", meta)
```

```output
Key of the document in Redis:  doc:users:a70ca43b3a4e4168bae57c78753a200f
Metadata of the document:  {'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}
```

```python
# with scores (distances)
results = rds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = rds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = rds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```

```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# limit scores (similarities have to be over .9)
results = rds.similarity_search_with_relevance_scores("foo", k=5, score_threshold=0.9)
for result in results:
    print(f"Content: {result[0].page_content} --- Similarity: {result[1]}")
```

```output
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
rds.add_texts(new_document, new_metadata)
```

```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```

```python
# now query the new document
results = rds.similarity_search("baz", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:b9c71d62a0a34241a37950b448dafd38', 'user': 'sam', 'job': 'janitor', 'credit_score': 'high', 'age': '50'}
```

```python
# use maximal marginal relevance search to diversify results
results = rds.max_marginal_relevance_search("foo")
```

```python
# the lambda_mult parameter controls the diversity of the results, the lower the more diverse
results = rds.max_marginal_relevance_search("foo", lambda_mult=0.1)
```

## मौजूदा इंडेक्स से कनेक्ट करें

``Redis`` VectorStore का उपयोग करते समय समान मेटाडेटा को इंडेक्स करने के लिए, आपको समान ``index_schema`` पास करना होगा, चाहे वह एक yaml फ़ाइल के पथ के रूप में हो या एक डिक्शनरी के रूप में। निम्नलिखित दर्शाता है कि इंडेक्स से स्कीमा कैसे प्राप्त करें और मौजूदा इंडेक्स से कनेक्ट करें।

```python
# write the schema to a yaml file
rds.write_schema("redis_schema.yaml")
```

इस उदाहरण के लिए स्कीमा फ़ाइल कुछ इस प्रकार दिखनी चाहिए:

```yaml
numeric:
- name: age
  no_index: false
  sortable: false
text:
- name: user
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: job
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: credit_score
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: content
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
vector:
- algorithm: FLAT
  block_size: 1000
  datatype: FLOAT32
  dims: 1536
  distance_metric: COSINE
  initial_cap: 20000
  name: content_vector
```

**ध्यान दें**, इसमें स्कीमा के लिए **सभी** संभावित फ़ील्ड्स शामिल हैं। आप किसी भी फ़ील्ड को हटा सकते हैं जिसकी आपको आवश्यकता नहीं है।

```python
# now we can connect to our existing index as follows

new_rds = Redis.from_existing_index(
    embeddings,
    index_name="users",
    redis_url="redis://localhost:6379",
    schema="redis_schema.yaml",
)
results = new_rds.similarity_search("foo", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:8484c48a032d4c4cbe3cc2ed6845fabb', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}
```

```python
# see the schemas are the same
new_rds.schema == rds.schema
```

```output
True
```

## कस्टम मेटाडेटा इंडेक्सिंग

कुछ मामलों में, आप यह नियंत्रित करना चाह सकते हैं कि मेटाडेटा किस फ़ील्ड्स से मैप होता है। उदाहरण के लिए, आप चाहते हैं कि ``credit_score`` फ़ील्ड एक श्रेणीबद्ध फ़ील्ड हो बजाय एक टेक्स्ट फ़ील्ड (जो सभी स्ट्रिंग फ़ील्ड्स के लिए डिफ़ॉल्ट व्यवहार है)। इस मामले में, आप ऊपर दिए गए प्रत्येक इनिशियलाइज़ेशन मेथड्स में ``index_schema`` पैरामीटर का उपयोग करके इंडेक्स के लिए स्कीमा निर्दिष्ट कर सकते हैं। कस्टम इंडेक्स स्कीमा या तो एक डिक्शनरी के रूप में पास किए जा सकते हैं या YAML फ़ाइल के पथ के रूप में।

स्कीमा में सभी तर्कों के डिफ़ॉल्ट होते हैं सिवाय नाम के, इसलिए आप केवल उन फ़ील्ड्स को निर्दिष्ट कर सकते हैं जिन्हें आप बदलना चाहते हैं। सभी नाम उन तर्कों के साँप/लोअरकेस संस्करणों से मेल खाते हैं जिन्हें आप ``redis-cli`` या ``redis-py`` के साथ कमांड लाइन पर उपयोग करेंगे। प्रत्येक फ़ील्ड के तर्कों पर अधिक जानकारी के लिए, [दस्तावेज़](https://redis.io/docs/interact/search-and-query/basic-constructs/field-and-type-options/) देखें।

नीचे दिया गया उदाहरण दिखाता है कि ``credit_score`` फ़ील्ड को एक टैग (श्रेणीबद्ध) फ़ील्ड के रूप में कैसे निर्दिष्ट किया जाए बजाय एक टेक्स्ट फ़ील्ड के।

```yaml
# index_schema.yml
tag:
    - name: credit_score
text:
    - name: user
    - name: job
numeric:
    - name: age
```

Python में, यह कुछ इस प्रकार दिखेगा:

```python

index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

```

ध्यान दें कि केवल ``name`` फ़ील्ड को निर्दिष्ट करने की आवश्यकता है। बाकी सभी फ़ील्ड्स के डिफ़ॉल्ट होते हैं।

```python
# create a new index with the new schema defined above
index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

rds, keys = Redis.from_texts_return_keys(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users_modified",
    index_schema=index_schema,  # pass in the new index schema
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'credit_score'}], 'text': [{'name': 'user'}, {'name': 'job'}], 'numeric': [{'name': 'age'}]}
generated_schema: {'text': [{'name': 'user'}, {'name': 'job'}, {'name': 'credit_score'}], 'numeric': [{'name': 'age'}], 'tag': []}
```

उपरोक्त चेतावनी का उद्देश्य उपयोगकर्ताओं को जब वे डिफ़ॉल्ट व्यवहार को ओवरराइड कर रहे होते हैं, सूचित करना होता है। यदि आप जानबूझकर व्यवहार को ओवरराइड कर रहे हैं तो इसे अनदेखा करें।

## हाइब्रिड फ़िल्टरिंग

LangChain में निर्मित Redis फ़िल्टर एक्सप्रेशन भाषा के साथ, आप हाइब्रिड फ़िल्टर की मनमानी लंबी चेन बना सकते हैं जिनका उपयोग आप अपने सर्च परिणामों को फ़िल्टर करने के लिए कर सकते हैं। एक्सप्रेशन भाषा [RedisVL एक्सप्रेशन सिंटैक्स](https://redisvl.com) से व्युत्पन्न होती है और उपयोग करने और समझने में आसान होने के लिए डिज़ाइन की गई है।

निम्नलिखित उपलब्ध फ़िल्टर प्रकार हैं:
- ``RedisText``: मेटाडेटा फ़ील्ड्स के खिलाफ पूर्ण-टेक्स्ट सर्च द्वारा फ़िल्टर करें। सटीक, फजी, और वाइल्डकार्ड मिलान का समर्थन करता है।
- ``RedisNum``: मेटाडेटा फ़ील्ड्स के खिलाफ संख्यात्मक सीमा द्वारा फ़िल्टर करें।
- ``RedisTag``: स्ट्रिंग-आधारित श्रेणीबद्ध मेटाडेटा फ़ील्ड्स के खिलाफ सटीक मिलान द्वारा फ़िल्टर करें। कई टैग निर्दिष्ट किए जा सकते हैं जैसे "tag1,tag2,tag3"।

निम्नलिखित इन फ़िल्टरों का उपयोग करने के उदाहरण हैं।

```python

from langchain_community.vectorstores.redis import RedisText, RedisNum, RedisTag

# exact matching
has_high_credit = RedisTag("credit_score") == "high"
does_not_have_high_credit = RedisTag("credit_score") != "low"

# fuzzy matching
job_starts_with_eng = RedisText("job") % "eng*"
job_is_engineer = RedisText("job") == "engineer"
job_is_not_engineer = RedisText("job") != "engineer"

# numeric filtering
age_is_18 = RedisNum("age") == 18
age_is_not_18 = RedisNum("age") != 18
age_is_greater_than_18 = RedisNum("age") > 18
age_is_less_than_18 = RedisNum("age") < 18
age_is_greater_than_or_equal_to_18 = RedisNum("age") >= 18
age_is_less_than_or_equal_to_18 = RedisNum("age") <= 18

```

``RedisFilter`` क्लास का उपयोग इन फ़िल्टरों के इम्पोर्ट को सरल बनाने के लिए किया जा सकता है जैसा कि निम्नलिखित है:

```python

from langchain_community.vectorstores.redis import RedisFilter

# same examples as above
has_high_credit = RedisFilter.tag("credit_score") == "high"
does_not_have_high_credit = RedisFilter.num("age") > 8
job_starts_with_eng = RedisFilter.text("job") % "eng*"
```

निम्नलिखित खोज के लिए हाइब्रिड फ़िल्टर का उपयोग करने के उदाहरण हैं:

```python
from langchain_community.vectorstores.redis import RedisText

is_engineer = RedisText("job") == "engineer"
results = rds.similarity_search("foo", k=3, filter=is_engineer)

print("Job:", results[0].metadata["job"])
print("Engineers in the dataset:", len(results))
```

```output
Job: engineer
Engineers in the dataset: 2
```

```python
# fuzzy match
starts_with_doc = RedisText("job") % "doc*"
results = rds.similarity_search("foo", k=3, filter=starts_with_doc)

for result in results:
    print("Job:", result.metadata["job"])
print("Jobs in dataset that start with 'doc':", len(results))
```

```output
Job: doctor
Job: doctor
Jobs in dataset that start with 'doc': 2
```

```python
from langchain_community.vectorstores.redis import RedisNum

is_over_18 = RedisNum("age") > 18
is_under_99 = RedisNum("age") < 99
age_range = is_over_18 & is_under_99
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

```python
# make sure to use parenthesis around FilterExpressions
# if initializing them while constructing them
age_range = (RedisNum("age") > 18) & (RedisNum("age") < 99)
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

## Redis को रिट्रीवर के रूप में प्रयोग करें

यहाँ हम वेक्टर स्टोर को रिट्रीवर के रूप में उपयोग करने के विभिन्न विकल्पों पर चर्चा करते हैं।

रिट्रीवल करने के लिए हम तीन अलग-अलग सर्च मेथड्स का उपयोग कर सकते हैं। डिफ़ॉल्ट रूप से, यह सिमेंटिक सिमिलेरिटी का उपयोग करेगा।

```python
query = "foo"
results = rds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```

```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = rds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```

यहाँ `similarity_distance_threshold` रिट्रीवर भी है जो उपयोगकर्ता को वेक्टर दूरी निर्दिष्ट करने की अनुमति देता है।

```python
retriever = rds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

अंत में, ``similarity_score_threshold`` उपयोगकर्ता को समान दस्तावेजों के लिए न्यूनतम स्कोर परिभाषित करने की अनुमति देता है।

```python
retriever = rds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

```python
retriever = rds.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "k": 4, "lambda_mult": 0.1}
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```

## कुंजी और इंडेक्स हटाएं

अपनी प्रविष्टियों को हटाने के लिए आपको उन्हें उनकी कुंजी द्वारा संबोधित करना होगा।

```python
Redis.delete(keys, redis_url="redis://localhost:6379")
```

```output
True
```

```python
# delete the indices too
Redis.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
Redis.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```

```output
True
```
