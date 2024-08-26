---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) एक वितरित, RESTful खोज और विश्लेषण इंजन है। यह एक वितरित, बहु-किराएदार-क्षमता वाला पूर्ण-पाठ खोज इंजन प्रदान करता है जिसमें एक HTTP वेब इंटरफ़ेस और स्कीमा-मुक्त JSON दस्तावेज़ होते हैं। यह कीवर्ड खोज, वेक्टर खोज, हाइब्रिड खोज और जटिल फ़िल्टरिंग का समर्थन करता है।

`ElasticsearchRetriever` एक सामान्य रैपर है जो [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) के माध्यम से सभी `Elasticsearch` सुविधाओं तक लचीली पहुंच प्रदान करता है। अधिकांश उपयोग मामलों में अन्य वर्ग (`ElasticsearchStore`, `ElasticsearchEmbeddings` आदि) पर्याप्त होंगे, लेकिन अगर वे नहीं हैं, तो आप `ElasticsearchRetriever` का उपयोग कर सकते हैं।

```python
%pip install --upgrade --quiet elasticsearch langchain-elasticsearch
```

```python
from typing import Any, Dict, Iterable

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from langchain.embeddings import DeterministicFakeEmbedding
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_elasticsearch import ElasticsearchRetriever
```

## कॉन्फ़िगर करें

यहां हम Elasticsearch से कनेक्शन को परिभाषित करते हैं। इस उदाहरण में हम स्थानीय रूप से चल रहे एक उदाहरण का उपयोग करते हैं। वैकल्पिक रूप से, आप [Elastic Cloud](https://cloud.elastic.co/) में एक खाता बना सकते हैं और एक [मुफ्त ट्रायल](https://www.elastic.co/cloud/cloud-trial-overview) शुरू कर सकते हैं।

```python
es_url = "http://localhost:9200"
es_client = Elasticsearch(hosts=[es_url])
es_client.info()
```

वेक्टर खोज के लिए, हम केवल उदाहरण के लिए यादृच्छिक एम्बेडिंग का उपयोग करने जा रहे हैं। वास्तविक उपयोग मामलों के लिए, LangChain के उपलब्ध `Embeddings` वर्गों में से एक का चयन करें।

```python
embeddings = DeterministicFakeEmbedding(size=3)
```

## उदाहरण डेटा को परिभाषित करें

```python
index_name = "test-langchain-retriever"
text_field = "text"
dense_vector_field = "fake_embedding"
num_characters_field = "num_characters"
texts = [
    "foo",
    "bar",
    "world",
    "hello world",
    "hello",
    "foo bar",
    "bla bla foo",
]
```

## डेटा इंडेक्स करें

आमतौर पर, उपयोगकर्ता तब `ElasticsearchRetriever` का उपयोग करते हैं जब उनके पास पहले से ही Elasticsearch इंडेक्स में डेटा होता है। यहां हम कुछ उदाहरण पाठ दस्तावेज़ों को इंडेक्स करते हैं। अगर आपने `ElasticsearchStore.from_documents` का उपयोग करके एक इंडेक्स बनाया है, तो वह भी ठीक है।

```python
def create_index(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    num_characters_field: str,
):
    es_client.indices.create(
        index=index_name,
        mappings={
            "properties": {
                text_field: {"type": "text"},
                dense_vector_field: {"type": "dense_vector"},
                num_characters_field: {"type": "integer"},
            }
        },
    )


def index_data(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    embeddings: Embeddings,
    texts: Iterable[str],
    refresh: bool = True,
) -> None:
    create_index(
        es_client, index_name, text_field, dense_vector_field, num_characters_field
    )

    vectors = embeddings.embed_documents(list(texts))
    requests = [
        {
            "_op_type": "index",
            "_index": index_name,
            "_id": i,
            text_field: text,
            dense_vector_field: vector,
            num_characters_field: len(text),
        }
        for i, (text, vector) in enumerate(zip(texts, vectors))
    ]

    bulk(es_client, requests)

    if refresh:
        es_client.indices.refresh(index=index_name)

    return len(requests)
```

```python
index_data(es_client, index_name, text_field, dense_vector_field, embeddings, texts)
```

```output
7
```

## उपयोग उदाहरण

### वेक्टर खोज

इस उदाहरण में नकली एम्बेडिंग का उपयोग करके घनत्व वेक्टर पुनर्प्राप्ति।

```python
def vector_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "knn": {
            "field": dense_vector_field,
            "query_vector": vector,
            "k": 5,
            "num_candidates": 10,
        }
    }


vector_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=vector_query,
    content_field=text_field,
    url=es_url,
)

vector_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 1.0, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 0.6770179, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 0.4816144, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 0.46853775, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.2086992, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}})]
```

### BM25

पारंपरिक कीवर्ड मैचिंग।

```python
def bm25_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: search_query,
            },
        },
    }


bm25_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=bm25_query,
    content_field=text_field,
    url=es_url,
)

bm25_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### हाइब्रिड खोज

[reciprocal rank fusion](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html) (RRF) का उपयोग करके वेक्टर खोज और BM25 खोज के परिणाम सेट को संयुक्त करना।

```python
def hybrid_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "query": {
            "match": {
                text_field: search_query,
            },
        },
        "knn": {
            "field": dense_vector_field,
            "query_vector": vector,
            "k": 5,
            "num_candidates": 10,
        },
        "rank": {"rrf": {}},
    }


hybrid_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=hybrid_query,
    content_field=text_field,
    url=es_url,
)

hybrid_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### फ़्यूज़ी मैचिंग

टाइपो सहिष्णुता के साथ कीवर्ड मैचिंग।

```python
def fuzzy_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: {
                    "query": search_query,
                    "fuzziness": "AUTO",
                }
            },
        },
    }


fuzzy_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=fuzzy_query,
    content_field=text_field,
    url=es_url,
)

fuzzy_retriever.invoke("fox")  # note the character tolernace
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.6474311, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.49580228, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.40171927, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### जटिल फ़िल्टरिंग

विभिन्न फ़ील्डों पर फ़िल्टर का संयोजन।

```python
def filter_query_func(search_query: str) -> Dict:
    return {
        "query": {
            "bool": {
                "must": [
                    {"range": {num_characters_field: {"gte": 5}}},
                ],
                "must_not": [
                    {"prefix": {text_field: "bla"}},
                ],
                "should": [
                    {"match": {text_field: search_query}},
                ],
            }
        }
    }


filtering_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    content_field=text_field,
    url=es_url,
)

filtering_retriever.invoke("foo")
```

```output
[Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 1.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 1.0, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 1.0, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 1.0, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}})]
```

ध्यान दें कि क्वेरी मैच सबसे ऊपर है। अन्य दस्तावेज़ जो फ़िल्टर को पार कर गए हैं, वे भी परिणाम सेट में हैं, लेकिन उनके सभी स्कोर समान हैं।

### कस्टम दस्तावेज़ मैपर

यह संभव है कि एक Elasticsearch परिणाम (hit) को एक LangChain दस्तावेज़ में मैप करने वाली फ़ंक्शन को कस्टमाइज़ किया जाए।

```python
def num_characters_mapper(hit: Dict[str, Any]) -> Document:
    num_chars = hit["_source"][num_characters_field]
    content = hit["_source"][text_field]
    return Document(
        page_content=f"This document has {num_chars} characters",
        metadata={"text_content": content},
    )


custom_mapped_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    document_mapper=num_characters_mapper,
    url=es_url,
)

custom_mapped_retriever.invoke("foo")
```

```output
[Document(page_content='This document has 7 characters', metadata={'text_content': 'foo bar'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'world'}),
 Document(page_content='This document has 11 characters', metadata={'text_content': 'hello world'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'hello'})]
```
